'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { Typography, Card, CardContent, CardActions, Collapse, IconButton, Tooltip, Box, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import { TripActions } from './TripActions';
import { TripGroupSocialActions } from '@/components/social/TripGroupSocialActions';
import { infoPanelStyle } from '@/constants/ui';
import type { TripGroupDay, TripGroupResponse } from '@/types';

interface TripDetailsProps {
  tripGroup: TripGroupResponse;
  /** The day currently selected by the day strip. */
  day: TripGroupDay;
}

const NAME_STYLE: CSSProperties = { margin: '0 0 0.35em', fontSize: '1.5rem', fontWeight: 500 };
const LINE_STYLE: CSSProperties = { margin: '0 0 0.35em', fontSize: '1rem', fontWeight: 400 };
const SECTION_DIVIDER: CSSProperties = { margin: '1.5rem 0', borderTop: '1px solid #ddd', width: '100%' };
const BACK_ROW_STYLE: CSSProperties = { display: 'flex', marginTop: '10px', gap: '10px', flexWrap: 'wrap', alignItems: 'center' };

/**
 * Trip Information Panel — standalone visual section matching legacy UI.
 * Contains trip metadata, social actions, trip actions, description.
 * Does NOT include map, point, or day image gallery.
 * Trip Like / Report / Favorite always render from `trip.social` (Trip Group level);
 * the `day` prop only supplies the day-level comment count (`day.social.comments`).
 */
export function TripDetails({ tripGroup, day }: TripDetailsProps) {
  const totalPoints = tripGroup.days.reduce((sum, current) => sum + current.points.length, 0);
  const dayCommentCount = day.social.comments.count;
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => setExpanded(!expanded);

  return (
    <div style={infoPanelStyle}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h5" component="div" style={NAME_STYLE}>
              TRIP NAME : {day.title ?? tripGroup.days[0]?.title ?? 'Trip'}
            </Typography>
            <TripGroupSocialActions
              tripGroupId={tripGroup.id}
              initialLiked={tripGroup.social.likedByMe}
              initialLikes={tripGroup.social.likes}
              initialFavorited={tripGroup.social.favoritedByMe ?? false}
              initialFavorites={tripGroup.social.favorites ?? 0}
              initialReported={tripGroup.social.reportedByMe}
            />
          </Box>

          <div style={SECTION_DIVIDER} />

          <TripActions tripGroup={tripGroup} day={day} />

          <div style={SECTION_DIVIDER} />

          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <Typography variant="subtitle1" component="h5" style={LINE_STYLE}>
              PRICE OF THE TRIP:
            </Typography>
            <Typography variant="subtitle1" component="h5" style={{ ...LINE_STYLE, margin: 0 }}>
              {day.price != null ? `${day.price} ${day.currency?.code ?? 'N/A'}` : 'N/A'}
            </Typography>
            <Tooltip title={day.currency?.name ?? 'Currency'} arrow>
              <IconButton size="small" aria-label="Currency info">
                <InfoIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography variant="subtitle1" component="div" style={LINE_STYLE}>
            TRANSPORT WITH: {day.transport.name ?? 'N/A'}
          </Typography>
          <Typography variant="subtitle1" component="div" style={LINE_STYLE}>
            COUNT OF PEOPLE: {day.countPeoples}
          </Typography>
          <Typography variant="subtitle1" component="div" style={LINE_STYLE}>
            TYPE OF THE GROUP: {day.group.name ?? 'N/A'}
          </Typography>
          <Typography variant="subtitle1" component="div" style={LINE_STYLE}>
            DESTINATION: {day.destination ?? 'N/A'}
          </Typography>

          {day.description ? (
            <>
              {day.description.length < 150 ? (
                <Typography variant="subtitle1" component="div" style={{ ...LINE_STYLE, padding: '0px 15px', marginTop: '10px' }}>
                  Description: {day.description}
                </Typography>
              ) : (
                <>
                  <Typography variant="subtitle1" component="div" style={{ ...LINE_STYLE, padding: '0px 15px', marginTop: '10px' }}>
                    Description: {day.description.slice(0, 150)}...
                  </Typography>
                  <CardActions disableSpacing>
                    <IconButton
                      onClick={handleExpandClick}
                      aria-expanded={expanded}
                      aria-label={expanded ? 'Show less' : 'Show more'}
                      sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms', marginLeft: 'auto' }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </CardActions>
                  <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                      <Typography paragraph>
                        {day.description}
                      </Typography>
                    </CardContent>
                  </Collapse>
                </>
              )}
            </>
          ) : null}

          <Typography variant="subtitle1" component="div" style={LINE_STYLE}>
            {totalPoints > 0
              ? `FOR THIS TRIP HAVE ${totalPoints} POINTS`
              : 'FOR THIS TRIP DONT HAVE POINTS'}
          </Typography>

          <div style={BACK_ROW_STYLE}>
            <Link href="/trips" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Button variant="contained" sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px' }}>
                BACK
              </Button>
            </Link>
          </div>

          <Typography variant="subtitle1" component="div" style={LINE_STYLE}>
            {dayCommentCount > 0
              ? `COMMENTS FOR THIS DAY: ${dayCommentCount}`
              : "FOR THIS DAY DON'T HAVE COMMENTS"}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}