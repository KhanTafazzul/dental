import React from 'react';
import { Metadata } from 'next';
import DpdpPageClient from './DpdpPageClient';

export const metadata: Metadata = {
  title: 'DPDP Act 2023 & DPDP Rules 2025 Compliance Center | Dental Care',
  description: 'Official Digital Personal Data Protection (DPDP) Act 2023 Portal for patient data rights, consent management, subject access requests (SAR), and DPO contact details.',
};

export default function DpdpPage() {
  return <DpdpPageClient />;
}
