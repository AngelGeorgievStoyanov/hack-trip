import type { Metadata } from 'next';
import { ProfileForm } from '@/components/auth/ProfileForm';
import { ProfileImage } from '@/components/auth/ProfileImage';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { ConfirmPasswordForm } from '@/components/auth/ConfirmPasswordForm';

export const metadata: Metadata = {
  title: 'Profile',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: 480 }}>
      <ProfileForm />
      <ProfileImage />
      <ChangePasswordForm />
      <ConfirmPasswordForm />
    </div>
  );
}

