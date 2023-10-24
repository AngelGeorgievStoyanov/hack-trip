import { Grid, Box, CardMedia, useMediaQuery, keyframes } from "@mui/material";
import { BaseSyntheticEvent, FC, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { IdType, mouseover, touchStart } from "../../shared/common-types";
import { ApiTrip } from "../../services/tripService";
import { Trip } from "../../model/trip";
import * as tripService from '../../services/tripService';

const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data');

const rotateHorCenter = keyframes`
0% {
    -webkit-transform: rotate(0);
            transform: rotate(0);
  }
  100% {
    -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
  }
`;


const AboutUs: FC = () => {


    const [imageBackground, setImageBackground] = useState<string>()

    const h1HackRef = useRef<HTMLHeadingElement | null>(null)
    const isIphone = /\b(iPhone)\b/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent);

    const madiaQuery = useMediaQuery('(min-width:550px)');


    useEffect(() => {

        API_TRIP.backgroundImages().then((data) => {

            setImageBackground(data[Math.floor(Math.random() * data.length)])

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
            <Helmet>
                <title>Hack Trip About</title>
                <meta name='description' content='Hack Trip is an app where you can share your trips or get valuable tips for your future trips. These are our TOP 5 most liked in Hack Trips!' />
                <meta property="og:title" content="Hack Trip" />
                <meta property="og:url" content="https://www.hack-trip.com" />
                <meta property="og:image:url" content="https://www.hack-trip.com" />
                <meta property="og:image" content={`https://storage.googleapis.com/hack-trip-background-images/${imageBackground}`} />
                <meta property="og:type" content="website" />
                <meta property="og:description"
                    content="The idea of ​Hack Trip is to help all travelers, if you want to visit a certain destination, city or area, enter to search for information and see other travelers..." />
                <meta property="quote" content={'Hack Trip'} />
                <meta property="og:locale" content="en_US" />
                <meta property="og:hashtag" content={'#HackTrip'} />
                <meta property="og:site_name" content="Hack-Trip" />
                <link rel="canonical" href="/about" />
            </Helmet>
            <Grid onTouchStart={onTouchStart} container sx={!isIphone ?
                {
                    padding: '30px', margin: '-25px 0px 0px 0px',
                    backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center",
                    backgroundSize: "cover", backgroundAttachment: 'fixed', justifyContent: 'center',
                    bgcolor: '#cfe8fc', minHeight: '100vh'
                }
                :
                {
                    padding: '30px',
                    margin: '-25px 0px 0px 0px',
                    backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",
                    justifyContent: 'center',
                    bgcolor: '#cfe8fc', height: '100vh', overflow: 'scroll'
                }

            } spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '80%' }}>
                    <h1 style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Welcome travelers or future travelers!</h1>
                    {madiaQuery ?
                        <h1 ref={h1HackRef} onMouseOver={onmouseover} data-value="Welcome in Hack Trip!" style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Welcome in Hack Trip!</h1>

                        :
                        <>
                            <h1 style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Welcome in</h1>
                            <h1 ref={h1HackRef} data-value="Hack Trip!" style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Hack Trip!</h1>
                        </>
                    }

                    <h2 style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Hack Trip is an app where you can share your trips or get valuable tips for your future trips.</h2>
                    <h3 style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>
                        The idea of ​​Hack Trip is to help all travelers, if you want to visit a certain destination, city or area, enter to search for information and see other travelers if they have been there and if they have described
                        what they recommend and then if wish you could add your journey and be of help.</h3>
                    <CardMedia
                        component="img"
                        sx={{ height: '240px', width: 'auto', margin: '20px', padding: '20px', animation: `${rotateHorCenter} 1s ease-in-out 3s both`, '@media(max-width: 820px)': { height: 'auto', width: '100%', margin: '15px 0px 15px 0px', padding: '0' } }}
                        src={'https://storage.googleapis.com/hack-trip/hack-trip-markers.png'}
                        title="hack trip"
                        alt="hack trip"
                        loading="lazy"
                    />
                    <h4 style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}> It's integrated for you Google Maps and you can add points Markers.</h4>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', '@media(max-width: 1050px)': { display: 'flex', flexDirection: 'column', alignItems: 'center' } }}>
                        <CardMedia
                            component="img"
                            sx={{ height: '240px', width: 'auto', margin: '20px', padding: '20px', animation: `${rotateHorCenter} 1s ease-in-out 3s both`, '@media(max-width: 820px)': { height: 'auto', width: '100%', margin: '15px 0px 15px 0px', padding: '0' } }}
                            src={'https://storage.googleapis.com/hack-trip/hack-trip-points1.0.png'}
                            title="hack trip"
                            alt="hack trip"
                            loading="lazy"
                        />

                        <CardMedia
                            component="img"
                            sx={{ height: 'auto', width: '35%', margin: '20px', padding: '20px', animation: `${rotateHorCenter} 1s ease-in-out 3s both`, '@media(max-width: 820px)': { height: 'auto', width: '100%', margin: '15px 0px 15px 0px', padding: '0' } }}
                            src={'https://storage.googleapis.com/hack-trip/hack-trip-points1.1.png'}
                            title="hack trip"
                            alt="hack trip"
                            loading="lazy"
                        />
                    </Box>
                    <h4 style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}> As you can mark everything you want, a city, hotel, restaurant, shop,
                        hidden beach or why not if you are in the mountains add points there too and it becomes like an eco trail,
                        it all depends on the person how much it wants to be detailed and what it wants to describe.

                    </h4>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', '@media(max-width: 1050px)': { display: 'flex', flexDirection: 'column', alignItems: 'center' } }}>
                        <CardMedia
                            component="img"
                            sx={{ height: '240px', width: 'auto', margin: '20px', padding: '20px', animation: `${rotateHorCenter} 1s ease-in-out 3s both`, '@media(max-width: 820px)': { height: 'auto', width: '100%', margin: '15px 0px 15px 0px', padding: '0' } }}
                            src={'https://storage.googleapis.com/hack-trip/hack-trip-points2.0.png'}
                            title="hack trip"
                            alt="hack trip"
                            loading="lazy"
                        />
                        <CardMedia
                            component="img"
                            sx={{ height: 'auto', width: '35%', margin: '20px', padding: '20px', animation: `${rotateHorCenter} 1s ease-in-out 3s both`, '@media(max-width: 820px)': { height: 'auto', width: '100%', margin: '15px 0px 15px 0px', padding: '0' } }}
                            src={'https://storage.googleapis.com/hack-trip/hack-trip-points2.1.png'}
                            title="hack trip"
                            alt="hack trip"
                            loading="lazy"
                        />
                    </Box>
                    <h4 style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>
                        You can also, if you have a trip coming up, plan your trip,
                        set every single point and then follow them and of course if you decide you can edit them later when you are on the spot,
                        if you want to add photos or a description and so others will be able to follow your journey live with you.
                    </h4>
                    <CardMedia
                        component="img"
                        sx={{ height: '240px', width: 'auto', margin: '20px', padding: '20px', animation: `${rotateHorCenter} 1s ease-in-out 3s both`, '@media(max-width: 820px)': { height: 'auto', width: '100%', margin: '15px 0px 15px 0px', padding: '0' } }}
                        src={'https://storage.googleapis.com/hack-trip/hack-trip-points3.png'}
                        title="hack trip"
                        alt="hack trip"
                        loading="lazy"
                    />
                    <h5 style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Enjoy the Hack Trip !</h5>
                    <h5 style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>You can contact us at email:  www.hack.trip@gmail.com</h5>

                </Box>
            </Grid>

        </>

    )
}

export default AboutUs;