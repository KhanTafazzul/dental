import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import BookingSuccess from '@/components/BookingSuccess'
import DentalLogo from '@/components/DentalLogo'

export const metadata = {
  title: 'Booking Confirmed | Hazara Dental Clinic',
  description: 'Your dental appointment is successfully scheduled at Hazara Dental Clinic.',
}

export default function HazaraSuccessPage() {
  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between font-ui bg-[#FDFBF7] dark:bg-[#0F150D] text-[#2C3325] dark:text-[#F5F7F3] overflow-x-hidden transition-colors">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/85 dark:bg-[#0F150D]/85 backdrop-blur-xl border-b border-[#4A5D23]/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/hazara" className="inline-flex items-center gap-2 text-[#556B4B] hover:text-[#2C3325] dark:hover:text-white transition text-xs font-semibold">
            <ArrowLeft className="w-3.5 h-3.5 text-[#4A5D23]" />
            <span>Hazara Branch</span>
          </Link>
          <Link href="/hazara" className="flex items-center gap-2.5" aria-label="Hazara Clinic">
            <div className="p-1.5 rounded-xl bg-[#4A5D23]/10 dark:bg-white/10">
              <DentalLogo size={28} />
            </div>
            <div className="text-left">
              <span className="text-sm sm:text-base font-bold font-display tracking-tight text-[#2C3325] dark:text-white block">
                Hazara Dental Clinic
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#556B4B] dark:text-[#A3B799]">
                Consultation Voucher
              </span>
            </div>
          </Link>
          <div className="w-20" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 relative z-10">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[400px] text-[#556B4B]">
            <Loader2 className="w-8 h-8 animate-spin text-[#4A5D23]" />
            <p className="text-xs font-medium mt-3">Loading confirmation details...</p>
          </div>
        }>
          <BookingSuccess branchSlug="hazara" />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#4A5D23]/15 py-8 text-center text-xs text-[#556B4B] dark:text-[#A3B799] relative z-10">
        <p>© {new Date().getFullYear()} Hazara Dental Clinic • Private Clinical Healthcare Portal</p>
      </footer>
    </div>
  )
}
