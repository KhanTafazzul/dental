import React from 'react'
import OliveInvoiceView, { InvoiceData } from '@/components/billing/OliveInvoiceView'
import { getInvoiceDetails } from '@/app/admin/actions'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PrintInvoicePage({ params }: PageProps) {
  const { id } = await params

  if (!id) {
    notFound()
  }

  const res = await getInvoiceDetails(id)

  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf5] p-6 text-center font-sans">
        <div className="bg-white p-8 rounded-3xl border border-[#dfe6d8] shadow-lg max-w-md space-y-4">
          <h2 className="text-xl font-bold text-[#313d24]">Invoice Not Found</h2>
          <p className="text-xs text-[#5c7244]">
            {res.error || 'The requested invoice receipt could not be located in database records.'}
          </p>
        </div>
      </div>
    )
  }

  const invoiceData: InvoiceData = res.data

  return (
    <div className="min-h-screen bg-[#f8faf5] py-8">
      <OliveInvoiceView data={invoiceData} showPrintButton={true} />
    </div>
  )
}
