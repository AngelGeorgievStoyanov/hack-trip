import { Link, useNavigate, useParams } from "react-router-dom";
import { Trip, TripCreate } from "../../model/trip";
import { ApiTrip } from "../../services/tripService";
import { IdType, sliceDescription } from "../../shared/common-types";
import * as tripService from '../../services/tripService';
import * as pointService from '../../services/pointService';
import { Point } from "../../model/point";
import { ApiPoint } from "../../services/pointService";
import { BaseSyntheticEvent, FC, useContext, useEffect, useState, TouchEvent } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import React from "react";
import * as commentService from '../../services/commentService';
import { Comment, CommentCreate } from "../../model/comment";
import { ApiComment } from "../../services/commentService";
import CommentCard from "../CommentCard/CommentCard";
import { Box, Button, Card, CardActions, CardContent, CircularProgress, Collapse, Container, Grid, ImageList, ImageListItem, MobileStepper, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { styled, useTheme } from '@mui/material/styles';
import { LoginContext } from "../../App";
import jwt_decode from "jwt-decode";
import TripDetailsPointCard from "../TripDetails/TripDetailsPoint";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import GoogleMapWrapper from "../GoogleMapWrapper/GoogleMapWrapper";


type decode = {
    _id: string,
    role: string
}

let zoom = 12;

let center = {
    lat: 42.697866831005435,
    lng: 23.321590139866355
}
let userId: string;


const googleKey = process.env.REACT_APP_GOOGLE_KEY;

const libraries: ("drawing" | "geometry" | "localContext" | "places" | "visualization")[] = ["places"];


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

const AdminTripDetails: FC = () => {


    const navigate = useNavigate();
    const idTrip = useParams().tripId;

    const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data');
    const API_COMMENT: ApiComment<IdType, CommentCreate> = new commentService.ApiCommentImpl<IdType, CommentCreate>('data/comments');
    const API_POINT: ApiPoint<IdType, Point> = new pointService.ApiPointImpl<IdType, Point>('data/points');

    const theme = useTheme();
    const [activeStep, setActiveStep] = React.useState(0);
    const [points, setPoints] = useState<Point[]>([]);
    const [comments, setComments] = useState<CommentCreate[]>([]);
    const [liked, setLiked] = useState<boolean>();
    const [hide, setHide] = useState<boolean>(false);
    const [pointCard, setPointCard] = useState<Point | null>();
    const [mapCenter, setMapCenter] = useState(center);
    const [tripReports, setTripReports] = useState<Trip>();
    const [reportedComment, setReportedComment] = useState<boolean>(false);
    const [trip, setTrip] = useState<Trip>()
    const [expanded, setExpanded] = useState(false);
    const [fullImage, setFullImage] = useState<boolean>(false)
    const [fullPointImage, setPointFullImage] = useState<boolean>(false)
    const [activeStepImage, setActiveStepImage] = useState(0);
    const [touchStart, setTouchStart] = useState<number>(0)
    const [touchEnd, setTouchEnd] = useState<number>(0)
    const [maxSteps, setMaxSteps] = useState<number>(0)
    const [loadPointFullImage, setLoadFullImage] = useState<boolean>(false)
    const [loadTripFullImage, setLoadTripFullImage] = useState<boolean>(false)

    const minSwipeDistance = 45;


    const { token } = useContext(LoginContext)

    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined
    let role = 'user';
    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;
        userId = decode._id
    }


    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const scrollMedia = useMediaQuery('(max-width:900px)');

    const refPoint = React.useRef<HTMLDivElement | null>()


    useEffect(() => {
        if (idTrip !== undefined) {


            API_TRIP.findById(idTrip, userId).then((data) => {
                if (data) {
                    setTrip(data)

                    API_POINT.findByTripId(data._id).then((data) => {

                        if (data && Array.isArray(data)) {
                            const arrPoints = data as Point[];

                            if (arrPoints !== undefined && arrPoints.length > 0) {

                                arrPoints.sort((a, b) => Number(a.pointNumber) - Number(b.pointNumber))


                                center = {
                                    lat: Number(arrPoints[0].lat),
                                    lng: Number(arrPoints[0].lng)
                                }

                                setPoints(arrPoints);
                            }

                        }
                        setMapCenter(center);
                    }).catch((err) => {
                        console.log(err);
                    });

                    API_COMMENT.findByTripId(data._id, userId).then(async (data) => {
                        if (data && Array.isArray(data)) {
                            setComments(data);
                        }


                    }).catch((err) => {
                        console.log(err);
                    });
                }
            }).catch((err) => {
                console.log(err)
            })

        }

    }, []);

    useEffect(() => {
        if (refPoint.current && scrollMedia) {
            refPoint.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
    }, [pointCard])

    if (trip !== undefined) {

        if ((trip.lat !== undefined && trip.lat !== null) && (trip.lng !== undefined && trip.lat !== null) && (Array.from(points).length === 0)) {

            center = {
                lat: Number(trip.lat),
                lng: Number(trip.lng)
            }
        }
    }

    const deleteClickHandler = () => {

        if (trip === undefined) return;
        API_TRIP.deleteById(trip._id, userId).then((data) => {
            API_POINT.deleteByTripId(trip._id, userId).then((data) => {
                API_COMMENT.deleteByTripId(trip._id, userId).then((data) => {

                }).catch((err) => {
                    console.log(err);
                })
            }).catch((err) => {
                console.log(err);
            })
            navigate('/admin');
        }).catch((err) => {
            console.log(err);
        })


    }


    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',

        googleMapsApiKey: googleKey!,
        libraries,
    })


    const mapRef = React.useRef<google.maps.Map | null>(null);


    const pathPoints = (points?.length) && (points !== undefined) ? points?.sort((a, b) => Number(a.pointNumber) - Number(b.pointNumber)).map((x) => { return { lat: Number(x.lat), lng: Number(x.lng) } }) : []

    const onLoad = (map: google.maps.Map): void => {
        mapRef.current = map;

        if (points.length === 0 && trip) {
            mapRef.current.setCenter({ lat: Number(trip.lat), lng: Number(trip.lng) });
        } else {
            const bounds = new google.maps.LatLngBounds();
            points?.forEach(({ lat, lng }) => bounds.extend({ lat: Number(lat), lng: Number(lng) }));
            map.fitBounds(bounds);
        }
    }

    const onUnmount = (): void => {
        mapRef.current = null;
    }

    if (!isLoaded) return <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh', '@media(max-width: 900px)': { display: 'flex', width: '100vw', padding: '0', margin: '0' } }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}><Typography sx={{ fontFamily: 'Space Mono, monospace' }} variant='h4'>MAP LOADING ...</Typography></Grid>


    if (trip !== undefined && points.length > 0 && activeStep === 0 && mapRef.current) {
        const bounds = new google.maps.LatLngBounds();
        points?.forEach(({ lat, lng }) => bounds.extend({ lat: Number(lat), lng: Number(lng) }));
        mapRef.current?.fitBounds(bounds);
    }

    if (points.length === 0 && trip && mapRef.current) {
        mapRef.current.setCenter({ lat: Number(trip.lat), lng: Number(trip.lng) });
    }

    const onMarkerClick = (id: string, positionNumber: number) => {


        if (id) {
            const currentPoint = points!.filter((x) => x._id + '' === id)

            if (currentPoint !== undefined && currentPoint !== null) {

                setPointCard(currentPoint[0]);

                setActiveStep((prevActiveStep) => Number(currentPoint[0].pointNumber));

                center = {
                    lat: Number(currentPoint[0].lat),
                    lng: Number(currentPoint[0].lng)
                }

                mapRef.current?.panTo(center);

                mapRef.current?.set('zoom', 14);
            }

        } else if (positionNumber) {

            const currentPoint: Point[] = points.filter((x) => Number(x.pointNumber) === positionNumber);
            if (currentPoint[0] !== undefined && currentPoint[0] !== null) {

                setPointCard(prev => currentPoint[0]);

                center = {
                    lat: Number(currentPoint[0].lat),
                    lng: Number(currentPoint[0].lng)
                }

                mapRef.current?.panTo(center);

                mapRef.current?.set('zoom', 14);
            }

        } else if (positionNumber === 0) {
            setPointCard(null);

            center = {
                lat: Number(points[0].lat),
                lng: Number(points[0].lng)
            }
            mapRef.current?.panTo(center);

            const bounds = new google.maps.LatLngBounds();
            points?.forEach(({ lat, lng }) => bounds.extend({ lat: Number(lat), lng: Number(lng) }));
            mapRef.current?.fitBounds(bounds);
        }

    }

    const onLoadComments = (newCommentArr: Comment[] | undefined) => {

        setHide(true);

    }

    const onHideComments = () => {

        setHide(false);
    }

    const onDeleteComment = async (comment: Comment) => {


        API_COMMENT.deleteById(comment._id).then((data) => {
            if (data !== undefined) {


                const copyComments = [...comments];
                const index = copyComments.findIndex(cmt => {
                    return cmt._id === comment._id;
                });

                copyComments.splice(index, 1);

                setComments(copyComments);

            }
        }).catch((err) => {
            console.log(err)
        });



    }

    const onEditComment = async (comment: Comment) => {
        navigate(`/comments/edit/${comment._id}`);


    }

    const onLikeTrip = () => {

        if ((userId !== undefined) && (trip !== undefined) && (userId !== null)) {
            trip.likes.push(userId);

            API_TRIP.updateLikes(trip._id, userId).then((data) => {
                setTrip(data);
                setLiked(prev => true);

            }).catch((err) => {
                console.log(err);
            });

        }

    }

    const onUnLikeTrip = () => {

        if ((userId !== undefined) && (trip !== undefined) && (userId !== null)) {

            API_TRIP.updateLikes(trip._id, userId).then((data) => {

                setTrip(data);
                setLiked(prev => false);
            }).catch((err) => {
                console.log(err);
            });
        }

    }


    const deleteReportClickHandler = () => {

        if ((userId !== undefined) && (trip !== undefined) && (userId !== null)) {
            const reports: [] = [];

            API_TRIP.deleteReportTrip(trip._id, reports).then((data) => {
                setTripReports(data);
            }).catch((err) => {
                console.log(err);
            });

        }
    }


    const goBack = () => {
        navigate(-1);
    }


    const handleNext = () => {


        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        let position = activeStep + 1;
        onMarkerClick('', position);


    };

    const handleBack = () => {

        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        let position = activeStep - 1;
        onMarkerClick('', position);
    }


    const MuiTooltipUnlike = () => {
        return (
            <Tooltip title='UN LIKE' arrow>

                <ThumbUpIcon color="primary" onClick={onUnLikeTrip} fontSize="large" sx={{ ':hover': { cursor: 'pointer' }, margin: '5px' }} />
            </Tooltip>
        )
    }



    const MuiTooltipLike = () => {
        return (
            <Tooltip title='LIKE' arrow>
                < ThumbUpOffAltIcon color="primary" onClick={onLikeTrip} fontSize="large" sx={{ ':hover': { cursor: 'pointer' }, margin: '5px' }} />

            </Tooltip>
        )
    }


    const reportClickHandlerComment = (comment: Comment) => {
        if ((userId !== undefined) && (comment !== undefined) && (userId !== null)) {
            comment.reportComment?.push(userId);

            API_COMMENT.reportComment(comment._id, comment).then((data) => {

                setReportedComment(true);

                setComments(data)

            }).catch((err) => {
                console.log(err);
            });

        }
    }


    const unReportClickHandlerComment = (comment: Comment) => {

        if ((userId !== undefined) && (comment !== undefined) && (userId !== null)) {

            if (comment.reportComment !== undefined) {

                const index = comment.reportComment.indexOf(userId);

                comment.reportComment.splice(index, 1);

                API_COMMENT.reportComment(comment._id, comment).then((data) => {

                    setReportedComment(false);
                    setComments(data)
                }).catch((err) => {
                    console.log(err);
                });

            }
        }
    }


    const onClickImage = (e: BaseSyntheticEvent) => {
        let imageName = e.currentTarget.src.split('hack-trip/')[1].split('?')[0];
        let indexImage = trip?.imageFile?.indexOf(imageName);
        setActiveStepImage(indexImage ? indexImage : 0);
        setFullImage(true);
        setMaxSteps(trip && (trip.imageFile) ? trip?.imageFile.length : 0)

    }




    const handleNextImage = () => {
        setActiveStepImage((prevActiveStep) => prevActiveStep + 1);
        setLoadFullImage(false);
        setLoadTripFullImage(false);
    }

    const handleBackImage = () => {
        setActiveStepImage((prevActiveStep) => prevActiveStep - 1);
        setLoadFullImage(false);
        setLoadTripFullImage(false);
    }


    const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(0)
        setTouchStart(e.targetTouches[0].clientX);
    }


    const onTouchMove = (e: TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    }

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe === true) {

            if (activeStepImage < maxSteps - 1) {
                setLoadFullImage(false);
                setLoadTripFullImage(false);
                setActiveStepImage((prevActiveStep) => prevActiveStep + 1);
            }

        } else if (isRightSwipe === true) {

            if (activeStepImage > 0) {
                setLoadFullImage(false);
                setLoadTripFullImage(false);
                setActiveStepImage((prevActiveStep) => prevActiveStep - 1);
            }
        }

    }


    const onClickClose = (e: BaseSyntheticEvent) => {
        setFullImage(false);
        setPointFullImage(false);
        setLoadFullImage(false);
        setLoadTripFullImage(false);
    }

    const onClickPointImage = (e: BaseSyntheticEvent) => {

        let imageName = e.currentTarget.src.split('hack-trip/')[1].split('?')[0];
        let indexImage = pointCard?.imageFile?.indexOf(imageName);
        setActiveStepImage(indexImage ? indexImage : 0);
        setPointFullImage(true)
        setFullImage(false)
        setMaxSteps(pointCard && (pointCard.imageFile) ? pointCard?.imageFile.length : 0)

    }

    const onLoadFullPointImage = () => {
        setLoadFullImage(true)
    }
    const onLoadFullTripImage = () => {
        setLoadTripFullImage(true);

    }

    const body = document.querySelector('body');
    if ((fullImage || fullPointImage) && body) {
        body.style.overflow = 'hidden';
    } else if (!fullImage && !fullPointImage && body) {
        body.style.overflow = 'auto';
    }

    return (
        <>
            <Grid container sx={{
                justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh', alignItems: 'center',
                '@media(max-width: 900px)': { display: 'flex', alignItems: 'center', width: '100vw', padding: '0', paddingBottom: '15px', margin: '-25px 0px 0px 0px' }
            }}
                spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                {!fullImage && !fullPointImage ?
                    <>
                        <Container maxWidth={false} sx={{
                            display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', bgcolor: '#cfe8fc', '@media(max-width: 900px)': {
                                display: 'flex', flexDirection: 'column-reverse'
                            }
                        }}>

                            <Card sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                minWidth: '200px',
                                maxWidth: '450px', margin: '20px',
                                padding: '25px', backgroundColor: '#8d868670',
                                boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px'
                            }}>
                                <Typography gutterBottom variant="h5" component="div">
                                    TRIP NAME : {trip?.title}
                                </Typography>
                                <Typography gutterBottom variant="subtitle1" component="h5">
                                    PRICE OF THE TRIP: {trip?.price ? trip.price + 'euro' : 'missing price'}
                                </Typography>
                                <Typography gutterBottom variant="subtitle1" component="div">
                                    TRANSPORT WITH: {trip?.transport}
                                </Typography>
                                <Typography gutterBottom variant="subtitle1" component="div">
                                    COUNT OF PEOPLE: {trip?.countPeoples}
                                </Typography>
                                <Typography gutterBottom variant="subtitle1" component="div">
                                    TYPE OF THE GROUP: {trip?.typeOfPeople}
                                </Typography>
                                <Typography gutterBottom variant="subtitle1" component="div">
                                    DESTINATION: {trip?.destination}
                                </Typography>
                                {(trip !== undefined) && (trip.description.length < 150) ?
                                    <Typography gutterBottom variant="subtitle1" component="div">
                                        DESCRIPTION : {trip?.description}
                                    </Typography>

                                    :

                                    <>
                                        {trip ?
                                            <>
                                                <Typography gutterBottom variant="subtitle1" component="div" sx={{ padding: '0px 15px', marginTop: '10px' }}>
                                                    Description: {sliceDescription(trip.description, 150)}
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
                                                            Description: {trip.description}
                                                        </Typography>
                                                    </CardContent>
                                                </Collapse>
                                            </> : ''}


                                    </>

                                }
                                <Typography gutterBottom variant="subtitle1" component="div">
                                    Reported by IDs : {trip?.reportTrip?.join(', ')}
                                </Typography>

                                {(trip && trip._ownerId === userId) ?
                                    <Button component={Link} to={`/trip/points/${trip?._id}`} variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}>ADD OR EDIT POINTS FOR YOUR TRIP</Button>

                                    :
                                    (role === 'admin' || role === 'manager') ?
                                        <Button component={Link} to={`/trip/points/${trip?._id}`} variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}>ADD OR EDIT POINTS FOR YOUR TRIP</Button>

                                        : (points !== undefined && points.length > 0) ?
                                            <Typography gutterBottom variant="subtitle1" component="div">
                                                FOR THIS TRIP HAVE {points.length} POINTS
                                            </Typography>
                                            :
                                            <Typography gutterBottom variant="subtitle1" component="div">
                                                FOR THIS TRIP DONT HAVE POINTS
                                            </Typography>
                                }

                                <Button component={Link} to={`/comments/add-comment/${trip?._id}`} variant="contained" sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}>ADD COMMENT</Button>

                                {((trip !== undefined && (trip._ownerId === userId)) || ((role === 'admin') || (role === 'manager'))) ?
                                    <>
                                        <Button component={Link} to={`/admin/trip/edit/${trip?._id}`} variant="contained" sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}>EDIT TRIP</Button>
                                        <Button variant="contained" onClick={deleteClickHandler} sx={{ ':hover': { background: '#ef0a0a' }, margin: '5px' }}>DELETE TRIP</Button>
                                    </>

                                    : ''}


                                <Button variant="contained" onClick={deleteReportClickHandler} sx={{ ':hover': { background: '#ef0a0a' }, margin: '5px' }}>DELETE {((trip !== undefined) && (tripReports !== undefined)) ? tripReports.reportTrip?.length : trip?.reportTrip?.length} REPORTS TRIP</Button>


                                <Button onClick={goBack} variant="contained" sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}  >BACK</Button>

                                {(trip) && (trip._ownerId !== userId) ?
                                    <>
                                        {
                                            trip.likes.some((x) => x === userId) || (liked === true) ?
                                                <MuiTooltipUnlike />
                                                :
                                                <MuiTooltipLike />
                                        }
                                    </>
                                    : ''}

                                {comments?.length ?

                                    <Button onClick={() => onLoadComments(undefined)} variant="contained" sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}  >FOR THIS TRIP HAVE {comments?.length} COMMENTS, SEE ALL COMMENTS</Button>
                                    :
                                    <Typography gutterBottom variant="subtitle1" component="div">
                                        FOR THIS TRIP DON'T HAVE COMMENT
                                    </Typography>
                                }

                                {comments.length > 0 ?

                                    <Button onClick={onHideComments} className="btn-hide" variant="contained" sx={{ display: hide ? 'block' : 'none', ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}  >HIDE COMMENTS</Button>
                                    : ''
                                }

                            </Card>
                            {(trip !== undefined) && (trip.imageFile?.length && trip.imageFile?.length > 0) ?
                                <>
                                    <ImageList sx={{ width: 520, height: 'auto', '@media(max-width: 600px)': { width: 'auto', height: 'auto' } }} cols={3} rowHeight={164}>
                                        {trip.imageFile ? trip.imageFile.map((item, i) => (
                                            <ImageListItem key={i}>
                                                <img
                                                    src={`https://storage.googleapis.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format`}
                                                    srcSet={`https://storage.googleapis.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}

                                                    alt={item}
                                                    loading="lazy"
                                                    onClick={onClickImage}
                                                />
                                            </ImageListItem>
                                        )) : ''}
                                    </ImageList>
                                </>
                                : <h4>FOR THIS TRIP DON'T HAVE IMAGES</h4>
                            }

                        </Container>
                        <Container maxWidth={false} sx={{ display: hide ? 'flex' : 'none', flexWrap: 'wrap' }} >
                            {comments.length > 0 ? comments.map((x) => <CommentCard key={x._id} comment={x} onDeleteCom={onDeleteComment} onEditCom={onEditComment} onUnReportClickHandlerComment={unReportClickHandlerComment} onReportClickHandlerComment={reportClickHandlerComment} reportedComment={reportedComment} userId={userId} />) : ''}
                        </Container>
                        <Container maxWidth={false} sx={{
                            display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '50px 50px', '@media(max-width: 900px)': {
                                display: 'flex', flexDirection: 'column', padding: '0px', alignItems: 'center'
                            }
                        }} >

                            <Box component='div' sx={{ display: 'flex', flexDirection: 'column', border: 'solid 1px', boxShadow: '3px 2px 5px black', height: 'fit-content', '@media(max-width: 600px)': { width: '94vw' } }}>
                                {points?.length > 0 ?
                                    <MobileStepper
                                        variant="progress"
                                        steps={points.length + 1}
                                        position="static"
                                        activeStep={activeStep}
                                        sx={{ maxWidth: 600, flexGrow: 1, maxHeight: '25px' }}
                                        nextButton={
                                            <Button size="small" onClick={handleNext} disabled={activeStep === points.length}>
                                                Next
                                                {theme.direction === 'rtl' ? (
                                                    <KeyboardArrowLeft />
                                                ) : (
                                                    <KeyboardArrowRight />
                                                )}
                                            </Button>
                                        }
                                        backButton={
                                            <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                                                {theme.direction === 'rtl' ? (
                                                    <KeyboardArrowRight />
                                                ) : (
                                                    <KeyboardArrowLeft />
                                                )}
                                                Back
                                            </Button>
                                        }
                                    />
                                    : ''}
                              
                                <GoogleMapWrapper
                                    center={mapCenter !== undefined ? mapCenter : center}
                                    zoom={zoom}
                                    onLoad={onLoad}
                                    onUnmount={onUnmount}
                                    points={points}
                                    trip={trip}
                                    pathPoints={pathPoints}
                                    onMarkerClick={onMarkerClick}
                                />
                            </Box>

                            <Box component='section' id="point-section-add">

                                {
                                    pointCard ? <TripDetailsPointCard onClickPointImage={onClickPointImage} point={pointCard} key={pointCard._id} refPoint={refPoint} /> : ''

                                }
                            </Box>
                        </Container>

                    </>
                    :
                    fullImage ?
                        <>
                            {trip && (trip.imageFile?.length) && (trip.imageFile.length > 0) ?
                                <>
                                    {!loadTripFullImage ? <CircularProgress sx={{ position: 'absolute', margin: '0 auto' }} /> : ''}

                                    <Box sx={{ position: 'relative', display: loadTripFullImage ? 'flex' : 'none', height: 'fit-content' }}>
                                        <ArrowBackIosIcon onClick={handleBackImage} sx={{
                                            cursor: 'pointer', fontSize: 35, position: 'absolute', left: 7, top: '50%',
                                            zIndex: 1, display: (activeStepImage === 0) ? 'none' : 'block',
                                            color: '#ffffffed'
                                        }} />
                                        <ArrowForwardIosIcon onClick={handleNextImage} sx={{
                                            cursor: 'pointer', fontSize: 35, position: 'absolute', right: 0, top: '50%',
                                            zIndex: 1, display: (activeStepImage === maxSteps - 1) ? 'none' : 'block',
                                            color: '#ffffffed'

                                        }} />
                                        <img onLoad={onLoadFullTripImage} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} src={`https://storage.googleapis.com/hack-trip/${trip.imageFile[activeStepImage]}`} alt='Trip' style={{ position: 'relative', maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain' }} />
                                        <CloseIcon sx={{
                                            cursor: 'pointer', position: 'absolute', fontSize: 35,
                                            top: 5, marginLeft: '50%', transform: 'translate(-17px,0px)', color: '#ffffffed'

                                        }} onClick={onClickClose} />
                                    </Box>
                                </>
                                : ''}
                        </>
                        :
                        fullPointImage ?
                            <>
                                {pointCard && (pointCard.imageFile?.length) && (pointCard.imageFile.length > 0) ?
                                    <>
                                        {!loadPointFullImage ? <CircularProgress sx={{ position: 'absolute', margin: '0 auto' }} /> : ''}

                                        <Box sx={{ position: 'relative', display: loadPointFullImage ? 'flex' : 'none' }}>
                                            <ArrowBackIosIcon onClick={handleBackImage} sx={{
                                                cursor: 'pointer', fontSize: 35, position: 'absolute', left: 7, top: '50%',
                                                zIndex: 1, display: (activeStepImage === 0) ? 'none' : 'block',
                                                color: '#ffffffed'
                                            }} />
                                            <ArrowForwardIosIcon onClick={handleNextImage} sx={{
                                                cursor: 'pointer', fontSize: 35, position: 'absolute', right: 0, top: '50%',
                                                zIndex: 1, display: (activeStepImage === maxSteps - 1) ? 'none' : 'block',
                                                color: '#ffffffed'

                                            }} />
                                            <img onLoad={onLoadFullPointImage} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} src={`https://storage.googleapis.com/hack-trip/${pointCard.imageFile[activeStepImage]}`} alt='Trip' style={{ position: 'relative', maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain' }} />
                                            <CloseIcon sx={{
                                                cursor: 'pointer', position: 'absolute', fontSize: 35,
                                                top: 5, marginLeft: '50%', transform: 'translate(-17px,0px)', color: '#ffffffed'

                                            }} onClick={onClickClose} />

                                        </Box>
                                    </>
                                    : ''}
                            </>
                            : ''
                }
            </Grid>
        </>
    )
}

export default AdminTripDetails;