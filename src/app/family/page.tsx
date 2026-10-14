import type { Metadata } from 'next'
import FamilyHubClient from '@/components/patient/FamilyHubClient'

export const metadata: Metadata = {
  title: 'Family Health Hub | Multi-Generational Dental Care',
  description: 'Manage appointments, dental health records, and treatment plans for your entire family under one verified clinical portal.',
}

export default function FamilyPage() {
  return <FamilyHubClient />
}
