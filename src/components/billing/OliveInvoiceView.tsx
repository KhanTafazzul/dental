'use client'

import React from 'react'

export interface InvoiceItem {
  id?: string
  type?: 'treatment' | 'medicine' | 'custom'
  name: string
  quantity: number
  price: number
  batchNumber?: string
  originalPrice?: number
}

export interface InvoiceData {
  invoiceId: string
  date: string
  branchName?: string
  doctorName?: string
  patientName: string
  patientAge?: string | number
  patientMobile?: string
  patientEmail?: string
  items: InvoiceItem[]
  subtotal?: number
  treatmentDiscountPercent?: number
  medicineDiscountPercent?: number
  treatmentSubtotal?: number
  treatmentDiscountVal?: number
  medicineSubtotal?: number
  medicineDiscountVal?: number
  totalDiscountSaved?: number
  overallDiscountPercent?: number
  grandTotal: number
}

interface OliveInvoiceViewProps {
  data: InvoiceData
  showPrintButton?: boolean
}

export default function OliveInvoiceView({ data, showPrintButton = true }: OliveInvoiceViewProps) {
  const branchName = data.branchName || 'Family Dental Clinic'
  const doctorName = data.doctorName || 'Dr. Nadeem'
  const patientName = data.patientName || 'Patient'
  const patientAge = data.patientAge ? `${data.patientAge} yrs` : 'N/A'
  const patientMobile = data.patientMobile || 'N/A'
  const patientEmail = data.patientEmail || 'N/A'
  const invoiceId = data.invoiceId ? data.invoiceId.substring(0, 10).toUpperCase() : 'INV-7182D0DD'
  const invoiceDate = data.date || new Date().toLocaleDateString('en-US')

  // Categorize Items
  const treatmentItems = (data.items || []).filter(
    (i) => i.type === 'treatment' || i.type === 'custom' || (!i.type && !i.batchNumber)
  )
  const medicineItems = (data.items || []).filter(
    (i) => i.type === 'medicine' || i.batchNumber
  )

  // Subtotals & Calculations
  const calculatedTreatmentSubtotal = treatmentItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const calculatedMedicineSubtotal = medicineItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  
  const treatmentSubtotal = data.treatmentSubtotal ?? calculatedTreatmentSubtotal
  const medicineSubtotal = data.medicineSubtotal ?? calculatedMedicineSubtotal
  const rawSubtotal = data.subtotal ?? (treatmentSubtotal + medicineSubtotal)

  const treatmentDiscPercent = data.treatmentDiscountPercent || 0
  const medicineDiscPercent = data.medicineDiscountPercent || 0

  const treatmentDiscVal = data.treatmentDiscountVal ?? (treatmentSubtotal * (treatmentDiscPercent / 100))
  const medicineDiscVal = data.medicineDiscountVal ?? (medicineSubtotal * (medicineDiscPercent / 100))

  const totalDiscountSaved = data.totalDiscountSaved ?? (treatmentDiscVal + medicineDiscVal)
  const overallDiscountPercent = data.overallDiscountPercent ?? (rawSubtotal > 0 ? (totalDiscountSaved / rawSubtotal) * 100 : 0)

  const grandTotal = data.grandTotal ?? Math.max(0, rawSubtotal - totalDiscountSaved)

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="olive-invoice-root">
      <style jsx global>{`
        :root {
          --olive-900: #313d24; 
          --olive-800: #465733; 
          --olive-700: #5c7244; 
          --olive-600: #748c56; 
          --olive-100: #eef2e8; 
          --olive-50:  #f8faf5; 
          
          --primary: var(--olive-700);
          --primary-gradient: linear-gradient(135deg, var(--olive-700), var(--olive-600));
          --bg-main: var(--olive-50);
          --bg-card: #ffffff;
          --text-dark: var(--olive-900);
          --text-muted: var(--olive-800);
          --border: #dfe6d8;
          --discount-bg: #fff1f2;
          --discount-text: #e11d48;
        }

        .olive-invoice-wrapper {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          background-color: var(--bg-main);
          color: var(--text-dark);
          padding: 20px;
          -webkit-font-smoothing: antialiased;
        }

        .invoice-box {
          max-width: 850px;
          margin: 0 auto;
          background: var(--bg-card);
          border-radius: 20px;
          box-shadow: 0 12px 35px rgba(92, 114, 68, 0.08);
          overflow: hidden;
          position: relative;
        }

        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 350px;
          height: 350px;
          opacity: 0.03;
          pointer-events: none;
          color: var(--primary);
          z-index: 0;
        }

        .invoice-header-banner {
          background: var(--primary-gradient);
          color: white;
          padding: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logo-box {
          background: rgba(255, 255, 255, 0.15);
          padding: 12px;
          border-radius: 14px;
          backdrop-filter: blur(4px);
          display: flex;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .clinic-name {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .clinic-sub {
          margin: 4px 0 0;
          font-size: 13px;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .invoice-badge {
          text-align: right;
          background: rgba(255, 255, 255, 0.12);
          padding: 12px 20px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .invoice-badge h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }

        .invoice-badge p {
          margin: 4px 0 0;
          font-size: 13px;
          opacity: 0.9;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 30px 40px;
          position: relative;
          z-index: 1;
        }

        .info-card {
          background: var(--olive-100);
          padding: 20px;
          border-radius: 16px;
          border: 1px solid var(--border);
        }

        .info-card h3 {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .info-details {
          font-size: 14px;
          line-height: 1.8;
          color: var(--text-muted);
        }

        .info-details strong {
          color: var(--text-dark);
          font-weight: 600;
        }

        .table-wrapper {
          padding: 0 40px;
          position: relative;
          z-index: 1;
          overflow-x: auto;
        }

        .invoice-table {
          width: 100%;
          min-width: 600px;
          border-collapse: collapse;
        }

        .invoice-table th {
          background: var(--olive-100);
          color: var(--olive-800);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 14px 16px;
          text-align: left;
          font-weight: 700;
        }

        .invoice-table th:first-child { border-radius: 10px 0 0 10px; }
        .invoice-table th:last-child { border-radius: 0 10px 10px 0; text-align: right; }

        .invoice-table td {
          padding: 16px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }

        .category-row td {
          background: var(--bg-main);
          color: var(--primary);
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
          border-radius: 6px;
        }

        .item-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-dark);
        }

        .item-meta {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .summary-wrapper {
          display: flex;
          justify-content: flex-end;
          padding: 30px 40px;
          position: relative;
          z-index: 1;
        }

        .summary-box {
          width: 100%;
          max-width: 420px;
          background: var(--olive-50);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid var(--border);
        }

        .calc-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          color: var(--text-muted);
        }

        .calc-row.title {
          color: var(--primary);
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border);
          padding-bottom: 8px;
          margin-bottom: 4px;
          margin-top: 12px;
          letter-spacing: 0.5px;
        }

        .calc-row.title:first-child { margin-top: 0; }

        .discount-text {
          color: var(--discount-text);
        }

        .grand-total-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding: 18px 20px;
          background: var(--primary-gradient);
          color: white;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          box-shadow: 0 6px 20px rgba(92, 114, 68, 0.25);
        }

        .invoice-footer {
          text-align: center;
          padding: 24px 40px;
          color: var(--text-muted);
          font-size: 13px;
          border-top: 1px solid var(--border);
          position: relative;
          z-index: 1;
          background: var(--olive-50);
        }

        @media (max-width: 768px) {
          .olive-invoice-wrapper { padding: 0; background: var(--bg-card); }
          .invoice-box { border-radius: 0; box-shadow: none; border: none; }
          .invoice-header-banner { flex-direction: column; text-align: center; gap: 20px; padding: 30px 20px; }
          .brand-section { flex-direction: column; }
          .invoice-badge { text-align: center; width: 100%; box-sizing: border-box; }
          .info-grid { grid-template-columns: 1fr; padding: 20px; gap: 15px; }
          .table-wrapper { padding: 0 20px; }
          .summary-wrapper { padding: 20px; justify-content: center; }
          .summary-box { max-width: 100%; }
          .invoice-footer { padding: 20px; }
        }

        @media print {
          .no-print { display: none !important; }
          .olive-invoice-wrapper { padding: 0; background: white; }
          .invoice-box { box-shadow: none; }
          .invoice-header-banner, .grand-total-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .info-card, .invoice-table th { background: var(--olive-100) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Action Bar / Print Button */}
      {showPrintButton && (
        <div className="no-print max-w-[850px] mx-auto mb-4 flex items-center justify-between bg-white p-4 rounded-2xl border border-[#dfe6d8] shadow-sm">
          <div className="flex items-center gap-2 text-[#313d24] text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5c7244]"></span>
            <span>Official Olive Theme Dental Invoice</span>
          </div>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-[#5c7244] hover:bg-[#465733] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>Print / Download PDF Receipt</span>
          </button>
        </div>
      )}

      {/* Main Invoice Card Container */}
      <div className="olive-invoice-wrapper">
        <div className="invoice-box">
          
          {/* Watermark SVG */}
          <svg className="watermark" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.44 2.82C15.65 1.54 13.82 2 12 3.5 10.18 2 8.35 1.54 6.56 2.82c-2.3 1.64-3 5.4-1.28 9.5 1.45 3.48 3.5 7.07 4 9.1.18.7.67 1.08 1.25 1.08.6 0 1.05-.44 1.25-1.14l.72-2.58.72 2.58c.2.7.65 1.14 1.25 1.14.58 0 1.07-.38 1.25-1.08.5-2.03 2.55-5.62 4-9.1 1.72-4.1 1.02-7.86-1.28-9.5zm-5.44 9.68v4h-2v-4a2 2 0 1 1 2 0z"/>
          </svg>

          {/* Header Banner */}
          <div className="invoice-header-banner">
            <div className="brand-section">
              <div className="logo-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22a8 8 0 0 1-8-8c0-3.3 2.7-7.8 4-10a2.2 2.2 0 0 1 4 0c1.3 2.2 4 6.7 4 10a8 8 0 0 1-8 8Z"></path>
                  <path d="M10 21c-1-1-2-3-2-5 0-4 3-7 4-10 1 3 4 6 4 10 0 2-1 4-2 5M12 16v-4"/>
                </svg>
              </div>
              <div>
                <h1 className="clinic-name">{branchName.toUpperCase()}</h1>
                <p className="clinic-sub">Official Billing & Receipt</p>
              </div>
            </div>
            <div className="invoice-badge">
              <h2>INVOICE</h2>
              <p>ID: #{invoiceId}</p>
            </div>
          </div>

          {/* Info Grid (Patient & Visit Details) */}
          <div className="info-grid">
            <div className="info-card">
              <h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Patient Details
              </h3>
              <div className="info-details">
                <strong>Patient Name:</strong> {patientName}<br />
                <strong>Age:</strong> {patientAge}<br />
                <strong>Mobile:</strong> {patientMobile}<br />
                <strong>Email:</strong> {patientEmail}
              </div>
            </div>
            <div className="info-card">
              <h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Visit Information
              </h3>
              <div className="info-details">
                <strong>Date:</strong> {invoiceDate}<br />
                <strong>Branch:</strong> {branchName}<br />
                <strong>Attending:</strong> {doctorName}
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Qty</th>
                  <th style={{ width: '18%', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ width: '18%', textAlign: 'right' }}>Total Price</th>
                </tr>
              </thead>
              <tbody>
                {/* Dental Treatments Category */}
                {treatmentItems.length > 0 && (
                  <>
                    <tr className="category-row">
                      <td colSpan={4}>Dental Treatments</td>
                    </tr>
                    {treatmentItems.map((item, index) => (
                      <tr key={`treat-${index}`}>
                        <td><div className="item-name">{item.name}</div></td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>Rs. {item.price.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-dark)' }}>
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr><td colSpan={4} style={{ border: 'none', padding: '6px' }}></td></tr>
                  </>
                )}

                {/* Prescribed Medicines Category */}
                {medicineItems.length > 0 && (
                  <>
                    <tr className="category-row">
                      <td colSpan={4}>Prescribed Medicines</td>
                    </tr>
                    {medicineItems.map((item, index) => {
                      const itemTotal = item.price * item.quantity
                      const origTotal = item.originalPrice ? item.originalPrice * item.quantity : itemTotal
                      return (
                        <tr key={`med-${index}`}>
                          <td>
                            <div className="item-name">{item.name}</div>
                            <div className="item-meta">
                              Batch: {item.batchNumber || 'GEN-BATCH'} {origTotal > itemTotal ? `| Before Disc: Rs. ${origTotal.toFixed(2)}` : ''}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                          <td style={{ textAlign: 'right' }}>Rs. {item.price.toFixed(2)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-dark)' }}>
                            Rs. {itemTotal.toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Box */}
          <div className="summary-wrapper">
            <div className="summary-box">
              {/* Treatment Breakdown */}
              {treatmentItems.length > 0 && (
                <>
                  <div className="calc-row title">Treatment Breakdown</div>
                  <div className="calc-row">
                    <span>Treatment Subtotal</span>
                    <span>Rs. {treatmentSubtotal.toFixed(2)}</span>
                  </div>
                  {treatmentDiscVal > 0 && (
                    <div className="calc-row discount-text">
                      <span>Treatment Disc ({treatmentDiscPercent.toFixed(2)}%)</span>
                      <span>- Rs. {treatmentDiscVal.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}

              {/* Medicine Breakdown */}
              {medicineItems.length > 0 && (
                <>
                  <div className="calc-row title">Medicine Breakdown</div>
                  <div className="calc-row">
                    <span>Medicine Subtotal</span>
                    <span>Rs. {medicineSubtotal.toFixed(2)}</span>
                  </div>
                  {medicineDiscVal > 0 && (
                    <div className="calc-row discount-text">
                      <span>Medicine Disc ({medicineDiscPercent.toFixed(2)}%)</span>
                      <span>- Rs. {medicineDiscVal.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}

              {/* Final Calculation */}
              <div className="calc-row title">Final Calculation</div>
              <div className="calc-row" style={{ color: 'var(--text-dark)', fontWeight: 700, marginTop: '4px' }}>
                <span>Combined Subtotal</span>
                <span>Rs. {rawSubtotal.toFixed(2)}</span>
              </div>
              {totalDiscountSaved > 0 && (
                <div className="calc-row discount-text" style={{ fontWeight: 600, background: 'var(--discount-bg)', padding: '10px 12px', borderRadius: '8px', marginTop: '10px' }}>
                  <span>Total Discount Saved ({overallDiscountPercent.toFixed(2)}%)</span>
                  <span>- Rs. {totalDiscountSaved.toFixed(2)}</span>
                </div>
              )}

              {/* Grand Total Box */}
              <div className="grand-total-box">
                <span>Grand Total</span>
                <span>Rs. {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="invoice-footer">
            <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: 'var(--text-dark)' }}>
              Thank you for choosing {branchName}.
            </p>
            <p style={{ margin: 0 }}>
              This invoice is a dynamically generated patient receipt. For any billing query, contact support.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
