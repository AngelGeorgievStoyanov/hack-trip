

import { AlignHorizontalCenter } from '@mui/icons-material';
import { Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import { margin } from '@mui/system';
import { Link } from 'react-router-dom';
import { Trip } from '../../../../model/trip';
import './TripCard.css'


interface TripCardProps {
    trip: Trip;

}


export default function TripCard({ trip }: TripCardProps) {

   



    return (
        <>


            <Card sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '300px', margin: '20px',
                padding: '25px', backgroundColor: '#8d868670',
                boxShadow: '3px 2px 5px black', border: 'solid 2px', borderRadius: '12px'
            }}>
                <Typography gutterBottom variant="h5" component="div">
                    Title of the trip :{trip.title}
                </Typography>
                <Typography gutterBottom variant="h6" component="div">
                    Destination of the trip :{trip.destination}
                </Typography>

                {trip.imageUrl ?
                    <CardMedia
                        component="img"
                        height="200"
                        image={trip.imageUrl}
                        alt="TRIP"

                    /> :
                    <Typography gutterBottom  component="h6">
                        There is no image for this trip
                    </Typography>

                }
                <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

                    <Button component={Link} to={`/trip/details/${trip._id}`} sx={{ backgroundColor: "#0e0d0d", color: "#f3eeee", margin: '10px', ':hover': { backgroundColor: "#f3eeee", color: "#0e0d0d" } }}>DETAILS</Button>

                    {trip.likes.length > 0 ?
                        < Typography sx={{ margin: '10px' }} gutterBottom variant="h6" component="div">
                            LIKES :{trip.likes.length}
                        </Typography> : ''
                    }

                </CardContent>
            </Card>
        </>


    )
}