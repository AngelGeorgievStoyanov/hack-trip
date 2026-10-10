import type { CSSProperties } from 'react';

/**
 * Shared visual tokens. These are plain CSS objects rather than MUI `sx` presets so the
 * same value can be used by a Server Component (`style`) and a Client Component (`style`
 * or `sx`), keeping the public pages server-rendered.
 */

/** Legacy palette values shared by the shell and the public pages. */
export const COLORS = {
  /** Legacy page fallback background behind the random background image. */
  pageBackground: '#cfe8fc',
  /** Legacy AppBar/Footer brand blue. */
  brand: '#1976d2',
  /** Legacy translucent card/panel background. */
  cardBackground: '#eee7e79e',
  /** Legacy form panel background. */
  formPanelBackground: '#e5e3e3d9',
} as const;

/** Legacy card/panel elevation, a plain box-shadow rather than an MUI elevation. */
export const CARD_SHADOW = '3px 2px 5px black';

/** Legacy card/panel border (width/style; the color falls back to the text color). */
export const CARD_BORDER = 'solid 1px';

/**
 * Legacy heading treatment. `Space Mono` was declared by the legacy CSS but never loaded,
 * so the browser painted the `monospace` fallback; the declaration is kept to match.
 */
export const headingTextStyle: CSSProperties = {
  fontFamily: 'Space Mono, monospace',
  color: '#fff',
  opacity: 1,
  textShadow: '3px 3px 3px rgb(10,10,10)',
};

/** Page shell background used by home, trips and trip details. */
export const pageBackgroundStyle: CSSProperties = {
  boxSizing: 'border-box',
  backgroundColor: COLORS.pageBackground,
  minHeight: '100vh',
  padding: '30px',
};

/** Shared flex-wrap card list used by the trips list and the home top-trips list. */
export const cardListStyle: CSSProperties = {
  listStyle: 'none',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  padding: 0,
  margin: 0,
};

/** The legacy trip card skin. */
export const cardStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'center',
  maxWidth: '300px',
  margin: '20px',
  maxHeight: '540px',
  width: '-webkit-fill-available',
  padding: '25px 0px 0px 0px',
  backgroundColor: COLORS.cardBackground,
  boxShadow: CARD_SHADOW,
  border: CARD_BORDER,
  borderRadius: '0px',
};

/** The legacy trip-details information panel skin. */
export const infoPanelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: '320px',
  maxWidth: '450px',
  margin: '20px',
  padding: '25px',
  backgroundColor: COLORS.cardBackground,
  boxShadow: CARD_SHADOW,
  border: CARD_BORDER,
  borderRadius: '0px',
};

/** Legacy "no images" placeholder style. */
export const NO_IMAGES_STYLE: CSSProperties = {
  margin: '0 0 0.35em',
  fontSize: '1.2rem',
  fontWeight: 500,
};
