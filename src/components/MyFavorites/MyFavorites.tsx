import { Box, Grid, Typography } from "@mui/material";
import TripList from "../Trips/TripsList/TripsList";
import * as tripService from '../../services/tripService';
import { Trip, TripCreate } from "../../model/trip";
import { useEffect, useState } from "react";
import { IdType } from "../../shared/common-types";
import { ApiTrip } from "../../services/tripService";


export default function MyFavorites() {
    const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data/trips');

    const [trips, setTrips] = useState<Trip[]>([]);
    const userId = sessionStorage.getItem('userId');

    useEffect(() => {


        if (userId !== null) {

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
            <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

                {trips.length === 0 ?

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                        <Typography gutterBottom variant="h4" component="div">
                            You dont't have a favorites trip yet.
                        </Typography>
                    </Box>
                    :
                    <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Typography gutterBottom sx={{ margin: '50px' }} variant="h4" component="div">
                            These are your trips
                        </Typography>
                        <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

                            <TripList trips={trips} />

                        </Grid>
                    </Grid>

                }

            </Grid>
        </>
    )
}