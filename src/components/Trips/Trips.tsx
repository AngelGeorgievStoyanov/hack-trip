import { Trip, TripTipeOfGroup, TripTransport } from "../../model/trip";
import TripList from "./TripsList/TripsList";
import {
    alpha, AppBar, Box, FormControl, Grid, InputLabel,
    MenuItem, Pagination, Select, SelectChangeEvent, styled, Toolbar
} from "@mui/material";
import { useEffect, useRef, useState, useContext, FC } from "react";
import * as tripService from '../../services/tripService';
import { IdType, getRandomTripAndImage } from "../../shared/common-types";
import { ApiTrip } from "../../services/tripService";
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { LoginContext } from "../../hooks/LoginContext";
import jwt_decode from "jwt-decode";
import useMediaQuery from '@mui/material/useMediaQuery';
import HelmetWrapper from "../Helmet/HelmetWrapper";



type decode = {
    _id: string,
}


const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data');

let userId: IdType | undefined;


const Trips: FC = () => {

    const [page, setPage] = useState(1);
    const [trips, setTrips] = useState<Trip[]>();
    const [allPageNumber, setAllPageNumber] = useState<number | IdType>();
    const [searchInput, setSearchInput] = useState<string>('');
    const [typeOfPeopleSelect, setTypeOfPeopleSelect] = useState<string>('');
    const [typeOfTransportSelect, setTypeOfTransportSelect] = useState<string>('');
    const [imageBackground, setImageBackground] = useState<string>()
    const [randomImage, setRandomImage] = useState<string>()

    const { token } = useContext(LoginContext);

    const isIphone = /\b(iPhone)\b/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent);


    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined


    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id;
    }

    const searchRef = useRef<HTMLInputElement | null>(null);
    const mediaQuery = useMediaQuery('(max-width:670px)');

    useEffect(() => {

        API_TRIP.backgroundImages().then((data) => {
            setImageBackground(data[Math.floor(Math.random() * data.length)])


        }).catch((err) => {
            console.log(err)
        });


        API_TRIP.findAllPagination(page, searchInput, typeOfPeopleSelect, typeOfTransportSelect, userId).then((data) => {
            setTrips(data);
            setRandomImage(getRandomTripAndImage(data))
            API_TRIP.findAll(searchInput, typeOfPeopleSelect, typeOfTransportSelect).then((data) => {
                setAllPageNumber(data);
            })
        }).catch(err => {
            console.log(err)
        });



    }, [page, searchInput, typeOfPeopleSelect, typeOfTransportSelect]);



    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {

        setPage(prev => value);

        API_TRIP.findAllPagination(page, searchInput, typeOfPeopleSelect, typeOfTransportSelect, userId).then((data) => {

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
            <HelmetWrapper
                title={trips && trips?.length > 0 ? trips[0].title : 'Hack Trip'}
                description={trips && trips?.length > 0 ? trips[0].description : 'Hack Trip'}
                url={`https://www.hack-trip.com/trips`}
                image={randomImage ? randomImage : ''}
                hashtag={'#HackTrip'}
                keywords={'Hack Trip, Travel, Adventure'}
                canonical={`https://www.hack-trip.com/trips`}
            />
            <AppBar position="sticky" sx={{ marginTop: '-25px' }}>
                <Toolbar sx={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between', '@media(max-width: 670px)': {
                        display: 'flex', flexDirection: 'column'
                    }
                }}>
                    {mediaQuery ?
                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                            <Box sx={{ minWidth: 180, margin: '3px' }}>
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
                            <Box sx={{ minWidth: 180, margin: '3px' }}>
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
                        </Box >
                        :
                        <>
                            <Box sx={{ minWidth: 200, margin: '5px' }}>
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
                            <Box sx={{ minWidth: 200, margin: '5px' }}>
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
                        </>
                    }

                    <Box sx={{ minWidth: 220, margin: '5px' }}>
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
                    </Box>
                </Toolbar>
            </AppBar>
            <Grid container sx={!isIphone ?
                {
                    padding: '30px', margin: '-25px 0px 0px 0px',
                    backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center",
                    backgroundSize: "cover", backgroundAttachment: 'fixed', justifyContent: 'center',
                    bgcolor: '#cfe8fc', minHeight: '100vh'
                }
                :
                {
                    padding: '30px', margin: '-25px 0px 0px 0px',
                    backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",
                    justifyContent: 'center',
                    bgcolor: '#cfe8fc', height: '100vh', overflow: 'scroll'
                }

            } spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>


                <Grid container sx={{ justifyContent: 'center', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    {trips !== undefined ?
                        <TripList trips={trips} />
                        : ''}
                </Grid>
                <Box component='div' sx={{ display: 'flex', justifyContent: 'center' }}>
                    {allPageNumber !== undefined ?
                        <Pagination count={+allPageNumber} color="primary" sx={{ margin: '20px' }} onChange={handleChange} />
                        : ''}
                </Box>
            </Grid>
        </>
    )
}

export default Trips;
