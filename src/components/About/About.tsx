import { Grid, Box } from "@mui/material"


function AboutUs() {


    return (

        <Grid container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#cfe8fc', padding: '0', margin: '0', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#cfe8fc', maxWidth: '80%' }}>
                <h1>ABOUT US</h1>
            </Box>
        </Grid>
    )
}

export default AboutUs