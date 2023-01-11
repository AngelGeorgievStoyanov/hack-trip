import { Grid } from '@mui/material'
import { useLoaderData } from 'react-router-dom'
import { Trip } from '../../model/trip'
import TripList from '../Trips/TripsList/TripsList'
import './Home.css'


function Home() {

    const trips = useLoaderData() as Trip[]
    console.log(trips)

    return (
        <>

        <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px',minHeight:'100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

            <section className="home-section">
                <div className="div-h1">
                    <h1>Welcome TRAVELERS or future TRAVELERS!</h1>
                    <h1>This is an APP where you can share your trips or get valuable tips for your future trips.</h1>
                    <h1>These are our TOP 5 most liked TRIPS!</h1>

                </div>
                <article className="top-trips">
                    <TripList trips={trips} />
                </article>
            </section>
            </Grid>
        </>
    )

}

export default Home