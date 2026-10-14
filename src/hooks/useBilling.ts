'use client'

/**
 * @file hooks/useBilling.ts
 * @description Hook for calculating invoice line items, subtotals, tax, discounts, and grand totals.
 */

import { useState, useMemo, useCallback } from 'react'

export interface BillingLineItem {
  id: string
  name: string
  type: 'medicine' | 'treatment' | 'custom'
  unitPrice: number
  quantity: number
  batchNumber?: string
  totalPrice: number
}

export interface UseBillingOptions {
  initialItems?: BillingLineItem[]
  taxRate?: number // e.g., 0 for exempt, 0.05 for 5%
  initialDiscount?: number
}

export function useBilling({
  initialItems = [],
  taxRate = 0,
  initialDiscount = 0,
}: UseBillingOptions = {}) {
  const [items, setItems] = useState<BillingLineItem[]>(initialItems)
  const [discount, setDiscount] = useState<number>(initialDiscount)
  const [notes, setNotes] = useState<string>('')

  const addItem = useCallback((item: Omit<BillingLineItem, 'totalPrice'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.type === item.type)
      if (existing) {
        return prev.map(i =>
          i.id === item.id && i.type === item.type
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                totalPrice: (i.quantity + item.quantity) * i.unitPrice,
              }
            : i
        )
      }
      return [...prev, { ...item, totalPrice: item.quantity * item.unitPrice }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.id !== id))
      return
    }
    setItems(prev =>
      prev.map(i => (i.id === id ? { ...i, quantity, totalPrice: quantity * i.unitPrice } : i))
    )
  }, [])

  const clearBilling = useCallback(() => {
    setItems([])
    setDiscount(0)
    setNotes('')
  }, [])

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0)
  }, [items])

  const taxAmount = useMemo(() => {
    return Math.max(0, subtotal - discount) * taxRate
  }, [subtotal, discount, taxRate])

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discount) + taxAmount
  }, [subtotal, discount, taxAmount])

  return {
    items,
    subtotal,
    taxAmount,
    discount,
    setDiscount,
    grandTotal,
    notes,
    setNotes,
    addItem,
    removeItem,
    updateQuantity,
    clearBilling,
  }
}
