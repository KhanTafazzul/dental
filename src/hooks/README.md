# 🪝 Custom Hooks (`src/hooks`)

Custom React hooks encapsulate client-side stateful logic, filtering, calculations, and external subscriptions.

## Available Hooks

### 1. `useSupabaseRealtime`
Subscribes to Supabase Realtime changes (`postgres_changes`) for a given table, automatically cleaning up channels when components unmount.

```tsx
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime'

useSupabaseRealtime({
  table: 'appointments',
  event: '*',
  onData: (payload) => {
    console.log('Realtime update:', payload)
  }
})
```

### 2. `useAppointments`
Provides filtering (by branch, date, status), fuzzy searching (by patient name, phone, doctor), and optimistic client-side caching for appointment lists.

```tsx
import { useAppointments } from '@/hooks/useAppointments'

const {
  filteredAppointments,
  selectedBranch,
  setSelectedBranch,
  searchQuery,
  setSearchQuery,
  updateLocalStatus
} = useAppointments({ initialAppointments })
```

### 3. `useBilling`
Manages invoice line items (medicines, procedures, custom charges), calculations of subtotal, tax rate, discount, and grand total.

```tsx
import { useBilling } from '@/hooks/useBilling'

const {
  items,
  addItem,
  removeItem,
  updateQuantity,
  subtotal,
  discount,
  setDiscount,
  grandTotal
} = useBilling()
```
