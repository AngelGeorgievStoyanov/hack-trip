import type { Metadata } from 'next';
import { Box } from '@mui/material';
import { NOINDEX } from '@/constants/seo';
import { ProfileForm } from '@/components/auth/ProfileForm';

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
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 'calc(100vh - 64px)',
        py: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          maxWidth: 600,
          height: 'fit-content',
          p: { xs: 2, sm: '30px' },
          backgroundColor: '#eee7e79e',
          boxShadow: '3px 2px 5px black',
          border: 'solid 1px',
          borderRadius: 0,
        }}
      >
        <ProfileForm />
      </Box>
    </Box>
  );
}
