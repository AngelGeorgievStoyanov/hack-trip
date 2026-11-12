import { createTheme } from '@mui/material/styles';
import { COLORS } from '@/constants/ui';

/**
 * Central MUI theme configuration.
 * Keep values aligned with the existing UI tokens to preserve current rendering.
 */
export const theme = createTheme({
  palette: {
    primary: {
      main: COLORS.brand,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--ht-color-brand': COLORS.brand,
          '--ht-color-page-background': COLORS.pageBackground,
        },
      },
    },
  },
});
