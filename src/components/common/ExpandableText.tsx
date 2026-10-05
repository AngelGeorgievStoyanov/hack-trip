'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

interface ExpandableTextProps {
  text: string;
  variant?: 'body1' | 'body2';
}

const COLLAPSED_LINES = 3;

/** Clamps long descriptions; the full text stays in the DOM so public pages keep their SEO content. */
export function ExpandableText({ text, variant = 'body1' }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (expanded) {
      return;
    }
    const node = textRef.current;
    if (!node) {
      return;
    }
    setClamped(node.scrollHeight - node.clientHeight > 2);
  }, [expanded, text]);

  if (!text) {
    return null;
  }

  return (
    <Box>
      <Typography
        ref={textRef}
        component="div"
        variant={variant}
        sx={
          expanded
            ? undefined
            : {
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: COLLAPSED_LINES,
                overflow: 'hidden',
              }
        }
      >
        {text}
      </Typography>
      {clamped ? (
        <Button
          size="small"
          aria-expanded={expanded}
          onClick={() => setExpanded((previous) => !previous)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </Button>
      ) : null}
    </Box>
  );
}
