'use client';

import { Badge, IconButton, Tooltip, Typography } from '@mui/material';
import AddCommentIcon from '@mui/icons-material/AddComment';
import CloseIcon from '@mui/icons-material/Close';

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
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {!open && count === 0 && emptyLabel ? (
        <Typography variant="subtitle1" component="div" sx={{ margin: '5px' }}>
          {emptyLabel}
        </Typography>
      ) : null}
      <Tooltip title={open ? 'Hide comments' : count > 0 ? `Show ${count} comments` : 'Show comments'} arrow>
        <IconButton
          onClick={onToggle}
          aria-label={open ? 'Hide comments' : count > 0 ? `Show ${count} comments` : 'Show comments'}
          aria-expanded={open}
          color="primary"
        >
          {open ? (
            <CloseIcon />
          ) : (
            <Badge badgeContent={count} invisible={count === 0} max={Number.MAX_SAFE_INTEGER} color="primary">
              <AddCommentIcon />
            </Badge>
          )}
        </IconButton>
      </Tooltip>
    </div>
  );
}
