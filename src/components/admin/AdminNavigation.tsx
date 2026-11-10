'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Button } from '@mui/material';

const sections = [
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/failed-login-logs', label: 'Failed login logs' },
  { href: '/admin/route-not-found-logs', label: 'Route not found logs' },
  { href: '/admin/images', label: 'Images' },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <Box component="nav" aria-label="Admin navigation" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
      {sections.map((section) => {
        const active =
          pathname === section.href || pathname.startsWith(section.href + '/');

        return (
          <Button
            key={section.href}
            component={Link}
            href={section.href}
            size="small"
            variant={active ? 'contained' : 'text'}
            color={active ? 'primary' : 'inherit'}
            aria-current={active ? 'page' : undefined}
          >
            {section.label}
          </Button>
        );
      })}
    </Box>
  );
}
