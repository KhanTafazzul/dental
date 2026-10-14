/**
 * @file app/admin/actions.ts
 * @description Central Server Action Hub (backward compatibility layer).
 * Re-exports modular domain Server Actions from @/actions/*.
 *
 * New code should import directly from the relevant domain action:
 * - `@/actions/auth.actions`
 * - `@/actions/appointments.actions`
 * - `@/actions/billing.actions`
 * - `@/actions/doctors.actions`
 * - `@/actions/finances.actions`
 * - `@/actions/inventory.actions`
 * - `@/actions/messaging.actions`
 * - `@/actions/otp.actions`
 * - `@/actions/support.actions`
 * - `@/actions/settings.actions`
 */

export * from '@/actions/auth.actions'
export * from '@/actions/appointments.actions'
export * from '@/actions/billing.actions'
export * from '@/actions/doctors.actions'
export * from '@/actions/finances.actions'
export * from '@/actions/inventory.actions'
export * from '@/actions/messaging.actions'
export * from '@/actions/otp.actions'
export * from '@/actions/support.actions'
export * from '@/actions/settings.actions'
