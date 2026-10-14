# ⚡ Server Actions (`src/actions`)

Server Actions are asynchronous server-side functions invoked directly from client components or form submissions in Next.js App Router (`'use server'`).

## 📁 Architecture Overview

All server actions are split into focused, single-responsibility domain modules rather than a monolithic file.

| File | Domain | Key Responsibilities |
| :--- | :--- | :--- |
| [`auth.actions.ts`](./auth.actions.ts) | Authentication | Admin password login/logout, Doctor slug & universal authentication, HMAC session cookie lifecycle. |
| [`appointments.actions.ts`](./appointments.actions.ts) | Appointments | Booking status updates, branch schedules, offline booking, mobile diagnosis report generation, camera passcodes. |
| [`billing.actions.ts`](./billing.actions.ts) | Billing & Invoicing | Treatment catalogue CRUD, invoice generation with FIFO stock deduction, and edge print dispatch. |
| [`doctors.actions.ts`](./doctors.actions.ts) | Doctor Management | Doctor CRUD, schedule details, avatar uploads to Supabase storage. |
| [`finances.actions.ts`](./finances.actions.ts) | Accounting & Payroll | Electricity bills, helper boy attendance, doctor attendance records, extra clinic expenses, and monthly balance sheets. |
| [`inventory.actions.ts`](./inventory.actions.ts) | Inventory & TiDB | Barcode search, stock receiving, TiDB batch inserts, and stock depletion management. |
| [`messaging.actions.ts`](./messaging.actions.ts) | Communication | WhatsApp automated reports via WAHA engine, Brevo appointment alerts, bulk broadcast campaigns, and birthday greetings. |
| [`otp.actions.ts`](./otp.actions.ts) | Verification | In-memory time-limited OTP store, WhatsApp 6-digit challenge code delivery and verification. |
| [`support.actions.ts`](./support.actions.ts) | DPDP & Support | DPDP Act 2023 compliance, patient data erasure/access requests, and patient complaint tracking. |
| [`settings.actions.ts`](./settings.actions.ts) | Settings | Branch working hours, time slots, camera passcodes, and admin profile configurations. |

## 🛡️ Response Standards

All server actions return a unified response shape conforming to `ActionResponse<T>`:

```ts
import type { ActionResponse } from '@/types/common.types'

export async function myAction(): Promise<ActionResponse<MyData>> {
  try {
    // Business logic
    return { success: true, data: result }
  } catch (err: any) {
    console.error('[Domain] Error:', err)
    return { success: false, error: err.message || 'Operation failed' }
  }
}
```

## 🔄 Backward Compatibility Layer

For legacy callers, [`src/app/admin/actions.ts`](../app/admin/actions.ts) acts as a unified re-export barrel. New code should import directly from `@/actions/<domain>.actions`.
