# 🦷 Hazara & Family Dental Clinics — Enterprise Healthcare Platform

A production-grade dental clinic enterprise management suite built on Next.js 16, Supabase, TiDB Cloud, and WAHA WhatsApp Engine.

---

## 🏗️ Architecture & Clean Modular Structure

```
src/
├── actions/                  # Modular Server Actions (thin orchestrators)
│   ├── auth.actions.ts       # Admin & Doctor authentication & HMAC cookies
│   ├── appointments.actions.ts# Bookings, schedules, triage, and diagnoses
│   ├── billing.actions.ts    # Invoicing, treatment catalogue, FIFO stock deductions
│   ├── doctors.actions.ts    # Doctor profiles & credentials
│   ├── finances.actions.ts   # Utilities, helper boys, payroll, ledger analytics
│   ├── inventory.actions.ts  # TiDB medicine stock, barcodes, receiving
│   ├── messaging.actions.ts  # WhatsApp reports, Brevo alerts, campaigns
│   ├── otp.actions.ts        # 6-digit WhatsApp OTP verification store
│   ├── settings.actions.ts   # Working hours, camera passcodes, branch config
│   └── support.actions.ts    # DPDP Act 2023 compliance & complaints
├── app/                      # Next.js 16 App Router (pages & layouts)
│   ├── (public)/             # Landing page, bookings, branches
│   ├── admin/                # Clinical administration suite
│   ├── administration/       # Canonical directory gateway
│   ├── doctor/               # Doctor consultation & diagnostic desks
│   └── api/                  # Edge functions and webhooks
├── components/               # Pure UI Components
│   ├── prescription/         # Drag-and-drop prescription designer & PDF generator
│   ├── shared/               # Reusable primitives (ErrorBoundary, etc.)
│   └── ...                   # Admin, doctor, patient UI
├── config/                   # Centralized runtime configuration
│   └── env.ts                # Validated environment variables (client vs server)
├── constants/                # App-wide routing, cookies, and design tokens
│   └── routes.ts
├── hooks/                    # Reusable custom React hooks
│   ├── useAppointments.ts    # Filter, search, and local cache state
│   ├── useBilling.ts         # Cart calculations, taxes, line items
│   └── useSupabaseRealtime.ts# Auto-cleaning Postgres Realtime subscriptions
├── lib/                      # Infrastructure integrations
│   ├── supabase.ts           # Supabase client & service role instance
│   ├── firebase.ts           # Client authentication
│   ├── tidb.ts               # TiDB Cloud distributed SQL queries
│   ├── waha.ts               # WhatsApp HTTP API gateway
│   ├── messaging.ts          # Multi-channel notification router
│   └── utils.ts              # Formatting, currency, dates, strings
└── types/                    # Shared TypeScript interfaces
    └── common.types.ts       # ActionResponse<T>, domain models
```

---

## 🚀 Key Modules & Capabilities

1. **Smart Appointment Scheduling**:
   - Real-time branch slot filtering (Hazara & Family branches).
   - Offline & online appointment management with automated patient WhatsApp reminders.
   - Real-time doctor notification alerts dispatched via Brevo.

2. **Interactive Prescription Designer**:
   - Visual drag-and-drop layout designer for doctor letterheads and digital prescriptions.
   - Real-time coordinates positioning on background letterhead images.
   - High-resolution PDF generation with embedded fonts and digital signatures.

3. **Intelligent Pharmacy & Inventory**:
   - Powered by TiDB Cloud distributed MySQL backend.
   - Barcode camera scanning directly from mobile or desktop cameras.
   - Automated FIFO (First-In, First-Out) stock depletion during invoice checkout.

4. **India DPDP Act 2023 Compliance**:
   - Patient privacy rights portal (Section 5 & 6 compliance).
   - Formal Data Subject Access Requests (DSAR) and permanent Right to Erasure workflows.
   - Patient grievance redressal and audit logging.

5. **Financial & Staff Ledger**:
   - Doctor attendance tracking and payroll calculation.
   - Helper boys shift attendance and daily wage management.
   - Real-time monthly profit-and-loss and utility overhead tracking.

---

## 🛠️ Environment Variables Configuration

Copy `.env.example` or create `.env.local` in the project root:

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase Anonymous Client Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Supabase Admin Service Role Key |
| `ADMIN_PASSWORD` | Server | Master credential for clinic admin dashboard |
| `JWT_SECRET` | Server | HMAC token signing secret |
| `TIDB_HOST` | Server | TiDB Cloud Gateway Host |
| `TIDB_USER` | Server | TiDB Cloud Database Username |
| `TIDB_PASSWORD` | Server | TiDB Cloud Database Password |
| `WAHA_ENDPOINT` | Server | WhatsApp HTTP API endpoint URL |
| `WAHA_API_KEY` | Server | WAHA access key |
| `BREVO_API_KEY` | Server | Brevo (Sendinblue) transactional email API key |

---

## 💻 Development & Build

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run TypeScript validation
npx tsc --noEmit

# Production build
npm run build
```

---

## 📜 License & Ownership

Private Clinical Management System developed for **Hazara & Family Dental Clinics**.
All rights reserved © 2026.
