
import { Button, Card, CardContent, ImageList, ImageListItem, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Trip } from '../../../../model/trip';
import jwt_decode from "jwt-decode";
import { LoginContext } from '../../../../App';
import { useContext, useState } from 'react';
import { IdType } from '../../../../shared/common-types';
import { User } from '../../../../model/users';
import * as userService from '../../../../services/userService';
import { ApiClient } from '../../../../services/userService';




type decode = {
    _id: string,
    role: string
}

interface TripCardProps {
    trip: Trip;

}

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');

let userId: string | undefined;

export default function TripCard({ trip }: TripCardProps) {

    const [userVerId, setUserVerId] = useState<boolean>(false)



    const { userL } = useContext(LoginContext);


    const accessToken = userL?.accessToken ? userL.accessToken : sessionStorage.getItem('accessToken') ? sessionStorage.getItem('accessToken') : undefined;

    let role = 'user';
    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;
        userId = decode._id
    }


    if (userId !== undefined && userId !== null) {
        API_CLIENT.findUserId(userId).then((data) => {
          
            setUserVerId(data)
        }).catch((err) => {
            console.log(err)
        })
    }



    return (
        <>
            {(((trip.reportTrip !== undefined) && (trip.reportTrip !== null) && (Number(trip.reportTrip)) >= 5) && (role === 'user')) ? '' :
                <Card sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '300px', margin: '20px',
                    height: 'fit-content',
                    padding: '25px 0px 0px 0px', backgroundColor: '#8d868670',
                    boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px'
                }}>
                    <Typography gutterBottom variant="h5" component="div" sx={{ padding: '0px 15px' }}>
                        Title of the trip: {trip.title}
                    </Typography>
                    <Typography gutterBottom variant="h6" component="div" sx={{ padding: '0px 15px' }}>
                        Destination of the trip: {trip.destination}
                    </Typography>
                    {trip.imageFile?.length && trip.imageFile.length > 0 ?
                        <ImageList sx={{ maxWidth: 320, maxHeight: 350 }} cols={trip.imageFile.length > 3 ? 3 : trip.imageFile.length} rowHeight={trip.imageFile.length > 9 ? 164 : 'auto'}>
                            {trip.imageFile ? trip.imageFile.map((item, i) => (
                                <ImageListItem key={i}>
                                    <img
                                        src={`https://storage.googleapis.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format`}
                                        srcSet={`https://storage.googleapis.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                        alt={item}
                                        loading="lazy"
                                    />
                                </ImageListItem>
                            )) : ''}
                        </ImageList>
                        :
                        <Typography gutterBottom component="h6">
                            There is no image for this trip
                        </Typography>
                    }
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                        {
                            (((role === 'admin') || (role === 'manager')) && (Number(trip.reportTrip) > 0) && (userVerId === true)) ?
                                <Button href={`/admin/trip/details/${trip._id}`} variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, padding: '10px 50px' }}>DETAILS</Button>
                                :
                                (userVerId === true) ?
                                    <Button href={`/trip/details/${trip._id}`} variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, padding: '10px 50px' }}>DETAILS</Button>
                                    :
                                    ''}

                        {Number(trip.likes) > 0 ?
                            < Typography sx={{ margin: '10px' }} gutterBottom variant="h6" component="div">
                                LIKES: {Number(trip.likes[0])}
                            </Typography> : ''
                        }

                    </CardContent>
                </Card>
            }
        </>

    )
}