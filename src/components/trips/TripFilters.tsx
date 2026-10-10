'use client';

import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AppBar, Box, FormControl, InputBase, InputLabel, MenuItem, Select, Toolbar } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import type { SelectChangeEvent } from '@mui/material/Select';
import SearchIcon from '@mui/icons-material/Search';
import { SELECT_TYPE_KEYS } from '@/constants/config';
import { useSelectChoices } from '@/hooks/useSelects';
import { BREAKPOINTS, mediaDown } from '@/constants/ui';
import { TRIP_SORT_OPTIONS, type TripSort } from '@/constants/trips';
import { buildTripsUrl, type TripsQueryParams } from '@/lib/tripUrl';

interface TripFiltersProps {
  search?: string;
  sort?: TripSort;
  group?: string;
  transport?: string;
}

/** Legacy search box styling. */
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
}));

const SearchButton = styled('button')({
  display: 'flex',
  padding: 0,
  border: 0,
  background: 'none',
  color: 'inherit',
  cursor: 'pointer',
});

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

const SELECT_BOX_SX = {
  minWidth: { xs: 200, sm: 180 },
  margin: { xs: '5px', sm: '3px' },
  width: { xs: '100%', sm: 'auto' },
} as const;


/**
 * Trip list filters. Legacy applied a filter as soon as a select changed or the search was
 * submitted, then re-rendered the list, so the controls push the new query into the URL and
 * the server-rendered list follows.
 */
export function TripFilters({ search, sort, group, transport }: TripFiltersProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(search ?? '');
  const groupChoices = useSelectChoices(SELECT_TYPE_KEYS.group, group);
  const transportChoices = useSelectChoices(SELECT_TYPE_KEYS.transport, transport);

  const current: TripsQueryParams = { search, group, transport, sort };

  function navigate(patch: Partial<TripsQueryParams>): void {
    // A new filter starts from the first page; the previous page may not exist for it.
    router.push(buildTripsUrl({ ...current, page: 1, ...patch }));
  }

  function applySearch(): void {
    navigate({ search: searchInput });
  }

  function handleGroupChange(event: SelectChangeEvent): void {
    navigate({ group: String(event.target.value) });
  }

  function handleTransportChange(event: SelectChangeEvent): void {
    navigate({ transport: String(event.target.value) });
  }

  function handleSortChange(event: SelectChangeEvent): void {
    navigate({ sort: String(event.target.value) as TripSort });
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') {
      applySearch();
    }
  }

  return (
    <AppBar position="sticky">
      <Toolbar
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          [mediaDown(BREAKPOINTS.tripsFilters)]: {
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            [mediaDown(BREAKPOINTS.tripsFilters)]: {
              flexDirection: 'column',
              width: '100%',
            },
          }}
        >
          <Box sx={SELECT_BOX_SX}>
            <FormControl fullWidth>
              <InputLabel id="trips-group-label" sx={{ color: 'white' }}>
                TYPE OF GROUP
              </InputLabel>
              <Select
                labelId="trips-group-label"
                label="TYPE OF GROUP"
                value={group ?? ''}
                onChange={handleGroupChange}
                sx={{ color: 'white' }}
              >
                <MenuItem value="">ALL</MenuItem>
                {groupChoices.map((choice) => (
                  <MenuItem key={choice.value} value={choice.value}>
                    {choice.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={SELECT_BOX_SX}>
            <FormControl fullWidth>
              <InputLabel id="trips-transport-label" sx={{ color: 'white' }}>
                TYPE OF TRANSPORT
              </InputLabel>
              <Select
                labelId="trips-transport-label"
                label="TYPE OF TRANSPORT"
                value={transport ?? ''}
                onChange={handleTransportChange}
                sx={{ color: 'white' }}
              >
                <MenuItem value="">ALL</MenuItem>
                {transportChoices.map((choice) => (
                  <MenuItem key={choice.value} value={choice.value}>
                    {choice.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={SELECT_BOX_SX}>
            <FormControl fullWidth>
              <InputLabel id="trips-sort-label" sx={{ color: 'white' }}>
                SORT
              </InputLabel>
              <Select
                labelId="trips-sort-label"
                label="SORT"
                value={sort ?? TRIP_SORT_OPTIONS.newest}
                onChange={handleSortChange}
                sx={{ color: 'white' }}
              >
                <MenuItem value={TRIP_SORT_OPTIONS.newest}>Newest</MenuItem>
                <MenuItem value={TRIP_SORT_OPTIONS.oldest}>Oldest</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ minWidth: 220, margin: '5px', width: { xs: '100%', sm: 'auto' } }}>
          <Search>
            <SearchIconWrapper>
              <SearchButton type="button" aria-label="Apply search" onClick={applySearch}>
                <SearchIcon fontSize="inherit" />
              </SearchButton>
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchInput}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setSearchInput(event.target.value)
              }
              onKeyDown={handleSearchKeyDown}
            />
          </Search>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
