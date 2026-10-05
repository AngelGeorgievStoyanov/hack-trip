import type { ReactNode } from 'react';

/**
 * The project does not depend on @mui/icons-material, so shared glyphs live here instead of
 * adding a package for a handful of shapes. Sizing follows the surrounding font size so the
 * icons fit MUI icon buttons.
 */
function createIcon(path: ReactNode) {
  return function Icon({ className }: { className?: string }) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        width="1em"
        height="1em"
        aria-hidden="true"
        focusable="false"
      >
        {path}
      </svg>
    );
  };
}

export const MenuIcon = createIcon(
  <>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </>,
);

export const CloseIcon = createIcon(
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>,
);

export const ChevronLeftIcon = createIcon(<polyline points="15 18 9 12 15 6" />);

export const ChevronRightIcon = createIcon(<polyline points="9 18 15 12 9 6" />);

export const ExpandMoreIcon = createIcon(<polyline points="6 9 12 15 18 9" />);
