import { Box, Grid } from '@mui/material';
import { useLoaderData } from 'react-router-dom';
import { Trip } from '../../model/trip';
import TripList from '../Trips/TripsList/TripsList';


function Home() {

    const trips = useLoaderData() as Trip[];


    return (
        <>
            <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding:'25px' }}>
                        <h1>Welcome TRAVELERS or future TRAVELERS!</h1>
                        <h4>This is an APP where you can share your trips or get valuable tips for your future trips.</h4>
                       {(trips!==undefined && trips.length>0)?
                        <h4>These are our TOP 5 most liked TRIPS!</h4>
                       :''}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <TripList trips={trips} />
                    </Box>
                </Box>
            </Grid>
        </>
    )

}

export default Home;