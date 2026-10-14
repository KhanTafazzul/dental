import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Phone, Mail, ArrowLeft, ArrowRight, ShieldCheck, Star, Sparkles, CheckCircle2, Award, Stethoscope, ChevronRight } from 'lucide-react'
import { getAdminSupabase } from '@/lib/supabase'
import DentalLogo from '@/components/DentalLogo'

export const metadata: Metadata = {
  title: 'Hazara Dental Clinic | Restorative & Orthodontic Specialists',
  description: 'Book consultations and specialized dental treatments at Hazara Dental Clinic. Orthodontics, implants, digital diagnostics, and comprehensive clinical care.',
}

export default async function HazaraHome() {
  const supabaseServer = getAdminSupabase()
  const { data: branch } = await supabaseServer
    .from('branches')
    .select('name, working_hours, address, phone, email')
    .eq('slug', 'hazara')
    .maybeSingle()

  const { data: doctors } = await supabaseServer
    .from('doctors')
    .select('id, name, specialty, picture_url')
    .limit(4)

  const workingHours = branch?.working_hours || 'Monday – Saturday: 9:00 AM – 7:00 PM (Sunday by Appointment)'
  const branchAddress = branch?.address || 'Hazara Dental Clinic, Main Boulevard Road, Near Central Square'
  const branchPhone = branch?.phone || '+91 98200 12345'
  const branchEmail = branch?.email || 'hazara@flynx.site'
  const currentYear = new Date().getFullYear()

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen w-full max-w-full font-ui bg-[#FDFBF7] dark:bg-[#0F150D] text-[#2C3325] dark:text-[#F5F7F3] overflow-x-hidden transition-colors">
      
      {/* ═══ TOP CLINIC NAVIGATION ═══ */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/85 dark:bg-[#0F150D]/85 backdrop-blur-xl border-b border-[#4A5D23]/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-[#556B4B] hover:text-[#2C3325] dark:hover:text-white transition text-xs font-semibold">
            <ArrowLeft className="w-3.5 h-3.5 text-[#4A5D23]" />
            <span>Main Clinic</span>
          </Link>

          <Link href="/hazara" className="flex items-center gap-2.5" aria-label="Hazara Clinic">
            <div className="p-1.5 rounded-xl bg-[#4A5D23]/10 dark:bg-white/10">
              <DentalLogo size={28} />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold font-display tracking-tight text-[#2C3325] dark:text-white block">
                Hazara Dental Clinic
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#556B4B] dark:text-[#A3B799]">
                Specialized Oral Surgery
              </span>
            </div>
          </Link>

          <Link
            href="/hazara/book"
            className="px-4 sm:px-6 py-2.5 text-xs font-bold font-display text-white bg-[#4A5D23] hover:bg-[#3D4C1D] rounded-2xl transition shadow-md shadow-[#4A5D23]/25 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Book Visit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ═══ HERO SECTION ═══ */}
      <main className="flex-1 space-y-16 py-8 sm:py-12">
        <section className="relative px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-[#2C3325] via-[#384628] to-[#1C2618] text-white relative overflow-hidden shadow-2xl">
            {/* Ambient Dental Backdrops */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#88B04B]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#4A5D23]/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#E4E7D3]">
                <Sparkles className="w-3.5 h-3.5 text-[#88B04B]" />
                Orthodontic & Surgical Excellence
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight leading-tight text-white">
                Advanced Restorative Dental Care at Hazara.
              </h1>

              <p className="text-sm sm:text-base text-[#E4E7D3]/85 leading-relaxed max-w-2xl font-light">
                Hazara Dental Clinic provides clinical surgical expertise, porcelain crown fittings, dental implants, and precision braces. Equipped with digital panoramic radiography and hospital-grade sterilization.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                <Link
                  href="/hazara/book"
                  className="px-8 py-4 rounded-2xl bg-[#88B04B] hover:bg-[#789e3f] text-[#1C2618] font-display font-bold text-sm transition shadow-lg shadow-[#88B04B]/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" /> Schedule Consultation at Hazara
                </Link>
                <a
                  href={`tel:${branchPhone.replace(/\s+/g, '')}`}
                  className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-display font-semibold text-sm transition border border-white/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4" /> {branchPhone}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CLINICAL SERVICES BENTO GRID ═══ */}
        <section className="px-4 sm:px-6 max-w-6xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#4A5D23] dark:text-[#88B04B]">
              Branch Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-[#2C3325] dark:text-white">
              Specialized Treatments at Hazara
            </h2>
            <p className="text-xs sm:text-sm text-[#556B4B] dark:text-[#A3B799]">
              Every treatment is performed by qualified surgeons utilizing digital diagnostics and modern anesthesia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Orthodontics & Aligners",
                desc: "Clear aligner therapies and ceramic braces designed for comfortable bite correction.",
                badge: "Malocclusion",
              },
              {
                title: "Dental Implants",
                desc: "Titanium root implants with custom zirconia crowns for lifelong chewing restoration.",
                badge: "Permanent",
              },
              {
                title: "Painless Root Canals",
                desc: "Microscopic rotary endodontics preserving infected teeth in single or two visits.",
                badge: "Endodontic",
              },
              {
                title: "Surgical Wisdom Extractions",
                desc: "Atraumatic impaction removals under local sedation with rapid postoperative healing.",
                badge: "Maxillofacial",
              },
            ].map((srv, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-[#1C2618] border border-[#4A5D23]/15 shadow-sm hover:shadow-md transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-[#E4E7D3] dark:bg-[#2C3A27] text-[10px] font-mono font-bold text-[#4A5D23] dark:text-[#88B04B]">
                    {srv.badge}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#4A5D23]" />
                </div>
                <h3 className="text-base font-bold font-display text-[#2C3325] dark:text-white">{srv.title}</h3>
                <p className="text-xs text-[#556B4B] dark:text-[#A3B799] leading-relaxed">{srv.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ BRANCH LOCATION & WORKING HOURS ═══ */}
        <section className="px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 sm:p-10 rounded-3xl bg-[#F0F2EB] dark:bg-[#1C2618] border border-[#4A5D23]/20">
            {/* Left: Schedule & Contact */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#4A5D23] dark:text-[#88B04B]">
                  Branch Details
                </span>
                <h2 className="text-2xl font-bold font-display text-[#2C3325] dark:text-white mt-1">
                  Visit Hazara Dental Clinic
                </h2>
                <p className="text-xs text-[#556B4B] dark:text-[#A3B799] mt-1">
                  Walk-ins accepted for emergencies. Book in advance to guarantee zero waiting time.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-[#141F16] border border-[#4A5D23]/15">
                  <MapPin className="w-5 h-5 text-[#4A5D23] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold font-display text-[#2C3325] dark:text-white">Clinic Address</h4>
                    <p className="text-xs text-[#556B4B] dark:text-[#A3B799]">{branchAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-[#141F16] border border-[#4A5D23]/15">
                  <Clock className="w-5 h-5 text-[#4A5D23] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold font-display text-[#2C3325] dark:text-white">Clinical Hours</h4>
                    <p className="text-xs text-[#556B4B] dark:text-[#A3B799]">{workingHours}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-[#141F16] border border-[#4A5D23]/15">
                  <Phone className="w-5 h-5 text-[#4A5D23] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold font-display text-[#2C3325] dark:text-white">Direct Phone & WhatsApp</h4>
                    <p className="text-xs text-[#556B4B] dark:text-[#A3B799]">{branchPhone}</p>
                  </div>
                </div>
              </div>

              <Link
                href="/hazara/book"
                className="w-full py-4 rounded-2xl bg-[#4A5D23] hover:bg-[#3D4C1D] text-white font-display font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Book Hazara Consultation Now</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right: Hospital Quality & Standards Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141F16] border border-[#4A5D23]/20 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold font-display text-[#4A5D23] dark:text-[#88B04B]">
                  <ShieldCheck className="w-5 h-5 text-[#4A5D23]" />
                  <span>Clinical Sterilization Protocol</span>
                </div>
                <h3 className="text-lg font-bold font-display text-[#2C3325] dark:text-white">
                  Class-B Autoclave & 100% Sealed Instruments
                </h3>
                <p className="text-xs text-[#556B4B] dark:text-[#A3B799] leading-relaxed">
                  Hazara Clinic enforces sterile barriers for every patient. Handpieces, diagnostic mirrors, and surgical kits undergo vacuum thermal sterilization and are only opened in front of you during consultation.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-[#F0F2EB] dark:bg-[#1C2618]">
                    <div className="text-xs font-bold text-[#2C3325] dark:text-white">Zero Radiation</div>
                    <div className="text-[10px] text-[#556B4B]">Digital Sensor X-Rays</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F0F2EB] dark:bg-[#1C2618]">
                    <div className="text-xs font-bold text-[#2C3325] dark:text-white">DPDP 2023</div>
                    <div className="text-[10px] text-[#556B4B]">Encrypted Patient Data</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#E4E7D3]/60 dark:bg-[#1C2618] border border-[#4A5D23]/20 text-xs text-[#2C3325] dark:text-[#E2E8DC] flex items-center justify-between">
                <div>
                  <div className="font-bold">Need assistance finding us?</div>
                  <div className="text-[10px] text-[#556B4B]">Google Maps GPS coordinates available.</div>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(branchAddress)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#4A5D23] text-white text-[11px] font-bold cursor-pointer shrink-0"
                >
                  Open Maps
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[#4A5D23]/15 py-8 px-4 sm:px-6 text-xs text-[#556B4B] dark:text-[#A3B799] bg-[#FDFBF7] dark:bg-[#0F150D]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {currentYear} Hazara Dental Clinic • Hazara & Family Dental Care Network</p>
          <div className="flex items-center gap-4 font-semibold">
            <Link href="/terms" className="hover:text-[#2C3325] dark:hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-[#2C3325] dark:hover:text-white">Privacy</Link>
            <Link href="/dpdp" className="hover:text-[#2C3325] dark:hover:text-white">DPDP Rights</Link>
            <Link href="/hazara/book" className="hover:text-[#4A5D23]">Book Hazara</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
