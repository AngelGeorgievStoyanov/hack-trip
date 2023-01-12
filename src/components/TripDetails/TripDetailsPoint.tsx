import { Card, CardMedia, Typography } from "@mui/material";
import { Point } from "../../model/point"


interface PointCardProps {
    point: Point;

}


export default function TripDetailsPointCard({ point }: PointCardProps) {


    return (
        <>


            <Card sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '300px', margin: '0 20px',
                padding: '25px', backgroundColor: '#8d868670',
                boxShadow: '3px 2px 5px black', border: 'solid 2px', borderRadius: '12px'
            }}>
                <Typography gutterBottom variant="h5" component="div">
                    POINT NAME :{point.name}
                </Typography>
                <Typography gutterBottom variant="h6" component="div">
                    DESCRIPTION :{point.description}
                </Typography>

                {point.imageUrl ?
                    <CardMedia
                        component="img"
                        height="200"
                        image={point.imageUrl}
                        alt="TRIP-POINT"

                    />
                    : <h5>NO IMAGE ADDED</h5>
                }
            </Card>


        </>
    )
}