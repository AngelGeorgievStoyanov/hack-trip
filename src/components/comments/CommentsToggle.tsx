'use client';

import { Button, Typography } from '@mui/material';

interface CommentsToggleProps {
  /** Number of comments for the target, taken from the API response. */
  count: number;
  /** Whether the comment list is currently expanded. */
  open: boolean;
  onToggle: () => void;
  /** Optional note shown above the toggle when there are no comments yet. */
  emptyLabel?: string;
}

/**
 * Show/hide toggle for a comment list.
 *
 * The toggle lives in the trip information card while the list itself is rendered in a
 * separate section, so both can evolve independently (for example with comment sorting).
 */
export function CommentsToggle({ count, open, onToggle, emptyLabel }: CommentsToggleProps) {
  return (
    <div>
      {open ? (
        <Button
          variant="contained"
          onClick={onToggle}
          aria-expanded={open}
          sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}
        >
          HIDE COMMENTS
        </Button>
      ) : (
        <>
          {count === 0 && emptyLabel ? (
            <Typography variant="subtitle1" component="div" sx={{ margin: '5px' }}>
              {emptyLabel}
            </Typography>
          ) : null}
          <Button
            variant="contained"
            onClick={onToggle}
            aria-expanded={open}
            sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}
          >
            {`SHOW ALL COMMENTS (${count})`}
          </Button>
        </>
      )}
    </div>
  );
}
