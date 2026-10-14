import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import BookingForm from '@/components/BookingForm'
import DentalLogo from '@/components/DentalLogo'

export const metadata = {
  title: 'Book Appointment | Family Dental Care',
  description: 'Book a dental consultation for yourself or a family member at Family Dental Care.',
}

export default function FamilyBookPage() {
  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between font-ui bg-[#FDFBF7] dark:bg-[#0F150D] text-[#2C3325] dark:text-[#F5F7F3] overflow-x-hidden transition-colors">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/85 dark:bg-[#0F150D]/85 backdrop-blur-xl border-b border-[#4A5D23]/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/family" className="inline-flex items-center gap-2 text-[#556B4B] hover:text-[#2C3325] dark:hover:text-white transition text-xs font-semibold">
            <ArrowLeft className="w-3.5 h-3.5 text-[#4A5D23]" />
            <span>Family Hub</span>
          </Link>

          <Link href="/family" className="flex items-center gap-2.5" aria-label="Family Clinic">
            <div className="p-1.5 rounded-xl bg-[#4A5D23]/10 dark:bg-white/10">
              <DentalLogo size={28} />
            </div>
            <div className="text-left">
              <span className="text-sm sm:text-base font-bold font-display tracking-tight text-[#2C3325] dark:text-white block">
                Family Dental Care
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#556B4B] dark:text-[#A3B799]">
                Family Appointment Booking
              </span>
            </div>
          </Link>

          <div className="w-20" />
        </div>
      </header>

      {/* Main booking content */}
      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 relative z-10">
        <BookingForm branchSlug="family" />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#4A5D23]/15 py-8 text-center text-xs text-[#556B4B] dark:text-[#A3B799] relative z-10">
        <p>© {new Date().getFullYear()} Family Dental Care • Dedicated Family Health Network</p>
      </footer>
    </div>
  )
}
