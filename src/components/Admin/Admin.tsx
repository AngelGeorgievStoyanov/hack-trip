import { Box, Button } from "@mui/material"
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom"
import { User } from "../../model/users"
import UsersList from "../UsersList/UsersList";
import * as tripService from '../../services/tripService'
import { IdType } from "../../shared/common-types";
import { ApiTrip } from "../../services/tripService";
import { Trip, TripCreate } from "../../model/trip";
import TripList from "../Trips/TripsList/TripsList";



const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data/trips');




export default function Admin() {

    const users = useLoaderData() as User[]

    const [trips, setTrips] = useState<Trip[]>()
    const [hideUsersList, setHideUsersList] = useState<boolean>(true)
    const [hideTripsList, setHideTripsList] = useState<boolean>(true)


   






    useEffect(() => {

        API_TRIP.getAllReportTrips().then((data) => {
            setTrips(data)
        }).catch(err => console.log(err))
    }, [])


    const hideUsers = () => {

        setHideUsersList(!hideUsersList)


    }


    const hideTrips = () => {
        setHideTripsList(!hideTripsList)
    }


    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#cfe8fc', minHeight: '100vh', marginTop: '-24px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-evenly', margin: '20px' }}>

                    <Button variant="contained" onClick={hideUsers} sx={{ maxWidth: '150px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >{hideUsersList ? 'HIDE USERS' : 'SHOW USERS'} </Button>
                    {trips !== undefined && trips.length > 0 ?
                        <Button variant="contained" onClick={hideTrips} sx={{ maxWidth: '150px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >{hideTripsList ? 'HIDE TRIPS' : 'SHOW TRIPS'} </Button>
                        : 'NO TRIPS REPORTED'}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row' }}>


                    {hideUsersList ?
                        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>


                            <UsersList users={users} />


                        </Box>

                        : ''}


                    {hideTripsList ?
                        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', }}>
                            {trips !== undefined && trips.length > 0 ?
                                <TripList trips={trips} />
                                : ''}

                        </Box>
                        : ''}

                </Box>
            </Box>
        </>
    )
}