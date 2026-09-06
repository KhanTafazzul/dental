import { Metadata } from 'next';
import AuthPortal from '@/components/auth/AuthPortal';

export const metadata: Metadata = {
  title: 'Create Account | Falix Dental Care',
  description: 'Register for Falix Dental Care patient and clinician services.',
};

export default function RegisterPage() {
  return <AuthPortal initialMode='register' />;
}