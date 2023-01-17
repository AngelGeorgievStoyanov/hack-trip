import { useLoaderData } from "react-router-dom";
import { Trip } from "../../model/trip";
import TripList from "./TripsList/TripsList";
import { Container, Grid } from "@mui/material";

import './Trips.css'


export default function Trips() {


    const trips = useLoaderData() as Trip[]

    return (
        <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px',minHeight:'100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>



                <TripList trips={trips} />

        </Grid>
    )
}