
import { Button, Card, CardContent,  ImageList, ImageListItem, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Trip } from '../../../../model/trip';
import jwt_decode from "jwt-decode";
import { LoginContext } from '../../../../App';
import { useContext } from 'react';




type decode = {
    _id: string,
    email: string,
    firstName: string,
    lastName: string,
    role: string
}

interface TripCardProps {
    trip: Trip;

}



export default function TripCard({ trip }: TripCardProps) {


    const userId = sessionStorage.getItem('userId');


    const { userL, setUserL } = useContext(LoginContext);


    const accessToken = userL?.accessToken ? userL.accessToken : sessionStorage.getItem('accessToken') ? sessionStorage.getItem('accessToken') : undefined;

    let role = 'user';
    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;
    }



    return (
        <>
            {(((trip.reportTrip !== undefined) && (trip.reportTrip !== null) && (trip.reportTrip.length >= 5)) && (role === 'user')) ? '' :
                <Card sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '300px', margin: '20px',
                    height: 'fit-content',
                    padding: '25px', backgroundColor: '#8d868670',
                    boxShadow: '3px 2px 5px black', border: 'solid 2px', borderRadius: '12px'
                }}>
                    <Typography gutterBottom variant="h5" component="div">
                        Title of the trip :{trip.title}
                    </Typography>
                    <Typography gutterBottom variant="h6" component="div">
                        Destination of the trip :{trip.destination}
                    </Typography>
                    {trip.imageFile?.length && trip.imageFile.length > 0 ?
                        <ImageList sx={{ width: 320, height: 350 }} cols={3} rowHeight={164}>
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
                            (((role === 'admin') || (role === 'manager')) && ((trip.reportTrip !== undefined) && (trip.reportTrip?.length > 0))) ?
                                <Button component={Link} to={`/admin/trip/details/${trip._id}`} variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, padding: '10px 50px' }}>DETAILS</Button>
                                :
                                (userId !== null) ?
                                    <Button component={Link} to={`/trip/details/${trip._id}`} variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, padding: '10px 50px' }}>DETAILS</Button>
                                    :
                                    ''}

                        {trip.likes.length > 0 ?
                            < Typography sx={{ margin: '10px' }} gutterBottom variant="h6" component="div">
                                LIKES :{trip.likes.length}
                            </Typography> : ''
                        }

                    </CardContent>
                </Card>
            }
        </>

    )
}