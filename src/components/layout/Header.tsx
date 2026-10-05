'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { MODERATOR_ROLES } from '@/constants/roles';
import { CloseIcon, MenuIcon } from '@/components/common/icons';

interface NavLink {
  href: string;
  label: string;
}

/**
 * Client Component because it reads the auth session to show login/account controls;
 * `useAuth()` is the single source of frontend auth state.
 */
export function Header() {
  const { status, user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isAuthenticated = status === 'authenticated';
  const isModerator = (MODERATOR_ROLES as readonly string[]).includes(user?.role ?? '');

  const links: NavLink[] = [
    { href: '/', label: 'HOME' },
    { href: '/trips', label: 'TRIPS' },
    ...(isAuthenticated
      ? [
          { href: '/trips/create', label: 'CREATE TRIP' },
          { href: '/profile', label: user?.firstName ?? 'Account' },
          { href: '/my-trips', label: 'MY TRIPS' },
          { href: '/favorites', label: 'MY FAVORITES' },
          { href: '/live-tracking', label: 'LIVE TRIP TRACKING' },
          { href: '/about', label: 'ABOUT US' },
          ...(isModerator ? [{ href: '/admin', label: 'ADMIN' }] : []),
        ]
      : [
          { href: '/login', label: 'LOGIN' },
          { href: '/register', label: 'REGISTER' },
          { href: '/about', label: 'ABOUT US' },
        ]),
  ];

  function closeDrawer(): void {
    setDrawerOpen(false);
  }

  return (
    <Box component="header" sx={{ borderBottom: '1px solid #e0e0e0', px: 2, py: 1.25 }}>
      <Box
        component="nav"
        aria-label="Main navigation"
        sx={{
          display: { xs: 'none', md: 'flex' },
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {links.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            style={index === 0 ? { fontWeight: 700 } : undefined}
          >
            {link.label}
          </Link>
        ))}
        {isAuthenticated ? (
          <button type="button" onClick={() => void logout()}>
            Logout
          </button>
        ) : null}
      </Box>

      <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 2 }}>
        <IconButton
          edge="start"
          aria-label="Open navigation menu"
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon />
        </IconButton>
        <Link href="/" style={{ fontWeight: 700 }}>
          HackTrip
        </Link>
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer}>
        <Box component="nav" aria-label="Navigation menu" sx={{ width: 280, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Menu</Typography>
            <IconButton aria-label="Close navigation menu" onClick={closeDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ my: 1 }} />
          <List>
            {links.map((link) => (
              <ListItemButton
                key={`${link.href}-${link.label}`}
                component={Link}
                href={link.href}
                onClick={closeDrawer}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
            {isAuthenticated ? (
              <ListItemButton
                onClick={() => {
                  closeDrawer();
                  void logout();
                }}
              >
                <ListItemText primary="Logout" />
              </ListItemButton>
            ) : null}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}

