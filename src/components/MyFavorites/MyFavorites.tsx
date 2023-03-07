import { Box, Grid, Typography } from "@mui/material";
import TripList from "../Trips/TripsList/TripsList";
import * as tripService from '../../services/tripService';
import { Trip, TripCreate } from "../../model/trip";
import { useEffect, useState } from "react";
import { IdType } from "../../shared/common-types";
import { ApiTrip } from "../../services/tripService";
import jwt_decode from "jwt-decode";
import { LoginContext } from "../../App";
import { useContext } from 'react';


type decode = {
    _id: string
}

let userId: string | undefined;


const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data/trips');


export default function MyFavorites() {
    
    const [trips, setTrips] = useState<Trip[]>([]);
    
    const { userL } = useContext(LoginContext);

    const accessToken = userL?.accessToken ? userL.accessToken : sessionStorage.getItem('accessToken') ? sessionStorage.getItem('accessToken') : undefined;

    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id;
    }


    useEffect(() => {


        if (userId !== undefined) {

            API_TRIP.findAllMyFavorites(userId).then((data) => {
                setTrips(data);

            }).catch((err) => {
                console.log(err);
                throw err.message;
            })
        }



    }, []);

    return (
        <>
            <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh','@media(max-width: 900px)': { display: 'flex', width: '100vw', padding: '0', margin: '0' } }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

                {trips.length === 0 ?

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center','@media(max-width: 900px)': { display: 'flex', width: '100vw', padding: '0', margin: '0', alignItems: 'center' } }}>

                        <Typography gutterBottom variant="h5" component="div" sx={{padding:'0 15px' }}>
                            You dont't have a favorites trip yet.
                        </Typography>
                    </Box>
                    :
                    <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh','@media(max-width: 900px)': { display: 'flex', width: '100vw', padding: '0', margin: '0' } }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Typography gutterBottom sx={{ margin: '50px' }} variant="h4" component="div">
                            These are your trips
                        </Typography>
                        <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh','@media(max-width: 900px)': { display: 'flex', width: '100vw', padding: '0', margin: '0' } }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

                            <TripList trips={trips} />

                        </Grid>
                    </Grid>

                }

            </Grid>
        </>
    )
}