'use client';

import { Alert, Box, Button, Typography } from '@mui/material';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalRouteError({ reset }: ErrorProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start', p: 4 }}>
      <Typography variant="h4" component="h1">
        Something went wrong
      </Typography>
      <Alert severity="error">An unexpected error occurred. Please try again.</Alert>
      <Button variant="contained" onClick={reset}>
        Try again
      </Button>
    </Box>
  );
}
