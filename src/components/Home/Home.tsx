import { Box, Grid } from '@mui/material';
import { LoginContext } from '../../App';
import { Trip } from '../../model/trip';
import TripList from '../Trips/TripsList/TripsList';
import jwt_decode from "jwt-decode";
import { useContext, useEffect, useState } from 'react';
import { IdType } from '../../shared/common-types';
import * as tripService from '../../services/tripService';
import { ApiTrip } from '../../services/tripService';

type decode = {
    _id: string,
}

const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data/trips');

function Home() {

    const [trips, setTrips] = useState<Trip[]>()

    const { userL } = useContext(LoginContext);


    const accessToken = userL?.accessToken ? userL.accessToken : sessionStorage.getItem('accessToken') ? sessionStorage.getItem('accessToken') : undefined

    let userId :string | undefined;
    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id;
    }

    useEffect(() => {

        API_TRIP.findTopTrips(userId).then((data) => {
            setTrips(data)
        }).catch((err) => {
            console.log(err)
        })


    }, [])

    return (
        <>
            <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '25px' }}>
                        <h1>Welcome TRAVELERS or future TRAVELERS!</h1>
                        <h4>This is an APP where you can share your trips or get valuable tips for your future trips.</h4>
                        {(trips !== undefined && trips.length > 0) ?
                            <h4>These are our TOP 5 most liked TRIPS!</h4>
                            : ''}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>

                        {trips !== undefined ?
                            <TripList trips={trips} /> : ''
                        }

                    </Box>
                </Box>
            </Grid>
        </>
    )

}

export default Home;