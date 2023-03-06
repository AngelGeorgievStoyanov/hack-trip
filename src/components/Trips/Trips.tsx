import { Trip, TripTipeOfGroup, TripTransport } from "../../model/trip";
import TripList from "./TripsList/TripsList";
import {
    alpha, AppBar, Box, FormControl, Grid, InputLabel,
    MenuItem, Pagination, Select, SelectChangeEvent, styled, Toolbar
} from "@mui/material";
import { useEffect, useRef, useState, useContext } from "react";
import * as tripService from '../../services/tripService';
import { IdType } from "../../shared/common-types";
import { ApiTrip } from "../../services/tripService";
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { LoginContext } from "../../App";
import jwt_decode from "jwt-decode";



type decode = {
    _id: string,
}


const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data/trips');

let userId: IdType | undefined;

export default function Trips() {

    const [page, setPage] = useState(1);
    const [trips, setTrips] = useState<Trip[]>();
    const [allPageNumber, setAllPageNumber] = useState<number | IdType>();
    const [searchInput, setSearchInput] = useState<string>('');
    const [typeOfPeopleSelect, setTypeOfPeopleSelect] = useState<string>('');
    const [typeOfTransportSelect, setTypeOfTransportSelect] = useState<string>('');

    const { userL } = useContext(LoginContext);


    const accessToken = userL?.accessToken ? userL.accessToken : sessionStorage.getItem('accessToken') ? sessionStorage.getItem('accessToken') : undefined;


    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id;
    }

    const searchRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {


        API_TRIP.findAllPagination(page, searchInput, typeOfPeopleSelect, typeOfTransportSelect, userId).then((data) => {
            setTrips(data);
            API_TRIP.findAll(searchInput, typeOfPeopleSelect, typeOfTransportSelect).then((data) => {
                setAllPageNumber(data);
            })
        }).catch(err => {
            console.log(err)
        });

    }, [page, searchInput, typeOfPeopleSelect, typeOfTransportSelect]);



    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {

        setPage(prev => value);

        API_TRIP.findAllPagination(page, searchInput, typeOfPeopleSelect, typeOfTransportSelect,userId).then((data) => {

            setTrips(prev => data);

        }).catch(err => {
            console.log(err)
        });

    }

    const Search = styled('div')(({ theme }) => ({
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 'auto',
        },
    }));

    const SearchIconWrapper = styled('div')(({ theme }) => ({
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

    }));


    const StyledInputBase = styled(InputBase)(({ theme }) => ({
        color: 'inherit',
        '& .MuiInputBase-input': {
            padding: theme.spacing(1, 1, 1, 0),
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: '20ch',
            },
        },
    }));


    const changeHandlerSearch = (event: React.MouseEvent) => {
        const inputSrch = searchRef.current?.children[0] as HTMLInputElement;

        if (inputSrch.value !== undefined) {
            setSearchInput(prev => inputSrch.value);
        }
    }


    const handleChangeTypeOfPeople = (event: SelectChangeEvent<string>) => {
        const selectPeople = event.target as HTMLSelectElement;
        setTypeOfPeopleSelect(prev => selectPeople.value);
    }

    const handleChangeTypeOfTransport = (event: SelectChangeEvent<string>) => {
        const selectTransport = event.target as HTMLSelectElement;
        setTypeOfTransportSelect(prev => selectTransport.value);
    }


    return (
        <>
            <AppBar position="sticky" sx={{ marginTop: '-25px' }}>
                <Toolbar sx={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between', '@media(max-width: 600px)': {
                        display: 'flex', flexDirection: 'column'
                    }
                }}>
                    <Box sx={{ minWidth: 220 }}>
                        <FormControl fullWidth>
                            <InputLabel >TYPE OF GROUP</InputLabel>
                            <Select
                                value={TripTipeOfGroup[Number(typeOfPeopleSelect)]}
                                defaultValue={TripTipeOfGroup[Number(typeOfPeopleSelect)] || ''}
                                label="TYPE OF GROUP"
                                onChange={handleChangeTypeOfPeople}
                                sx={{ color: 'white' }}
                            >
                                <MenuItem defaultValue={''} defaultChecked value={''}>ALL</MenuItem>
                                <MenuItem value={TripTipeOfGroup[1]}>Family</MenuItem>
                                <MenuItem value={TripTipeOfGroup[2]}>Family with children</MenuItem>
                                <MenuItem value={TripTipeOfGroup[3]}>Friends</MenuItem>
                                <MenuItem value={TripTipeOfGroup[4]}>Another type</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ minWidth: 220 }}>
                        <FormControl fullWidth>
                            <InputLabel >TYPE OF TRANSPORT</InputLabel>
                            <Select
                                value={TripTransport[Number(typeOfTransportSelect)]}
                                defaultValue={TripTransport[Number(typeOfTransportSelect)] || ''}
                                label="TYPE OF TRANSPORT"
                                onChange={handleChangeTypeOfTransport}
                                sx={{ color: 'white' }}
                            >
                                <MenuItem defaultValue={''} defaultChecked value={''}>ALL</MenuItem>
                                <MenuItem value={TripTransport[1]}>Car</MenuItem>
                                <MenuItem value={TripTransport[2]}>Bus</MenuItem>
                                <MenuItem value={TripTransport[3]}>Aircraft</MenuItem>
                                <MenuItem value={TripTransport[4]}>Another type</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }} ref={searchRef}
                            onClick={changeHandlerSearch}
                        />
                    </Search>
                </Toolbar>
            </AppBar>
            <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                {trips !== undefined ?
                    <TripList trips={trips} />
                    : ''}
            </Grid>
            <Box component='div' sx={{ display: 'flex', bgcolor: '#cfe8fc', justifyContent: 'center' }}>
                {allPageNumber !== undefined ?
                    <Pagination count={+allPageNumber} color="primary" sx={{ margin: '20px' }} onChange={handleChange} />
                    : ''}
            </Box>
        </>
    )
}
