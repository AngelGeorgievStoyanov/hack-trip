import { Link, useNavigate, useParams } from "react-router-dom";
import { CurrencyCodeName, Trip, TripCreate } from "../../model/trip";
import { ApiTrip } from "../../services/tripService";
import { IdType, TripGroupId, getRandomTripAndImage, sliceDescription } from "../../shared/common-types";
import * as tripService from '../../services/tripService';
import * as pointService from '../../services/pointService';
import { Point } from "../../model/point";
import { ApiPoint } from "../../services/pointService";
import { BaseSyntheticEvent, FC, useContext, useEffect, useState, TouchEvent, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import React from "react";
import * as commentService from '../../services/commentService';
import { Comment, CommentCreate } from "../../model/comment";
import { ApiComment } from "../../services/commentService";
import CommentCard from "../CommentCard/CommentCard";
import { AppBar, Backdrop, Box, Button, CardActions, CardContent, CircularProgress, Collapse, Container, Grid, ImageList, ImageListItem, MobileStepper, Pagination, PaginationItem, PaginationRenderItemParams, Typography, useMediaQuery } from "@mui/material";
import TripDetailsPointCard from "./TripDetailsPoint";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { styled, useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import ReportOffIcon from '@mui/icons-material/ReportOff';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import BookmarkRemoveOutlinedIcon from '@mui/icons-material/BookmarkRemoveOutlined';
import jwt_decode from "jwt-decode";
import { LoginContext } from "../../hooks/LoginContext";
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import HelmetWrapper from "../Helmet/HelmetWrapper";
import { FacebookIcon, FacebookShareButton, ViberIcon, ViberShareButton } from "react-share";
import GoogleMapWrapper from "../GoogleMapWrapper/GoogleMapWrapper";
import InfoIcon from '@mui/icons-material/Info';
import { keyframes } from '@emotion/react';
import { useConfirm } from "../ConfirmDialog/ConfirmDialog";


let zoom = 12;




const googleKey = process.env.REACT_APP_GOOGLE_KEY;

const libraries: Array<"drawing" | "places" | "geometry"> = ["places"]
type decode = {
    _id: string,
}

const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data');
const API_COMMENT: ApiComment<IdType, CommentCreate> = new commentService.ApiCommentImpl<IdType, CommentCreate>('data/comments');
const API_POINT: ApiPoint<IdType, Point> = new pointService.ApiPointImpl<IdType, Point>('data/points');
let userId: string;


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

const shakeAnimation = keyframes`
0% {
    transform: scale(1) translateY(0px) rotate(0deg);
}
10% {
    transform: scale(1) translateY(-1px) rotate(10deg);
}
20% {
    transform: scale(1) translateY(-3px) rotate(-10deg);
}
30% {
    transform: scale(1) translateY(-5px) rotate(10deg);
}
40% {
    transform: scale(1) translateY(-10px) rotate(-10deg);
}
50% {
    transform: scale(1) translateY(-10px) rotate(10deg);
}
60% {
    transform: scale(1) translateY(-10px) rotate(-10deg);
}
70% {
    transform: scale(1) translateY(-5px) rotate(10deg);
}
80% {
    transform: scale(1) translateY(-3px) rotate(-10deg);
}
90% {
    transform: scale(1) translateY(-1px) rotate(10deg);
}
100% {
    transform: scale(1) translateY(0px) rotate(0deg);
}
`;


const growShrinkAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(2) translateY(-10px); }
  100% { transform: scale(1); }
`;


const rotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
  100% { transform: rotate(0deg); }
`;

const rotateXAnimation = keyframes`
  0% { transform: rotateX(0deg); }
  50% { transform: rotateX(180deg); }
  100% { transform: rotateX(0deg); }
`;

const TripDetails: FC = () => {

    let center = {
        lat: 42.697866831005435,
        lng: 23.321590139866355
    }

    const [activeStep, setActiveStep] = React.useState(0);
    const [points, setPoints] = useState<Point[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [liked, setLiked] = useState<boolean>();
    const [hide, setHide] = useState<boolean>(false);
    const [pointCard, setPointCard] = useState<Point | null>();
    const [mapCenter, setMapCenter] = useState(center);
    const [reported, setReported] = useState<boolean>();
    const [reportedComment, setReportedComment] = useState<boolean>(false);
    const [favorite, setFavorite] = useState<boolean>();
    const [trip, setTrip] = useState<Trip>()
    const [expanded, setExpanded] = useState(false);
    const [imageBackground, setImageBackground] = useState<string>()
    const [fullImage, setFullImage] = useState<boolean>(false)
    const [fullPointImage, setPointFullImage] = useState<boolean>(false)
    const [activeStepImage, setActiveStepImage] = useState(0);
    const [touchStart, setTouchStart] = useState<number>(0)
    const [touchEnd, setTouchEnd] = useState<number>(0)
    const [maxSteps, setMaxSteps] = useState<number>(0)
    const [open, setOpen] = useState(false);
    const [loadPointFullImage, setLoadFullImage] = useState<boolean>(false)
    const [loadTripFullImage, setLoadTripFullImage] = useState<boolean>(false)
    const [randomImage, setRandomImage] = useState<string>()
    const [openCurrency, setOpenCurrency] = useState(false);
    const [clickedLike, setClickedLike] = useState<boolean>(false);
    const [clickedUnLike, setClickedUnLike] = useState<boolean>(false);
    const [tripGroupTrips, setTripGroupTrips] = useState<TripGroupId[]>([]);
    const [pageValue, setPageValue] = useState<number>(trip?.dayNumber || 1)

    const { confirm } = useConfirm();

    const minSwipeDistance = 45;
    const { token } = useContext(LoginContext);

    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id;
    }
    const randomAnimationLike = Math.random() > 0.5 ? shakeAnimation : growShrinkAnimation;

    const randomAnimationUnLike = Math.random() > 0.5 ? rotateAnimation : rotateXAnimation;

    const theme = useTheme();

    const idTrip = useParams().tripId;

    const navigate = useNavigate();

    const isIphone = /\b(iPhone)\b/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent);

    const scrollMedia = useMediaQuery('(max-width:900px)');

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const mobileStepperRef = useRef<HTMLDivElement | null>(null)
    const refPoint = useRef<HTMLDivElement | null>(null)

    useEffect(() => {


        if (idTrip !== undefined && accessToken) {

            API_TRIP.findById(idTrip, userId, accessToken).then((data) => {

                if (data) {
                    setTrip(data)
                    setPageValue(data.dayNumber)
                    setRandomImage(getRandomTripAndImage(Array(data)))
                    API_POINT.findByTripId(data._id, accessToken).then((data) => {

                        if (data && Array.isArray(data)) {
                            const arrPoints = data as Point[];
                            if (arrPoints !== undefined && arrPoints.length > 0) {

                                arrPoints.sort((a, b) => Number(a.pointNumber) - Number(b.pointNumber))

                                center.lat = Number(arrPoints[0].lat);
                                center.lng = Number(arrPoints[0].lng);


                                setPoints(arrPoints);
                            }

                            setMapCenter(center);
                        }
                    }).catch((err) => {
                        console.log(err);
                    });

                    API_COMMENT.findByTripId(data._id, userId, accessToken).then(async (data) => {
                        if (data && Array.isArray(data)) {
                            setComments(data);
                        }


                    }).catch((err) => {
                        console.log(err);
                    });

                }


            }).catch((err) => {
                console.log(err)
                navigate('/not-found')

            })

            API_TRIP.backgroundImages().then((data) => {
                setImageBackground(data[Math.floor(Math.random() * data.length)])

            }).catch((err) => {
                console.log(err)
            });

        }



    }, []);

    useEffect(() => {
        setTimeout(() => {
            if ((refPoint && refPoint.current !== null) && scrollMedia && (mobileStepperRef && mobileStepperRef.current !== null)) {
                mobileStepperRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        }, 500)
    }, [pointCard, fullPointImage])


    useEffect(() => {
        if (trip) {
            fetchTripsByGroupId(trip.tripGroupId);
        }
    }, [trip]);

    const fetchTripsByGroupId = async (tripGroupId: string) => {
        if (accessToken) {

            API_TRIP.findByTripGroupId(tripGroupId, accessToken).then((data) => {

                setTripGroupTrips(data);
            }).catch((err) => {
                console.log(err)
            })
        }

    };

    const days = tripGroupTrips.map(trip => trip.dayNumber);
    const maxDay = Math.max(...days);
    const paginationItems = Array.from({ length: maxDay }, (_, i) => i + 1).map(day => ({
        day,
        available: days.includes(day)
    }));


    const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
        const tripIndex = tripGroupTrips.findIndex(trip => trip.dayNumber === value);
        if (tripIndex !== -1) {
            setPageValue(value);

            if (userId && accessToken) {

                API_TRIP.findById(tripGroupTrips[tripIndex]._id, userId, accessToken).then((data) => {
                    setTrip(data);
                    setActiveStep(0);
                    API_POINT.findByTripId(data._id, accessToken).then((data) => {
                        if (data && Array.isArray(data)) {
                            const arrPoints = data as Point[];
                            if (arrPoints !== undefined && arrPoints.length > 0) {

                                arrPoints.sort((a, b) => Number(a.pointNumber) - Number(b.pointNumber))


                                center.lat = Number(arrPoints[0].lat);
                                center.lng = Number(arrPoints[0].lng);

                                setPoints(arrPoints);
                                setMapCenter(center);
                            } else {
                                setPoints([]);
                                setPointCard(null)
                                setMapCenter({
                                    lat: 42.697866831005435,
                                    lng: 23.321590139866355
                                });
                            }

                        }
                    }).catch((err) => {
                        console.log(err);
                    });

                    API_COMMENT.findByTripId(data._id, userId, accessToken).then(async (data) => {
                        if (data && Array.isArray(data)) {
                            setComments(data);
                        }


                    }).catch((err) => {
                        console.log(err);
                    });

                })
            }
        } else {
            setPageValue(value);
            setTrip(undefined);
        }
    };

    if (trip !== undefined) {

        if ((trip.lat !== undefined && trip.lat !== null) && (trip.lng !== undefined && trip.lng !== null) && (Array.from(points).length === 0)) {

            center = {
                lat: Number(trip.lat),
                lng: Number(trip.lng)
            }


        }

    }


    const deleteClickHandler = async () => {

        if (trip === undefined || !accessToken) return;
        const result = await confirm('Are you sure you want to delete this trip?', 'Delete Confirmation');
        if (result) {
            const tripId = trip._id
            API_TRIP.deleteById(tripId, userId, accessToken).then((data) => {
                API_POINT.deleteByTripId(tripId, userId, accessToken).then((data) => {
                    API_COMMENT.deleteByTripId(tripId, userId, accessToken).then((data) => {

                    }).catch((err) => {
                        console.log(err);
                    });
                }).catch((err) => {
                    console.log(err);
                });
                navigate('/trips')
            }).catch((err) => {
                console.log(err);
            });
        }
    }


    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',

        googleMapsApiKey: googleKey!,
        libraries,
    });




    const mapRef = React.useRef<google.maps.Map | null>(null);


    const pathPoints = (points?.length) && (points !== undefined) ? points?.sort((a, b) => Number(a.pointNumber) - Number(b.pointNumber)).map((x) => { return { lat: Number(x.lat), lng: Number(x.lng) } }) : [];


    const onLoad = (map: google.maps.Map): void => {
        mapRef.current = map;
        if (points.length === 0 && trip && trip.lat !== undefined && trip.lng !== undefined && trip.lat !== null && trip.lng !== null) {
            mapRef.current.setCenter({ lat: Number(trip.lat), lng: Number(trip.lng) });
        } else if (points.length > 0 && activeStep === 0) {
            const bounds = new google.maps.LatLngBounds();
            points?.forEach(({ lat, lng }) => bounds.extend({ lat: Number(lat), lng: Number(lng) }));
            map.fitBounds(bounds);
        } else if (activeStep > 0) {
            mapRef.current?.set('zoom', 14);
        } else if (trip && (trip.lat === undefined || trip.lng === undefined || trip.lat === null || trip.lng === null)) {
            mapRef.current.setCenter({ lat: Number(center.lat), lng: Number(center.lng) });
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


    const onMarkerClick = (id: string, positionNumber: number) => {

        if (id) {
            const currentPoint = points!.filter((x) => x._id + '' === id);

            if (currentPoint !== undefined && currentPoint !== null) {

                setPointCard(currentPoint[0]);

                setActiveStep((prevActiveStep) => Number(currentPoint[0].pointNumber));

                center = {
                    lat: Number(currentPoint[0].lat),
                    lng: Number(currentPoint[0].lng)
                }

                mapRef.current?.panTo(center);

                mapRef.current?.set('zoom', 14);

                setMapCenter(center);
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

                setMapCenter(center);
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

        if (accessToken) {
            const result = await confirm('Are you sure you want to delete this comment?', 'Delete Confirmation');
            if (result) {
                API_COMMENT.deleteById(comment._id, accessToken).then((data) => {
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

        }


    }


    const onEditComment = async (comment: Comment) => {
        navigate(`/comments/edit/${comment._id}`);

    }

    const onLikeTrip = () => {

        if ((userId !== undefined) && (trip !== undefined) && (userId !== null) && accessToken) {
            setClickedLike(true);
            setTimeout(() => setClickedLike(false), 500);
            if (clickedUnLike) {
                setClickedUnLike(false);
            }
            API_TRIP.updateLikes(trip._id, userId, accessToken).then((data) => {
                setTrip(data)

                setLiked(prev => true);

            }).catch((err) => {
                console.log(err);
            });

        }

    }


    const onFavoriteClickHandler = () => {

        if ((userId !== undefined) && (trip !== undefined) && (userId !== null) && accessToken) {

            trip?.favorites.push(userId);


            API_TRIP.updateFavorites(trip._id, trip, accessToken).then((data) => {

                setFavorite(true);
            }).catch((err) => {
                console.log(err);
            });

        }

    }


    const onRemoveFavoriteClickHandler = () => {

        if ((userId !== undefined) && (trip !== undefined) && (userId !== null) && accessToken) {

            const index = trip.favorites.indexOf(userId);

            trip.favorites.splice(index, 1);

            API_TRIP.updateFavorites(trip._id, trip, accessToken).then((data) => {
                setFavorite(false);
            }).catch((err) => {
                console.log(err);
            });

        }

    }

    const onUnLikeTrip = () => {

        if ((userId !== undefined) && (trip !== undefined) && (userId !== null) && accessToken) {
            setClickedUnLike(true);
            setTimeout(() => setClickedUnLike(false), 1000);
            if (clickedLike) {
                setClickedLike(false);
            }

            API_TRIP.updateLikes(trip._id, userId, accessToken).then((data) => {

                setTrip(data)

                setLiked(prev => false);
            }).catch((err) => {
                console.log(err);
            });

        }

    }

    const reportClickHandler = () => {


        if ((userId !== undefined) && (trip !== undefined) && (userId !== null) && accessToken) {
            trip.reportTrip?.push(userId);


            API_TRIP.reportTrip(trip._id, trip, accessToken).then((data) => {


                setReported(true);

            }).catch((err) => {
                console.log(err);
            });

        }
    }

    const unReportClickHandler = () => {


        if ((userId !== undefined) && (trip !== undefined) && (userId !== null) && accessToken) {

            if (trip.reportTrip !== undefined) {

                const index = trip.reportTrip.indexOf(userId);

                trip.reportTrip.splice(index, 1);


                API_TRIP.reportTrip(trip._id, trip, accessToken).then((data) => {


                    setReported(false);

                }).catch((err) => {
                    console.log(err);
                });

            }
        }
    }


    const goBack = () => {
        navigate(-1);
    }


    const handleNext = () => {

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        let position = activeStep + 1;
        onMarkerClick('', position);

    }

    const handleBack = () => {

        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        let position = activeStep - 1;
        onMarkerClick('', position);

    };



    const MuiTooltipUnlike = () => {
        return (
            <Tooltip title='UN LIKE' arrow>

                <ThumbUpIcon color="primary" onClick={onUnLikeTrip} fontSize="large" sx={{
                    ':hover': { cursor: 'pointer' }, margin: '5px', animation: `${randomAnimationLike} 0.5s ease`,
                    animationPlayState: clickedLike ? 'running' : 'paused',
                }} />
            </Tooltip>
        )
    }



    const MuiTooltipLike = () => {
        return (
            <Tooltip title='LIKE' arrow>
                < ThumbUpOffAltIcon color="primary" onClick={onLikeTrip} fontSize="large" sx={{
                    ':hover': { cursor: 'pointer' }, margin: '5px', animation: `${randomAnimationUnLike} 1s ease`,
                    animationPlayState: clickedUnLike ? 'running' : 'paused',
                }} />

            </Tooltip>
        )
    }

    const MuiTooltiReport = () => {
        return (
            <Tooltip title='REPORT TRIP' arrow>
                <ReportGmailerrorredIcon color="primary" onClick={reportClickHandler} fontSize="large" sx={{ ':hover': { cursor: 'pointer', color: 'red' }, margin: '5px' }} />

            </Tooltip>
        )
    }

    const MuiTooltiUnReport = () => {
        return (
            <Tooltip title='UN REPORT TRIP' arrow>
                <ReportOffIcon color="primary" onClick={unReportClickHandler} fontSize="large" sx={{ ':hover': { cursor: 'pointer', color: 'red' }, margin: '5px' }} />

            </Tooltip>
        )
    }

    const MuiToolBookmark = () => {
        return (
            <Tooltip title='ADD TO FAVORITE' arrow>
                <BookmarkAddOutlinedIcon color="primary" onClick={onFavoriteClickHandler} fontSize="large" sx={{ ':hover': { cursor: 'pointer' }, margin: '5px' }} />

            </Tooltip>
        )
    }

    const MuiToolBookmarkRemove = () => {
        return (
            <Tooltip title='REMOVE FROM FAVORITE' arrow>
                <BookmarkRemoveOutlinedIcon color="primary" onClick={onRemoveFavoriteClickHandler} fontSize="large" sx={{ ':hover': { cursor: 'pointer', color: 'red' }, margin: '5px' }} />

            </Tooltip>
        )
    }
    const handleClick = () => {
        if (scrollMedia) {
            setOpenCurrency((prev) => !prev);
        }
    };

    const handleTooltipClose = () => {
        setOpenCurrency(false);
    };

    const MuiTooltipCurrency = () => {
        return (
            <Tooltip title={currencyName} arrow
                open={scrollMedia ? openCurrency : undefined}
                onClose={handleTooltipClose}
                disableHoverListener={scrollMedia}
                disableFocusListener={scrollMedia}>
                <InfoIcon color="primary" fontSize="small" sx={{ marginLeft: '5px' }} onClick={handleClick} />
            </Tooltip>
        )
    }

    const reportClickHandlerComment = (comment: Comment) => {

        if ((userId !== undefined) && (comment !== undefined) && (userId !== null) && accessToken) {
            comment.reportComment?.push(userId);

            API_COMMENT.reportComment(comment._id, comment, accessToken).then((data) => {

                setReportedComment(true);

                setComments(data)

            }).catch((err) => {
                console.log(err);
            });

        }
    }


    const unReportClickHandlerComment = (comment: Comment) => {

        if ((userId !== undefined) && (comment !== undefined) && (userId !== null) && accessToken) {

            if (comment.reportComment !== undefined) {

                const index = comment.reportComment.indexOf(userId);

                comment.reportComment.splice(index, 1);

                API_COMMENT.reportComment(comment._id, comment, accessToken).then((data) => {

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
        handleOpen()
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
        setOpen(false);
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
        handleOpen()
    }


    const handleOpen = () => {
        setOpen(true);
    };

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


    const currencyName = CurrencyCodeName[trip?.currency as keyof typeof CurrencyCodeName];

    return (
        <>

            <HelmetWrapper
                title={trip ? trip.title : 'Hack Trip'}
                description={trip ? trip.description : 'Hack Trip'}
                url={trip ? `https://www.hack-trip.com/trip/details/${trip._id}` : `https://www.hack-trip.com`}
                image={randomImage ? randomImage : ''}
                hashtag={'#HackTrip'}
                keywords={'Hack Trip, Travel, Adventure'}
                canonical={trip ? `https://www.hack-trip.com/trip/details/${trip._id}` : `https://www.hack-trip.com`}
            />
            {tripGroupTrips.length > 1 && (
                <AppBar position="sticky"
                    sx={{ marginTop: '-20px', paddingBottom: '10px', marginBottom: '20px' }}
                >
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Pagination
                            count={paginationItems.length}
                            variant="outlined"
                            shape="rounded"
                            page={pageValue}
                            boundaryCount={paginationItems.length}
                            siblingCount={paginationItems.length}
                            onChange={handlePageChange}
                            renderItem={(item: PaginationRenderItemParams) => (
                                <PaginationItem
                                    {...item}
                                    sx={{
                                        margin: '3px',
                                        color: 'white',
                                        '&.Mui-selected': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            color: 'white',
                                        },
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                />
                            )}
                            sx={{ marginTop: '10px' }}
                        />
                    </Box>
                </AppBar>
            )}
            <Grid container sx={!isIphone ?
                {
                    boxSizing: 'border-box',
                    backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",
                    backgroundAttachment: 'fixed', justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px',
                    minHeight: '100vh', alignItems: 'center',
                    '@media(max-width: 900px)': { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100vw', padding: '0', paddingBottom: '15px', margin: '-25px 0px 0px 0px' }
                } :
                {
                    backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",
                    justifyContent: 'center',
                    bgcolor: '#cfe8fc', height: '100vh', overflow: 'scroll',
                    '@media(max-width: 900px)': { display: 'flex', alignItems: 'center', width: '100vw', padding: '0', paddingBottom: '15px', margin: '-25px 0px 0px 0px' }

                }
            } spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

                {!fullImage && !fullPointImage && trip ?
                    <>
                        <Container maxWidth={false} sx={{
                            boxSizing: 'border-box',
                            display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', '@media(max-width: 900px)': {
                                display: 'flex', flexDirection: 'column-reverse'
                            }
                        }}>

                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                minWidth: '320px',
                                maxWidth: '450px', margin: '20px',
                                padding: '25px', backgroundColor: '#eee7e79e',
                                boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px'
                            }}>
                                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <>
                                        <Typography gutterBottom variant="h5" component="div">
                                            TRIP NAME : {trip?.title}
                                        </Typography>
                                        {((trip && trip.favorites?.some((x) => x === userId)) || (favorite === true)) ?
                                            <MuiToolBookmarkRemove />
                                            : <MuiToolBookmark />
                                        }
                                    </>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                    <Typography gutterBottom variant="subtitle1" component="h5">
                                        PRICE OF THE TRIP: {trip?.price ? `${trip.price} ${trip.currency || 'missing currency'}` : 'missing price'}
                                    </Typography>
                                    <MuiTooltipCurrency />
                                </Box>
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
                                {(trip && trip._ownerId === userId) ?
                                    <>
                                        <Button component={Link} to={`/create-trip/${trip?.tripGroupId}`} variant="contained" sx={{ ':hover': { background: '#4daf30' } }} >ADD NEXT DAY TRIP</Button>
                                        <Button component={Link} to={`/trip/points/${trip?._id}`} variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}>ADD OR EDIT POINTS FOR YOUR TRIP</Button>
                                    </>

                                    :
                                    (points !== undefined && points.length > 0) ?
                                        <Typography gutterBottom variant="subtitle1" component="div">
                                            FOR THIS TRIP HAVE {points.length} POINTS
                                        </Typography>
                                        :
                                        <Typography gutterBottom variant="subtitle1" component="div">
                                            FOR THIS TRIP DONT HAVE POINTS
                                        </Typography>
                                }

                                <Button component={Link} to={`/comments/add-comment/${trip?._id}`} variant="contained" sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}>ADD COMMENT</Button>

                                {(trip && trip._ownerId === userId) ?
                                    <>
                                        <Button component={Link} to={`/trip/edit/${trip?._id}`} variant="contained" sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}>EDIT TRIP</Button>
                                        <Button variant="contained" onClick={deleteClickHandler} sx={{ ':hover': { background: '#ef0a0a' }, margin: '5px' }}>DELETE TRIP</Button>
                                    </>

                                    : ''}

                                <Button onClick={goBack} variant="contained" sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}  >BACK</Button>
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

                                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>

                                    {((trip && trip.reportTrip?.some((x) => x === userId)) || (reported === true)) ?
                                        <MuiTooltiUnReport />
                                        :
                                        <MuiTooltiReport />
                                    }

                                    {trip && trip._ownerId !== userId ?
                                        <>
                                            {
                                                trip.likes.includes(userId) || liked === true ?
                                                    <MuiTooltipUnlike />
                                                    :
                                                    <MuiTooltipLike />
                                            }
                                        </>
                                        : ''}
                                </Box>
                            </Box>

                            {(trip && trip.imageFile?.length && trip.imageFile?.length > 0) ?
                                <>
                                    <ImageList sx={{ maxWidth: 520, height: 'auto', '@media(max-width: 600px)': { width: 'auto', height: 'auto' } }} cols={trip.imageFile.length >= 3 ? 3 : trip.imageFile.length} rowHeight={trip.imageFile.length > 9 ? 164 : 'auto'}>
                                        {trip && trip.imageFile ? trip.imageFile.map((item, i) => (
                                            <ImageListItem key={i}>
                                                <img
                                                    src={`https://storage.googleapis.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format`}
                                                    srcSet={`https://storage.googleapis.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                                    alt={item}
                                                    loading="lazy"
                                                    onClick={onClickImage}
                                                    style={{ cursor: 'pointer' }}
                                                    height={'auto'}
                                                    width={'auto'}
                                                />
                                            </ImageListItem>
                                        )) : ''}
                                    </ImageList>
                                </>
                                :
                                <h4>FOR THIS TRIP DON'T HAVE IMAGES</h4>
                            }
                        </Container>
                        <Container maxWidth={false} sx={{ display: hide ? 'flex' : 'none', flexWrap: 'wrap' }} >
                            {comments.length > 0 ? comments.map((x) => <CommentCard key={x._id} comment={x} onDeleteCom={onDeleteComment} onEditCom={onEditComment} onUnReportClickHandlerComment={unReportClickHandlerComment} onReportClickHandlerComment={reportClickHandlerComment} reportedComment={reportedComment} userId={userId} />) : ''}
                        </Container>
                        <Container maxWidth={false} sx={{
                            display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '50px 50px', '@media(max-width: 900px)': {
                                display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0px'
                            }
                        }} >
                            <Box component='div' sx={{ boxSizing: "content-box", height: 'fit-content', border: 'solid 1px', boxShadow: '3px 2px 5px black', '@media(max-width: 600px)': { display: 'flex', flexDirection: 'column', width: '94vW' } }}>
                                {points?.length > 0 ?
                                    <MobileStepper ref={mobileStepperRef}
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
                                    center={mapCenter.lat !== undefined && mapCenter.lng !== undefined ? mapCenter : center}
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
                                <Backdrop
                                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                                    open={open}
                                >
                                    {!loadTripFullImage ? <CircularProgress sx={{ position: 'absolute', margin: '0 auto' }} /> : ''}
                                    <Box sx={{ position: 'relative', display: loadTripFullImage ? 'flex' : 'none' }}>
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
                                </Backdrop>
                                : ''}
                        </>
                        :
                        fullPointImage ?
                            <>
                                {pointCard && (pointCard.imageFile?.length) && (pointCard.imageFile.length > 0) ?
                                    <Backdrop
                                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                                        open={open}
                                    >
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
                                    </Backdrop>

                                    : ''}

                            </>

                            : !trip ?
                                <>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minWidth: '340px',
                                        maxWidth: '450px', margin: '20px',
                                        padding: '25px', backgroundColor: '#eee7e79e',
                                        boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px',
                                        minHeight: '440px', justifyContent: 'center'
                                    }}>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 'auto', justifyContent: 'space-evenly' }}>

                                            <Typography gutterBottom variant="h5" sx={{ padding: '0px 15px' }}>
                                                No trip on {pageValue} day
                                            </Typography>
                                        </Box>
                                        <CardContent>

                                        </CardContent>
                                    </Box>
                                </>
                                : ''

                }
                {!fullImage && !fullPointImage && trip ?
                    <>
                        <Box sx={{ display: 'flex', margin: '10px' }}>
                            <h3 style={{ fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)', marginRight: '10px' }}>Share to Facebook</h3>
                            <FacebookShareButton
                                url={randomImage ? `https://storage.googleapis.com/hack-trip/${randomImage}` : 'https://storage.googleapis.com/hack-trip/hack-trip-home-page.png'}
                                quote={`Hack Trip - ${trip?.title} - ${trip ? `https://www.hack-trip.com/trip/details/${trip._id}` : 'https://www.hack-trip.com'}`}
                                hashtag='#HackTrip'
                            >
                                <FacebookIcon size={38} round />
                            </FacebookShareButton>
                        </Box>
                        <Box sx={{ display: 'flex', margin: '10px' }}>
                            <h3 style={{ fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)', marginRight: '10px' }}>Share to Viber</h3>
                            <ViberShareButton
                                title={`Hack Trip - ${trip?.title}`}
                                separator={' - '}
                                url={trip ? `https://www.hack-trip.com/trip/details/${trip._id}` : 'https://www.hack-trip.com'}
                            >
                                <ViberIcon size={38} round />
                            </ViberShareButton>
                        </Box>
                    </> : ''}
            </Grid >
        </>
    )
}

export default TripDetails;