import { Grid, Box, CardMedia } from "@mui/material";
import { FC } from "react";
import { Helmet } from "react-helmet-async";



const AboutUs: FC = () => {

    return (

        <>
            <Helmet>
                <title>About us Hack Trip</title>
                <meta name='description' content='The idea of ​Hack Trip is to help all travelers, if you want to visit a certain destination, city or area, enter to search for information and see other travelers...' />
                <meta property="og:title" content="Hack Trip" />
                <meta property="og:url" content="https://www.hack-trip.com" />
                <meta property="og:image" content={'https://storage.googleapis.com/hack-trip/hack-trip-points3.png'} />
                <meta property="og:type" content="website" />
                <meta property="og:description"
                    content="The idea of ​Hack Trip is to help all travelers, if you want to visit a certain destination, city or area, enter to search for information and see other travelers..." />
                <link rel="canonical" href="/about" />
            </Helmet>
            <Grid container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#cfe8fc', padding: '0', margin: '-25px 0px 0px 0px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#cfe8fc', maxWidth: '80%' }}>
                    <h1 style={{ margin: '2px', fontFamily: 'Space Mono, monospace' }}>Welcome travelers or future travelers in Hack Trip!</h1>
                    <h2 style={{ margin: '2px', fontFamily: 'Space Mono, monospace' }}>Hack Trip is an app where you can share your trips or get valuable tips for your future trips.</h2>
                    <h3 style={{ margin: '2px', fontFamily: 'Space Mono, monospace' }}>
                        The idea of ​​Hack Trip is to help all travelers, if you want to visit a certain destination, city or area, enter to search for information and see other travelers if they have been there and if they have described
                        what they recommend and then if wish you could add your journey and be of help.</h3>
                    <CardMedia
                        component="img"
                        sx={{ height: '240px', width: 'auto', margin: '20px', padding: '20px', '@media(max-width: 920px)': { height: 'auto', width: '100%', margin: '15px 0px 15px 0px', padding: '0' } }}
                        src={'https://storage.googleapis.com/hack-trip/hack-trip-markers.png'}
                        title="hack trip"
                        alt="hack trip"
                        loading="lazy"
                    />
                    <h4 style={{ margin: '2px', fontFamily: 'Space Mono, monospace' }}> It's integrated for you Google Maps and you can add points Markers.</h4>

                    <CardMedia
                        component="img"
                        sx={{ height: '440px', width: 'auto', margin: '20px', padding: '20px', '@media(max-width: 920px)': { height: 'auto', width: '100%', margin: '15px 0px 15px 0px', padding: '0' } }}
                        src={'https://storage.googleapis.com/hack-trip/hack-trip-points1.png'}
                        title="hack trip"
                        alt="hack trip"
                        loading="lazy"
                    />
                    <h4 style={{ margin: '2px', fontFamily: 'Space Mono, monospace' }}> As you can mark everything you want, a city, hotel, restaurant, shop,
                        hidden beach or why not if you are in the mountains add points there too and it becomes like an eco trail,
                        it all depends on the person how much it wants to be detailed and what it wants to describe.

                    </h4>

                    <CardMedia
                        component="img"
                        sx={{ height: '440px', width: 'auto', margin: '20px', padding: '20px', '@media(max-width: 920px)': { height: 'auto', width: '100%', margin: '15px 0px 15px 0px', padding: '0' } }}
                        src={'https://storage.googleapis.com/hack-trip/hack-trip-points2.png'}
                        title="hack trip"
                        alt="hack trip"
                        loading="lazy"
                    />
                    <h4 style={{ margin: '2px', fontFamily: 'Space Mono, monospace' }}>
                        You can also, if you have a trip coming up, plan your trip,
                        set every single point and then follow them and of course if you decide you can edit them later when you are on the spot,
                        if you want to add photos or a description and so others will be able to follow your journey live with you.
                    </h4>
                    <CardMedia
                        component="img"
                        sx={{ height: '240px', width: 'auto', margin: '20px', padding: '20px', '@media(max-width: 920px)': { height: 'auto', width: '100%', margin: '15px 0px 15px 0px', padding: '0' } }}
                        src={'https://storage.googleapis.com/hack-trip/hack-trip-points3.png'}
                        title="hack trip"
                        alt="hack trip"
                        loading="lazy"
                    />
                    <h5 style={{ margin: '2px', fontFamily: 'Space Mono, monospace' }}>Enjoy the Hack Trip !</h5>
                    <h5>You can contact us at email:  www.hack.trip@gmail.com</h5>

                </Box>
            </Grid>

        </>

    )
}

export default AboutUs;