'use client'


import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, TrendingUp, DollarSign, Activity, Sparkles, ShieldCheck, ArrowUpRight, BarChart3 } from 'lucide-react'
import { FinancialAnalyticsResult } from '@/lib/analytics'

interface AnalyticsTabProps {
  appointments: any[]
  electricityExpenses: any[]
  helperBoys: any[]
  helperAttendance: any[]
  extraExpenses: any[]
  doctors: any[]
  doctorAttendance: any[]
  selectedBranch: string
  branches: any[]
  initialAnalytics?: FinancialAnalyticsResult
}

function getAppointmentFinances(appt: any) {
  const invoice = appt.invoices?.[0]
  if (!invoice) return null
  const treatmentDiscount = invoice.treatment_discount_percentage ?? invoice.discount_percentage ?? 0
  const medicineDiscount = invoice.medicine_discount_percentage ?? invoice.discount_percentage ?? 0

  const treatmentDiscountMultiplier = 1 - treatmentDiscount / 100
  const medicineDiscountMultiplier = 1 - medicineDiscount / 100
  let tRev = 0, tCost = 0, mRev = 0, mCost = 0

  if (invoice.invoice_items) {
    invoice.invoice_items.forEach((item: any) => {
      const p = Number(item.unit_price || 0) * Number(item.quantity || 1)
      const c = Number(item.unit_cost || 0) * Number(item.quantity || 1)
      const isMedicine = item.item_type === 'medicine' || (item.custom_name && /medicine|tab|capsule|syrup|strip/i.test(item.custom_name))
      if (isMedicine) {
        mRev += p; mCost += c;
      } else {
        tRev += p; tCost += c;
      }
    })
  }

  const netT = tRev * treatmentDiscountMultiplier
  const netM = mRev * medicineDiscountMultiplier
  return {
    netTreatmentRevenue: netT, treatmentCost: tCost, treatmentProfit: netT - tCost,
    netMedicineRevenue: netM, medicineCost: mCost, medicineProfit: netM - mCost,
    totalProfit: (netT - tCost) + (netM - mCost), totalPaid: invoice.total
  }
}

// Utility to count working days in a month
function getWorkingDaysInMonth(year: number, month: number, includeSundays: boolean) {
  let count = 0
  const date = new Date(year, month - 1, 1)
  while (date.getMonth() === month - 1) {
    const dayOfWeek = date.getDay()
    if (dayOfWeek !== 0 || includeSundays) {
      count++
    }
    date.setDate(date.getDate() + 1)
  }
  return count
}

export default function AnalyticsTab({
  appointments, electricityExpenses, helperBoys, helperAttendance, extraExpenses, doctors, doctorAttendance, selectedBranch, branches, initialAnalytics
}: AnalyticsTabProps) {

  // Aggregate Data by Month
  const monthlyData = useMemo(() => {
    if (initialAnalytics?.monthlyChartData && selectedBranch === 'all') {
      return initialAnalytics.monthlyChartData.map(d => ({
        month: d.label,
        revenue: d.revenue,
        expenses: d.expenses,
        netProfit: d.netProfit,
        treatmentProfit: Math.round(d.revenue * 0.6),
        medicineProfit: Math.round(d.revenue * 0.4)
      }))
    }

    const dataMap: Record<string, any> = {}

    appointments.forEach(appt => {
      const d = new Date(appt.appointment_date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!dataMap[key]) dataMap[key] = { month: key, revenue: 0, treatmentProfit: 0, medicineProfit: 0, expenses: 0, netProfit: 0, appts: [] }
      
      if (selectedBranch === 'all' || appt.branches?.slug === selectedBranch) {
        dataMap[key].appts.push(appt)
      }
    })

    Object.keys(dataMap).forEach(key => {
      let tProf = 0, mProf = 0
      dataMap[key].appts.forEach((a: any) => {
        const fin = getAppointmentFinances(a)
        if (fin) {
          tProf += fin.treatmentProfit
          mProf += fin.medicineProfit
        }
      })
      dataMap[key].treatmentProfit = Math.round(tProf)
      dataMap[key].medicineProfit = Math.round(mProf)
      dataMap[key].revenue = Math.round(tProf + mProf)
    })

    extraExpenses.forEach(ex => {
      const d = new Date(ex.expense_date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (dataMap[key]) {
        if (selectedBranch === 'all' || (doctors.find(doc => doc.branch_id === ex.branch_id && doc.branches?.slug === selectedBranch))) {
          dataMap[key].expenses += Math.round(ex.amount || 0)
        }
      }
    })

    Object.keys(dataMap).forEach(key => {
      dataMap[key].netProfit = dataMap[key].revenue - dataMap[key].expenses
    })

    const sorted = Object.values(dataMap).sort((a, b) => a.month.localeCompare(b.month))
    return sorted
  }, [appointments, electricityExpenses, extraExpenses, selectedBranch, doctors, branches, helperBoys, helperAttendance, doctorAttendance, initialAnalytics])

  // Revenue Breakdown (Medicine vs Treatment)
  const revenueBreakdown = useMemo(() => {
    let t = 0, m = 0
    appointments.forEach(appt => {
      if (selectedBranch !== 'all' && appt.branches?.slug !== selectedBranch) return
      const fin = getAppointmentFinances(appt)
      if (fin) {
        t += fin.treatmentProfit
        m += fin.medicineProfit
      }
    })
    const total = (t + m) || 1
    return {
      treatmentProfit: Math.round(t),
      treatmentPercent: Math.round((t / total) * 100),
      medicineProfit: Math.round(m),
      medicinePercent: Math.round((m / total) * 100),
      totalProfit: Math.round(t + m)
    }
  }, [appointments, selectedBranch])

  const maxRevenue = useMemo(() => {
    const max = Math.max(...monthlyData.map(d => Math.max(d.revenue, d.expenses, d.netProfit)), 1)
    return max
  }, [monthlyData])

  return (
    <div className="perspective-stage space-y-8 font-sans">
      
      {/* ═══ FINANCIAL OVERVIEW GRID (ROW 1) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Monthly Net Profit Trajectory */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
          className="p-6 md:p-7 rounded-[24px] bg-white border border-[#E4E7D3] shadow-sm space-y-6 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-[#F4F6F0] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E4E7D3] text-[#4A5D23] flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2C3325] leading-tight" style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}>
                  Monthly Net Profit Trajectory
                </h3>
                <p className="text-[10px] text-[#8A9380] font-medium uppercase tracking-wider">
                  Live revenue minus operational expenses
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-[#E4E7D3] border border-[#4A5D23]/20 rounded-full text-[10px] font-bold text-[#4A5D23] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#4A5D23] animate-pulse" />
              Live Audit
            </span>
          </div>

          <div className="space-y-4">
            {monthlyData.length === 0 ? (
              <p className="text-xs text-[#8A9380] text-center py-8">No monthly financial records logged.</p>
            ) : (
              monthlyData.map((d, i) => {
                const percent = Math.min(100, Math.max(5, Math.round((d.netProfit / maxRevenue) * 100)))
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-semibold text-[#2C3325]">{d.month}</span>
                      <span className="font-mono font-bold text-[#4A5D23]">₹{d.netProfit.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-[#F4F6F0] rounded-full overflow-hidden border border-[#E4E7D3]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="h-full bg-gradient-to-r from-[#4A5D23] to-[#6B823E] rounded-full"
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>

        {/* Profit Distribution Split */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
          className="p-6 md:p-7 rounded-[24px] bg-white border border-[#E4E7D3] shadow-sm space-y-6 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-[#F4F6F0] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E4E7D3] text-[#4A5D23] flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2C3325] leading-tight" style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}>
                  Profit Distribution Split
                </h3>
                <p className="text-[10px] text-[#8A9380] font-medium uppercase tracking-wider">
                  Medicine Stock vs Clinical Procedure Profit
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-[#E4E7D3] border border-[#4A5D23]/20 rounded-full text-[10px] font-bold text-[#4A5D23] uppercase tracking-wider flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-[#4A5D23]" />
              Ratio Audit
            </span>
          </div>

          <div className="space-y-6 py-2">
            {/* Treatment Profit Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#2C3325] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#4A5D23]" />
                  Treatment Procedures ({revenueBreakdown.treatmentPercent}%)
                </span>
                <span className="font-mono font-bold text-[#4A5D23]">₹{revenueBreakdown.treatmentProfit.toLocaleString()}</span>
              </div>
              <div className="w-full h-4 bg-[#F4F6F0] rounded-full overflow-hidden border border-[#E4E7D3]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${revenueBreakdown.treatmentPercent}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full bg-[#4A5D23] rounded-full"
                />
              </div>
            </div>

            {/* Medicine Profit Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#2C3325] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#6B823E]" />
                  Medicine Sales ({revenueBreakdown.medicinePercent}%)
                </span>
                <span className="font-mono font-bold text-[#6B823E]">₹{revenueBreakdown.medicineProfit.toLocaleString()}</span>
              </div>
              <div className="w-full h-4 bg-[#F4F6F0] rounded-full overflow-hidden border border-[#E4E7D3]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${revenueBreakdown.medicinePercent}%` }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="h-full bg-[#6B823E] rounded-full"
                />
              </div>
            </div>

            {/* Total Summary */}
            <div className="p-4 rounded-2xl bg-[#F4F6F0] border border-[#E4E7D3] flex items-center justify-between text-xs mt-4">
              <span className="text-[#8A9380] font-semibold">Total Combined Profit</span>
              <span className="font-mono text-lg font-bold text-[#2C3325]">₹{revenueBreakdown.totalProfit.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══ REVENUE VS EXPENSES COMPARISON ═══ */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.12 }}
        className="p-6 md:p-7 rounded-[24px] bg-white border border-[#E4E7D3] shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between border-b border-[#F4F6F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E4E7D3] text-[#4A5D23] flex items-center justify-center shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2C3325] leading-tight" style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}>
                Revenue vs Expenses Monthly Breakdown
              </h3>
              <p className="text-[10px] text-[#8A9380] font-medium uppercase tracking-wider">
                Gross Income vs Total Operational Costs
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-[#E4E7D3] border border-[#4A5D23]/20 rounded-full text-[10px] font-bold text-[#4A5D23] uppercase tracking-wider">
            Comparison Matrix
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthlyData.map((d, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#F4F6F0] border border-[#E4E7D3] space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-[#E4E7D3] pb-2 font-bold text-[#2C3325] font-mono">
                <span>{d.month}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${d.netProfit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  Net: ₹{d.netProfit.toLocaleString()}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[#8A9380]">
                  <span>Total Revenue:</span>
                  <span className="font-mono font-semibold text-[#4A5D23]">₹{d.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#8A9380]">
                  <span>Total Expenses:</span>
                  <span className="font-mono font-semibold text-rose-700">₹{d.expenses.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
