import { Box, Grid, useMediaQuery } from '@mui/material';
import { LoginContext } from '../../App';
import { Trip } from '../../model/trip';
import TripList from '../Trips/TripsList/TripsList';
import jwt_decode from "jwt-decode";
import { BaseSyntheticEvent, FC, useContext, useEffect, useRef, useState } from 'react';
import { IdType, getRandomTripAndImage, mouseover, touchStart } from '../../shared/common-types';
import * as tripService from '../../services/tripService';
import { ApiTrip } from '../../services/tripService';
import { FacebookShareButton, FacebookIcon, ViberShareButton, ViberIcon } from 'react-share';
import HelmetWrapper from '../Helmet/HelmetWrapper';

type decode = {
    _id: string,
}


const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data');


const Home: FC = () => {

    const [trips, setTrips] = useState<Trip[]>()
    const [imageBackground, setImageBackground] = useState<string>()
    const [randomImage, setRandomImage] = useState<string>()
    const { token } = useContext(LoginContext);


    const h1HackRef = useRef<HTMLHeadingElement | null>(null)

    const isIphone = /\b(iPhone)\b/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent);
    const madiaQuery = useMediaQuery('(min-width:550px)');

    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

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
            setRandomImage(getRandomTripAndImage(data))
        }).catch((err) => {
            console.log(err)
        });


    }, [])

    const onmouseover = (e: BaseSyntheticEvent) => {
        mouseover(e, h1HackRef)
    }

    const onTouchStart = () => {
        touchStart(h1HackRef)
    }


    return (
        <>
            <HelmetWrapper
                title={trips && trips?.length > 0 ? trips[0].title : 'Hack Trip'}
                description={trips && trips?.length > 0 ? trips[0].description : 'Hack Trip'}
                url={`https://www.hack-trip.com`}
                image={randomImage ? randomImage : ''}
                hashtag={'#HackTrip'}
                keywords={'Hack Trip, Travel, Adventure'}
                canonical={`https://www.hack-trip.com`}
            />
            <Grid onTouchStart={onTouchStart} container sx={!isIphone ?
                {
                    padding: '30px', margin: '0px 0px 0px 0px',
                    backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center",
                    backgroundSize: "cover", backgroundAttachment: 'fixed', justifyContent: 'center',
                    bgcolor: '#cfe8fc', minHeight: '100vh'
                }
                :
                {
                    padding: '30px',
                    margin: '0px 0px 0px 0px',
                    backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",
                    justifyContent: 'center',
                    bgcolor: '#cfe8fc', height: '100vh', overflow: 'scroll'
                }

            } spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: ' 0 25px', }}>
                        <h1 style={{ margin: '2px', textAlign: 'center', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Welcome travelers or future travelers!</h1>
                        {madiaQuery ?
                            <h1 ref={h1HackRef} onMouseOver={onmouseover} data-value="Welcome in Hack Trip!" style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Welcome in Hack Trip!</h1>

                            :
                            <>
                                <h1 style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Welcome in</h1>
                                <h1 ref={h1HackRef} data-value="Hack Trip!" style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Hack Trip!</h1>
                            </>
                        }



                        <h2 style={{ margin: '2px', textAlign: 'center', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Hack Trip is an app where you can share your trips or get valuable tips for your future trips.</h2>

                        {(trips !== undefined && trips.length > 0) ?
                            <h3 style={{ margin: '2px', textAlign: 'center', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>These are our TOP 5 most liked in Hack Trips!</h3>

                            : ''}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>

                        {trips !== undefined ?
                            <TripList trips={trips} /> : ''
                        }

                    </Box>
                    <Box sx={{ display: 'flex', margin: '10px' }}>
                        <h3 style={{ fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)', marginRight: '10px' }}>Share to Facebook</h3>
                        <FacebookShareButton
                            url={randomImage ? `https://storage.googleapis.com/hack-trip/${randomImage}` : 'https://storage.googleapis.com/hack-trip/hack-trip-home-page.png'}
                            quote={`Hack Trip -  https://www.hack-trip.com`}
                            hashtag='#HackTrip'
                        >
                            <FacebookIcon size={38} round />
                        </FacebookShareButton>
                    </Box>
                    <Box sx={{ display: 'flex', margin: '10px' }}>
                        <h3 style={{ fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)', marginRight: '10px' }}>Share to Viber</h3>
                        <ViberShareButton
                            title={`Hack Trip `}
                            separator={' - '}
                            url={'https://www.hack-trip.com'}
                        >
                            <ViberIcon size={38} round />
                        </ViberShareButton>
                    </Box>
                </Box>
            </Grid>
        </>
    )

}

export default Home;