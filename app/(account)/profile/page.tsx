import type { Metadata } from 'next';
import { Box } from '@mui/material';
import { NOINDEX } from '@/constants/seo';
import { ProfileForm } from '@/components/auth/ProfileForm';
import { ProfileImage } from '@/components/auth/ProfileImage';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

export const metadata: Metadata = {
  title: 'Profile',
  robots: NOINDEX,
};

export default function ProfilePage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        maxWidth: 600,
        width: '100%',
        mx: 'auto',
        p: { xs: 2, sm: 4 },
        backgroundColor: '#eee7e79e',
        boxShadow: '3px 2px 5px black',
        border: 'solid 1px',
        borderRadius: 0,
      }}
    >
      <ProfileImage />
      <ProfileForm />
      <ChangePasswordForm />
    </Box>
  );
}
