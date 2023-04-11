import { Grid, Box, CardMedia } from "@mui/material";


function AboutUs() {


    return (

        <Grid container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#cfe8fc', padding: '0', margin: '-25px 0px 0px 0px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#cfe8fc', maxWidth: '80%' }}>
                <h2 style={{ margin: '2px' }}>Welcome TRAVELERS or future TRAVELERS!</h2>
                <h5 style={{ margin: '2px' }}>This is an APP where you can share your trips or get valuable tips for your future trips.</h5>
                <h4 style={{ margin: '2px' }}>
                    The idea of ​​HACK-TRIP is to help all travelers, if you want to visit a certain destination, city or area, enter to search for information and see other travelers if they have been there and if they have described
                    what they recommend and then if wish you could add your journey and be of help.</h4>
                <CardMedia
                    component="img"
                    sx={{ height: '240px', width: 'auto', margin: '20px', padding: '20px', '@media(max-width: 920px)': { height: 'auto', width: '380px', padding: '20px' } }}
                    src={'https://storage.googleapis.com/hack-trip/hack-trip-markers.png'}
                    title="hack-trip-points"

                />
                <h4> It's integrated for you Google Maps and you can add points Markers.</h4>

                <CardMedia
                    component="img"
                    sx={{ height: '440px', width: 'auto', margin: '20px', padding: '20px', '@media(max-width: 920px)': { height: 'auto', width: '380px', padding: '20px' } }}
                    src={'https://storage.googleapis.com/hack-trip/hack-trip-points1.png'}
                    title="hack-trip-points"

                />
                <h4> As you can mark everything you want, a city, hotel, restaurant, shop,
                    hidden beach or why not if you are in the mountains add points there too and it becomes like an eco trail,
                    it all depends on the person how much it wants to be detailed and what it wants to describe.

                </h4>

                <CardMedia
                    component="img"
                    sx={{ height: '440px', width: 'auto', margin: '20px', padding: '20px', '@media(max-width: 920px)': { height: 'auto', width: '380px', padding: '20px' } }}
                    src={'https://storage.googleapis.com/hack-trip/hack-trip-points2.png'}
                    title="hack-trip-points"

                />
                <h4>
                    You can also, if you have a trip coming up, plan your trip,
                    set every single point and then follow them and of course if you decide you can edit them later when you are on the spot,
                    if you want to add photos or a description and so others will be able to follow your journey live with you.
                </h4>
                <CardMedia
                    component="img"
                    sx={{ height: '240px', width: 'auto', margin: '20px', padding: '20px', '@media(max-width: 920px)': { height: 'auto', width: '380px', padding: '20px' } }}
                    src={'https://storage.googleapis.com/hack-trip/hack-trip-points3.png'}
                    title="hack-trip-points"

                />
                <h5>You can contact us at email:  www.hack.trip@gmail.com</h5>

            </Box>
        </Grid>
    )
}

export default AboutUs;