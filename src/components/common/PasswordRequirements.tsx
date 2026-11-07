'use client';

import { Box, Typography } from '@mui/material';
import { CheckCircleOutline, RadioButtonUnchecked } from '@mui/icons-material';
import { getPasswordRequirements } from '@/validations/shared';

interface PasswordRequirementsProps {
  password: string;
  minLength?: number;
}

export function PasswordRequirements({
  password,
  minLength = 8,
}: PasswordRequirementsProps) {
  const requirements = getPasswordRequirements(password, minLength);

  return (
    <Box
      component="ul"
      aria-label="Password requirements"
      sx={{
        listStyle: 'none',
        p: 0,
        m: '-8px 0 0 4px',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 0.75,
      }}
    >
      {requirements.map((requirement) => (
        <Box
          component="li"
          key={requirement.key}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
        >
          {requirement.valid ? (
            <CheckCircleOutline fontSize="small" color="success" />
          ) : (
            <RadioButtonUnchecked fontSize="small" sx={{ color: 'text.disabled' }} />
          )}
          <Typography
            variant="caption"
            color={requirement.valid ? 'success.main' : 'text.secondary'}
          >
            {requirement.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
