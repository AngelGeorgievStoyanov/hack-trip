import { Box, Grid } from '@mui/material';
import { LoginContext } from '../../App';
import { Trip } from '../../model/trip';
import TripList from '../Trips/TripsList/TripsList';
import jwt_decode from "jwt-decode";
import { FC, useContext, useEffect, useState } from 'react';
import { IdType } from '../../shared/common-types';
import * as tripService from '../../services/tripService';
import { ApiTrip } from '../../services/tripService';
import Typography from '@mui/material/Typography';
import { Helmet } from 'react-helmet-async';
import { FacebookShareButton, FacebookIcon } from 'react-share';


type decode = {
    _id: string,
}


const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data/trips');

const Home: FC = () => {

    const [trips, setTrips] = useState<Trip[]>()
    const [imageBackground, setImageBackground] = useState<string>()

    const { userL } = useContext(LoginContext);

    const isIphone = /\b(iPhone)\b/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent);

    const accessToken = userL?.accessToken ? userL.accessToken : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    let userId: string | undefined;
    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id;
    }


    useEffect(() => {

        API_TRIP.backgroundImages().then((data) => {

            setImageBackground(data[Math.floor(Math.random() * data.length)])

        }).catch((err) => {
            console.log(err)
        });

        API_TRIP.findTopTrips(userId).then((data) => {
            setTrips(data)
        }).catch((err) => {
            console.log(err)
        });



    }, [])


    return (
        <>
            <Helmet>
                <title>Home page hack trip</title>
                <meta name='description' content='Home page with top 5 hack trips ( hack trip ) most liked trips.' />
                <meta property="og:title" content="Hack Trip" />
                <meta property="og:url" content="https://www.hack-trip.com" />
                <meta property="og:image:url" content="https://www.hack-trip.com" />
                <meta property="og:image" content={`https://storage.googleapis.com/hack-trip-background-images/${imageBackground}`} />
                <meta property="og:type" content="website" />
                <meta property="og:description"
                    content="This is an APP where you can share your trips or get valuable tips for your future trips. These are our TOP 5 most liked TRIPS!" />
                <meta property="quote" content={'Hack Trip'} />
                <meta property="og:locale" content="en_US" />
                <meta property="og:hashtag" content={'#HackTrip'} />
                <meta property="og:site_name" content="Hack-Trip" />
                <link rel="canonical" href="/" />
            </Helmet>

            <Grid id="print" container sx={!isIphone ?
                {
                    padding: '30px', margin: '-25px 0px 0px 0px',
                    backgroundImage: `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})`,
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center",
                    backgroundSize: "cover", backgroundAttachment: 'fixed', justifyContent: 'center',
                    bgcolor: '#cfe8fc', minHeight: '100vh'
                }
                :
                {
                    padding: '30px',
                    margin: '-25px 0px 0px 0px',
                    backgroundImage: `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})`,
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",
                    justifyContent: 'center',
                    bgcolor: '#cfe8fc', height: '100vh', overflow: 'scroll'
                }

            } spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: ' 0 25px', }}>
                        <Typography sx={{ fontFamily: 'cursive', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }} variant='h5'>Welcome TRAVELERS or future TRAVELERS!</Typography>
                        <Typography sx={{ fontFamily: 'cursive', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }} variant='subtitle1'>This is an APP where you can share your trips or get valuable tips for your future trips.</Typography>

                        {(trips !== undefined && trips.length > 0) ?
                            <Typography sx={{ fontFamily: 'cursive', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }} variant='body1'>These are our TOP 5 most liked TRIPS!</Typography>

                            : ''}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>

                        {trips !== undefined ?
                            <TripList trips={trips} /> : ''
                        }

                    </Box>
                    <Box sx={{ display: 'flex' }}>
                        <h3 style={{ fontFamily: 'cursive', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)', marginRight: '10px' }}>Share to Facebook</h3>
                        <FacebookShareButton
                            url={'https://www.hack-trip.com'}
                            quote={'Hack Trip'}
                            hashtag='#HackTrip'
                        >
                            <FacebookIcon size={38} round />
                        </FacebookShareButton>
                    </Box>
                </Box>
            </Grid>
        </>
    )

}

export default Home;