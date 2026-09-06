import { Metadata } from 'next';
import AuthPortal from '@/components/auth/AuthPortal';

export const metadata: Metadata = {
  title: 'Sign In | Falix Dental Care',
  description: 'Secure patient and clinic authentication portal for Falix Dental Care with Firebase and 256-bit encryption.',
};

export default function LoginPage() {
  return <AuthPortal initialMode="login" />;
}
