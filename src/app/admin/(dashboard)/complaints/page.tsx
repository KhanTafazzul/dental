import React from 'react';
import { Metadata } from 'next';
import ComplaintsClient from './ComplaintsClient';

export const metadata: Metadata = {
  title: 'Patient Complaints & Tickets Desk | Admin Control Panel',
  description: 'Manage patient complaints, DPDP access/erasure requests, and support tickets for Hazara & Family Dental Stores.',
};

export default function AdminComplaintsPage() {
  return <ComplaintsClient />;
}
