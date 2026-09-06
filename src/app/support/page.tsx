import Metadata from 'next';
import SupportPageClient from './SupportPageClient';

export const metadata = {
  title: 'Patient Support Desk & FAQ | Dental Care Network',
  description: 'Instant FAQ self-service, WhatsApp live chat, phone hotlines, and DPO ticket support for Hazara & Family Dental Stores.',
};

export default function SupportPage() {
  return <SupportPageClient />;
}
