'use client';

import Link from 'next/link';
import { Fragment, useState, type KeyboardEvent } from 'react';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { isModeratorUser } from '@/constants/roles';
import { BREAKPOINTS, mediaDown, maxWidthQuery } from '@/constants/ui';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';

interface NavLink {
  href: string;
  label: string;
}

/** Legacy per-item spacing for the navigation buttons. */
const NAV_BUTTON_SX = { margin: '2px', padding: '2px', boxSizing: 'content-box' } as const;

const MENU_ICON_SX = { fontSize: 32 } as const;

/**
 * Client Component because it reads the auth session to show login/account controls;
 * `useAuth()` is the single source of frontend auth state.
 */
export function Header() {
  const { status, user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const useDrawerNav = useMediaQuery(maxWidthQuery(BREAKPOINTS.desktopNav));
  const isAuthenticated = status === 'authenticated';
  const isModerator = isModeratorUser(user);

  const links: NavLink[] = isAuthenticated
    ? [
        { href: '/', label: 'HOME' },
        { href: '/trips', label: 'TRIPS' },
        { href: '/trips/create', label: 'CREATE TRIP' },
        { href: '/my-trips', label: 'MY TRIPS' },
        { href: '/live-tracking', label: 'LIVE TRIP TRACKING' },
        { href: '/favorites', label: 'MY FAVORITES' },
        { href: '/about', label: 'ABOUT US' },
        ...(isModerator ? [{ href: '/admin', label: 'ADMIN' }] : []),
      ]
    : [
        { href: '/', label: 'HOME' },
        { href: '/trips', label: 'TRIPS' },
        { href: '/login', label: 'LOGIN' },
        { href: '/register', label: 'REGISTER' },
        { href: '/about', label: 'ABOUT US' },
      ];

  function closeDrawer(): void {
    setDrawerOpen(false);
  }

  function handleDrawerKeyDown(event: KeyboardEvent): void {
    // Tab/Shift only move focus; the legacy drawer ignored them so keyboard traversal
    // through the menu does not close it.
    if (event.key === 'Tab' || event.key === 'Shift') {
      return;
    }
    closeDrawer();
  }

  async function handleLogout(): Promise<void> {
    closeDrawer();
    await logout();
  }

  function renderWelcome() {
    return (
      <Typography
        variant="h6"
        component="div"
        sx={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <Button component={Link} href="/profile" color="inherit">
          Welcome{'   '}
          {user?.email}
        </Button>
      </Typography>
    );
  }

  function renderNavButtons() {
    return (
      <>
        {links.map((link) => (
          <Button
            key={`${link.href}-${link.label}`}
            component={Link}
            href={link.href}
            color="inherit"
            sx={NAV_BUTTON_SX}
          >
            {link.label}
          </Button>
        ))}
        <Button onClick={() => void handleLogout()} color="inherit" sx={NAV_BUTTON_SX}>
          LOGOUT
        </Button>
      </>
    );
  }

  function renderDrawer() {
    return (
      <>
        <IconButton
          color="inherit"
          aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setDrawerOpen((open) => !open)}
          sx={MENU_ICON_SX}
        >
          {drawerOpen ? <CloseIcon fontSize="inherit" /> : <MenuIcon fontSize="inherit" />}
        </IconButton>
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={closeDrawer}
          slotProps={{ paper: { elevation: 12, sx: { height: 'auto' } } }}
        >
          <Box
            component="nav"
            aria-label="Navigation menu"
            onClick={closeDrawer}
            onKeyDown={handleDrawerKeyDown}
            sx={{ display: 'flex', flexDirection: 'column', width: 220 }}
          >
            {links.map((link) => (
              <Fragment key={`${link.href}-${link.label}`}>
                <Button component={Link} href={link.href} color="inherit">
                  {link.label}
                </Button>
                <Divider />
              </Fragment>
            ))}
            <Button onClick={() => void handleLogout()} color="inherit">
              LOGOUT
            </Button>
          </Box>
        </Drawer>
      </>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingBottom: '20px',
            [mediaDown(760)]: {
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
            },
          }}
        >
          {isAuthenticated ? (
            <>
              {renderWelcome()}
              {useDrawerNav ? renderDrawer() : renderNavButtons()}
            </>
          ) : (
            links.map((link) => (
              <Button
                key={`${link.href}-${link.label}`}
                component={Link}
                href={link.href}
                color="inherit"
                sx={NAV_BUTTON_SX}
              >
                {link.label}
              </Button>
            ))
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
