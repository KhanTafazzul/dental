import React from 'react';
import { Metadata } from 'next';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: 'Admin Control Panel Settings | Dental Care Network',
  description: 'Manage account profile, security credentials, notification channels, billing, and system preferences.',
};

export default function AdminSettingsPage() {
  return <SettingsClient />;
}
