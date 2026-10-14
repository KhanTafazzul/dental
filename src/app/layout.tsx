import type { Metadata, Viewport } from "next";
import { Poppins, Inter, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4A5D23",
};

export const metadata: Metadata = {
  title: {
    template: "%s | Hazara & Family Dental Clinics",
    default: "Hazara & Family Dental Clinics | Advanced Dental Care & Consultation",
  },
  description:
    "Schedule consultations and specialized dental treatments at Hazara Dental Clinic and Family Dental Clinic. Experienced dental surgeons, digital diagnostics, and comprehensive patient care.",
  keywords: [
    "dental clinic",
    "dentist",
    "oral healthcare",
    "dental surgeon",
    "teeth cleaning",
    "root canal treatment",
    "orthodontics",
    "Hazara Dental Clinic",
    "Family Dental Clinic",
  ],
  authors: [{ name: "Hazara & Family Dental Clinics" }],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  metadataBase: new URL("https://flynx.site"),
  openGraph: {
    title: "Hazara & Family Dental Clinics | Advanced Dental Care",
    description:
      "Modern dental healthcare facilities with comprehensive clinical consultations, digital diagnostics, and emergency dental support.",
    url: "https://flynx.site",
    siteName: "Hazara & Family Dental Clinics",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} ${outfit.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 font-sans transition-colors duration-300 dark:bg-[var(--background)] dark:text-slate-100 overflow-x-hidden w-full max-w-full">
        <ThemeProvider>
          {children}
          <CookieConsentBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
