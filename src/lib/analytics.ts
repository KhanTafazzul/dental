import { getAdminSupabase } from '@/lib/supabase'
import { unstable_cache } from 'next/cache'

export interface FinancialAnalyticsResult {
  totalRevenue: number
  doctorPayrollTotal: number
  helperSalariesTotal: number
  electricityTotal: number
  extraExpensesTotal: number
  netClinicProfit: number
  monthlyChartData: Array<{
    month_year: string
    label: string
    revenue: number
    expenses: number
    netProfit: number
  }>
  doctorSummaries: Array<{
    id: string
    name: string
    specialty: string
    grossRevenue: number
    netEarnings: number
    treatmentCount: number
  }>
}

export interface InventoryStatsResult {
  totalItems: number
  totalStockUnits: number
  totalValuation: number
  lowStockCount: number
}

// Helper: Calculate working days in month excluding Sundays if disabled
function getWorkingDaysInMonth(year: number, month: number, includeSunday: boolean): number {
  const daysInMonth = new Date(year, month, 0).getDate()
  let workingDays = 0
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month - 1, d).getDay()
    if (dayOfWeek === 0 && !includeSunday) continue
    workingDays++
  }
  return workingDays
}

async function computeServerFinancialAnalytics(
  selectedBranch: string = 'all',
  selectedYear: number = new Date().getFullYear()
): Promise<FinancialAnalyticsResult> {

  const adminDb = getAdminSupabase()

  // 1. Parallel fetch required columns only (Over-fetching prevention)
  const [
    branchesRes,
    doctorsRes,
    helpersRes,
    helperAttRes,
    elecRes,
    extraRes,
    apptRes
  ] = await Promise.all([
    adminDb.from('branches').select('id, name, slug'),
    adminDb.from('doctors').select('id, name, slug, specialty, compensation_type, fixed_salary, profit_percentage, profit_sharing_target, branch_id'),
    adminDb.from('helper_boys').select('id, name, shift_1_rate, shift_2_rate, shift_1_enabled, shift_2_enabled, sunday_enabled, branch_id'),
    adminDb.from('helper_attendance').select('helper_boy_id, date, shift, status'),
    adminDb.from('monthly_expenses').select('id, month_year, electricity_bill, branch_id'),
    adminDb.from('extra_expenses').select('id, amount, note, expense_date, branch_id'),
    adminDb.from('appointments').select(`
      id,
      appointment_date,
      status,
      doctor_id,
      branch_id,
      doctors (id, name, branch_id),
      branches (id, name, slug),
      invoices (
        id,
        total,
        subtotal
      )
    `).eq('status', 'completed')
  ])

  const branches = branchesRes.data || []
  const doctors = doctorsRes.data || []
  const helperBoys = helpersRes.data || []
  const helperAttendance = helperAttRes.data || []
  const electricityExpenses = elecRes.data || []
  const extraExpenses = extraRes.data || []
  const appointments = apptRes.data || []

  // Filter branches if selectedBranch !== 'all'
  const activeBranchIds = selectedBranch === 'all'
    ? branches.map(b => b.id)
    : branches.filter(b => b.slug === selectedBranch).map(b => b.id)

  // 2. Compute Monthly Map
  const monthMap: Record<string, { revenue: number; expenses: number; netProfit: number }> = {}
  
  // Initialize months of the selected year
  for (let m = 1; m <= 12; m++) {
    const key = `${selectedYear}-${String(m).padStart(2, '0')}`
    monthMap[key] = { revenue: 0, expenses: 0, netProfit: 0 }
  }

  // Aggregate Revenue from Appointments
  let grandRevenue = 0
  const doctorRevenueMap: Record<string, { gross: number; count: number }> = {}

  appointments.forEach(appt => {
    if (!appt.appointment_date) return
    const apptBranchId = appt.branch_id || (Array.isArray(appt.branches) ? appt.branches[0]?.id : appt.branches?.id)
    if (selectedBranch !== 'all' && !activeBranchIds.includes(apptBranchId)) return

    const dateStr = appt.appointment_date
    const monthKey = dateStr.substring(0, 7)
    
    let invTotal = 0
    if (appt.invoices) {
      if (Array.isArray(appt.invoices)) {
        invTotal = appt.invoices.reduce((sum: number, inv: any) => sum + Number(inv.total || 0), 0)
      } else {
        invTotal = Number(appt.invoices.total || 0)
      }
    }

    grandRevenue += invTotal
    if (monthMap[monthKey]) {
      monthMap[monthKey].revenue += invTotal
    }

    const docId = appt.doctor_id || (Array.isArray(appt.doctors) ? appt.doctors[0]?.id : appt.doctors?.id)
    if (docId) {
      if (!doctorRevenueMap[docId]) doctorRevenueMap[docId] = { gross: 0, count: 0 }
      doctorRevenueMap[docId].gross += invTotal
      doctorRevenueMap[docId].count += 1
    }
  })

  // Aggregate Electricity Expenses
  let grandElectricity = 0
  electricityExpenses.forEach(elec => {
    if (selectedBranch !== 'all' && !activeBranchIds.includes(elec.branch_id)) return
    const amount = Number(elec.electricity_bill || 0)
    grandElectricity += amount
    if (monthMap[elec.month_year]) {
      monthMap[elec.month_year].expenses += amount
    }
  })

  // Aggregate Extra Expenses
  let grandExtraExpenses = 0
  extraExpenses.forEach(ex => {
    if (selectedBranch !== 'all' && !activeBranchIds.includes(ex.branch_id)) return
    const amount = Number(ex.amount || 0)
    const dateStr = ex.expense_date ? ex.expense_date.substring(0, 7) : ''
    grandExtraExpenses += amount
    if (monthMap[dateStr]) {
      monthMap[dateStr].expenses += amount
    }
  })

  // Aggregate Helper Salaries
  let grandHelperSalaries = 0
  const activeHelpers = helperBoys.filter(h => selectedBranch === 'all' || activeBranchIds.includes(h.branch_id))
  
  Object.keys(monthMap).forEach(mKey => {
    const [yStr, mStr] = mKey.split('-')
    const year = parseInt(yStr, 10)
    const month = parseInt(mStr, 10)

    const monthlyHelperTotal = activeHelpers.reduce((sum, h) => {
      const workingDays = getWorkingDaysInMonth(year, month, h.sunday_enabled)
      const hAbsences = helperAttendance.filter(a => {
        if (a.helper_boy_id !== h.id || (a.status !== 'absent' && a.status !== 'half_day')) return false
        return a.date && a.date.substring(0, 7) === mKey
      })
      const shift1Abs = hAbsences.filter(a => a.shift === 1).reduce((acc: number, curr: any) => acc + (curr.status === 'half_day' ? 0.5 : 1.0), 0)
      const shift2Abs = hAbsences.filter(a => a.shift === 2).reduce((acc: number, curr: any) => acc + (curr.status === 'half_day' ? 0.5 : 1.0), 0)
      const shift1Worked = h.shift_1_enabled ? Math.max(0, workingDays - shift1Abs) : 0
      const shift2Worked = h.shift_2_enabled ? Math.max(0, workingDays - shift2Abs) : 0
      const basePay = (shift1Worked * Number(h.shift_1_rate || 0)) + (shift2Worked * Number(h.shift_2_rate || 0))
      return sum + basePay
    }, 0)

    grandHelperSalaries += monthlyHelperTotal
    monthMap[mKey].expenses += monthlyHelperTotal
  })

  // Aggregate Doctor Summaries & Payroll
  let grandDoctorPayroll = 0
  const doctorSummaries = doctors
    .filter(d => selectedBranch === 'all' || activeBranchIds.includes(d.branch_id))
    .map(doc => {
      const stats = doctorRevenueMap[doc.id] || { gross: 0, count: 0 }
      let netEarn = 0
      if (doc.compensation_type === 'fixed') {
        netEarn = Number(doc.fixed_salary || 0)
      } else {
        const pct = Number(doc.profit_percentage || 0) / 100
        netEarn = Math.round(stats.gross * pct)
      }
      grandDoctorPayroll += netEarn
      return {
        id: doc.id,
        name: doc.name,
        specialty: doc.specialty,
        grossRevenue: stats.gross,
        netEarnings: netEarn,
        treatmentCount: stats.count
      }
    })

  // Final Net Profit
  const netClinicProfit = grandRevenue - (grandDoctorPayroll + grandHelperSalaries + grandElectricity + grandExtraExpenses)

  // Format Chart Data
  const monthlyChartData = Object.keys(monthMap).map(mKey => {
    const [yStr, mStr] = mKey.split('-')
    const dateObj = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 1, 1)
    const label = dateObj.toLocaleString('en-US', { month: 'short' })
    const rev = monthMap[mKey].revenue
    const exp = monthMap[mKey].expenses
    return {
      month_year: mKey,
      label,
      revenue: rev,
      expenses: exp,
      netProfit: rev - exp
    }
  })

  return {
    totalRevenue: grandRevenue,
    doctorPayrollTotal: grandDoctorPayroll,
    helperSalariesTotal: grandHelperSalaries,
    electricityTotal: grandElectricity,
    extraExpensesTotal: grandExtraExpenses,
    netClinicProfit,
    monthlyChartData,
    doctorSummaries
  }
}

export const fetchServerFinancialAnalytics = unstable_cache(
  async (selectedBranch: string = 'all', selectedYear: number = new Date().getFullYear()) => {
    return computeServerFinancialAnalytics(selectedBranch, selectedYear)
  },
  ['financial-analytics-cache-key'],
  { tags: ['financial-analytics'], revalidate: 300 }
)

async function computeServerInventoryStats(branchSlug: string = 'hazara'): Promise<InventoryStatsResult> {
  const adminDb = getAdminSupabase()
  const { data: items } = await adminDb
    .from('inventory_items')
    .select('id, stock, min_threshold, purchase_price, branch_slug')
    .or(`branch_slug.eq.${branchSlug},branch_slug.is.null`)

  const itemList = items || []
  let totalStockUnits = 0
  let totalValuation = 0
  let lowStockCount = 0

  itemList.forEach(item => {
    const stock = Number(item.stock || 0)
    const price = Number(item.purchase_price || 0)
    const minThresh = Number(item.min_threshold || 5)

    totalStockUnits += stock
    totalValuation += (stock * price)
    if (stock <= minThresh) lowStockCount++
  })

  return {
    totalItems: itemList.length,
    totalStockUnits,
    totalValuation,
    lowStockCount
  }
}

export const fetchServerInventoryStats = unstable_cache(
  async (branchSlug: string = 'hazara') => {
    return computeServerInventoryStats(branchSlug)
  },
  ['inventory-stats-cache-key'],
  { tags: ['inventory-stats'], revalidate: 300 }
)

