import { Box, Grid, Typography } from "@mui/material";
import TripList from "../Trips/TripsList/TripsList";
import * as tripService from '../../services/tripService';
import { Trip, TripCreate } from "../../model/trip";
import { FC, useEffect, useState } from "react";
import { IdType } from "../../shared/common-types";
import { ApiTrip } from "../../services/tripService";
import jwt_decode from "jwt-decode";
import { LoginContext } from "../../hooks/LoginContext";
import { useContext } from 'react';


type decode = {
    _id: string
}

let userId: string | undefined;


const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data');



const MyFavorites: FC = () => {


    const [trips, setTrips] = useState<Trip[]>([]);
    const [imageBackground, setImageBackground] = useState<string>()

    const { token } = useContext(LoginContext);

    const isIphone = /\b(iPhone)\b/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent);

    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id;
    }


    useEffect(() => {


        if (userId !== undefined && token) {

            API_TRIP.findAllMyFavorites(userId, token).then((data) => {
                setTrips(data);

            }).catch((err) => {
                console.log(err);
                throw err.message;
            })

            API_TRIP.backgroundImages().then((data) => {
                setImageBackground(data[Math.floor(Math.random() * data.length)])

            }).catch((err) => {
                console.log(err)
            });
        }



    }, []);

    return (
        <>

            <Grid container sx={!isIphone ?
                {
                    backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",
                    backgroundAttachment: 'fixed', justifyContent: 'center', bgcolor: '#cfe8fc',
                    padding: '30px', margin: '-25px 0px 0px 0px', minHeight: '100vh',
                    '@media(max-width: 900px)': { display: 'flex', width: '100vw', padding: '0', margin: '-25px 0px 0px 0px' }
                }
                :
                {
                    margin: '-25px 0px 0px 0px',
                    backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",
                    justifyContent: 'center',
                    bgcolor: '#cfe8fc', height: '100vh', overflow: 'scroll', width: '100vw'
                }

            } spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

                {trips.length === 0 ?

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', '@media(max-width: 900px)': { display: 'flex', width: '100vw', padding: '0', margin: '0', alignItems: 'center' } }}>

                        <Typography gutterBottom sx={{ margin: '50px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }} variant="h5" component="div" >
                            You dont't have a favorites trip yet.
                        </Typography>
                    </Box>
                    :
                    <Grid container sx={{ justifyContent: 'center', padding: '30px', minHeight: '100vh', '@media(max-width: 900px)': { display: 'flex', width: '100vw', padding: '0', margin: '0' } }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Typography gutterBottom sx={{ margin: '50px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }} variant="h5" component="div">
                            These are your favorites trips
                        </Typography>
                        <Grid container sx={{ justifyContent: 'center', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

                            <TripList trips={trips} />

                        </Grid>
                    </Grid>

                }

            </Grid>
        </>
    )
}


export default MyFavorites;