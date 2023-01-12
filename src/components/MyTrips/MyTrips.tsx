import { Box, Button,  Grid, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import { Trip, TripCreate } from "../../model/trip"
import TripList from "../Trips/TripsList/TripsList"
import * as tripService from '../../services/tripService'


import './MyTrips.css'
import { IdType } from "../../shared/common-types"
import { ApiTrip } from "../../services/tripService"
import { useEffect, useState } from "react"

export default function MyTrips() {
    const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data/trips');

    const [trips, setTrips] = useState<Trip[]>([])
    const userId = sessionStorage.getItem('userId')

    useEffect(() => {


        if (userId !== null) {

            API_TRIP.findAllMyTrips(userId).then((data) => {

                setTrips(data)

            }).catch((err) => {
                console.log(err)
                throw err.message
            })
        }



    }, [])

    return (
        <>

            <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

                {trips.length === 0 ?


                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                        <Typography gutterBottom variant="h4" component="div">
                            You dont't have a published trip yet.
                        </Typography>
                        <Button component={Link} to={'/create-trip'} sx={{ backgroundColor: "#0e0d0d", color: "#f3eeee", margin: '10px', ':hover': { backgroundColor: "#f3eeee", color: "#0e0d0d" } }}>CLICK HERE AN ADD YOUR FIRST TRIP</Button>
                    </Box>

                    :

                    <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>


                        <Typography gutterBottom sx={{margin:'50px'}} variant="h4" component="div">
                            These are your trips
                        </Typography>
                        <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh'  }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>


                         

                                <TripList trips={trips} />

                         

                        </Grid>
                    </Grid>

                }

            </Grid>

        </>
    )
}