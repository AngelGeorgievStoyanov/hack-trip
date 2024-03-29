import { Card, CardActions, CardContent, Collapse, ImageList, ImageListItem, Typography } from "@mui/material";
import { Point } from "../../model/point";
import { sliceDescription } from "../../shared/common-types";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { BaseSyntheticEvent, FC, ReactElement, useState } from "react";


interface PointCardProps {
    point: Point;
    onClickPointImage: (e: BaseSyntheticEvent) => void;
    refPoint: any
}

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));



const TripDetailsPointCard: FC<PointCardProps> = ({ point, onClickPointImage, refPoint }): ReactElement => {



    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };



    return (
        <>
            <Card ref={refPoint} sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: 'auto',
                maxWidth: '500px', margin: '20px',
                padding: '25px 0px 0px 0px', backgroundColor: '#eee7e79e',
                boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px',
                marginBottom: '200px'
            }}>
                <Typography gutterBottom variant="h5" component="div" sx={{ padding: '0px 15px' }}>
                    Point name: {point.name}
                </Typography>


                {(point.imageFile?.length && point.imageFile?.length > 0) ?
                    <>
                        <ImageList sx={{ width: 'auto', height: 'auto', margin: '0px', '@media(max-width: 600px)': { width: 'auto', height: 'auto' } }} cols={point.imageFile.length > 4 ? 3 : point.imageFile.length === 4 ? 2 : point.imageFile.length === 3 ? 3 : point.imageFile.length} rowHeight={point.imageFile.length > 9 ? 164 : 'auto'}>
                            {point.imageFile ? point.imageFile.map((item, i) => (

                                <ImageListItem key={i}>
                                    <img
                                        src={`https://storage.googleapis.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format`}
                                        srcSet={`https://storage.googleapis.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                        alt={item}
                                        loading="lazy"
                                        onClick={onClickPointImage}
                                        style={{ cursor: 'pointer' }}
                                        height={'auto'}
                                        width={'auto'}
                                    />
                                </ImageListItem>
                            )) : ''}
                        </ImageList>
                    </>
                    :
                    <Typography variant="subtitle2" sx={{ padding: '0px 25px' }}>
                        FOR THIS POINT DON'T HAVE IMAGES
                    </Typography>
                }

                {point.description.length < 150 ?
                    <Typography gutterBottom variant="h6" component="div" sx={{ padding: '0px 15px', marginTop: '10px' }}>
                        Description: {point.description}
                    </Typography>
                    :
                    <>
                        <Typography gutterBottom variant="h6" component="div" sx={{ padding: '0px 15px', marginTop: '10px' }}>
                            Description: {sliceDescription(point.description, 150)}
                        </Typography>

                        <CardActions disableSpacing>
                            <ExpandMore
                                expand={expanded}
                                onClick={handleExpandClick}
                                aria-expanded={expanded}
                                aria-label="show more"
                            >
                                <ExpandMoreIcon />
                            </ExpandMore>
                        </CardActions>
                        <Collapse in={expanded} timeout="auto" unmountOnExit>
                            <CardContent>
                                <Typography paragraph>
                                    Description: {point.description}
                                </Typography>
                            </CardContent>
                        </Collapse>
                    </>
                }

            </Card>
        </>
    )
}

export default TripDetailsPointCard;