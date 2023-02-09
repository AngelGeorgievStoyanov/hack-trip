import { Card, CardMedia, ImageList, ImageListItem, Typography } from "@mui/material";
import { Point } from "../../model/point";


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
                height: 'auto',
                maxWidth: '500px', margin: '0 20px',
                padding: '25px', backgroundColor: '#8d868670',
                boxShadow: '3px 2px 5px black', border: 'solid 2px', borderRadius: '12px'
            }}>
                <Typography gutterBottom variant="h5" component="div">
                    POINT NAME :{point.name}
                </Typography>
                <Typography gutterBottom variant="h6" component="div">
                    DESCRIPTION :{point.description}
                </Typography>


                {(point.imageFile?.length && point.imageFile?.length > 0) ?
                    <>
                        <ImageList sx={{ width: 'auto', height: 'auto', '@media(max-width: 600px)': { width: 'auto', height: 'auto' } }} cols={3} rowHeight={164}>
                            {point.imageFile ? point.imageFile.map((item, i) => (
                                <ImageListItem key={i}>
                                    <img
                                        src={`https://storage.cloud.google.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format`}
                                        srcSet={`https://storage.cloud.google.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}

                                        alt={item}
                                        loading="lazy"
                                    />
                                </ImageListItem>
                            )) : ''}
                        </ImageList>
                    </>
                    :
                    <h4>FOR THIS POINT DON'T HAVE IMAGES</h4>
                }
            </Card>
        </>
    )
}