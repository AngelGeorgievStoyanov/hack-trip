import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { Trip, TripCreate } from "../../model/trip";
import { ApiTrip } from "../../services/tripService";
import { IdType } from "../../shared/common-types";
import * as tripService from '../../services/tripService'
import * as pointService from '../../services/pointService'

import './TripDetails.css'
import { Point } from "../../model/point";
import { ApiPoint } from "../../services/pointService";
import { useEffect, useState } from "react";
import { GoogleMap, MarkerF, PolylineF, useJsApiLoader } from "@react-google-maps/api";
import React from "react";
import { containerStyle, options } from "../settings";
import * as commentService from '../../services/commentService'
import { Comment, CommentCreate } from "../../model/comment";
import { ApiComment } from "../../services/commentService";
import CommentCard from "../CommentCard/CommentCard";
import { Box, Button, Card, CardMedia, Container, Grid, styled, Typography } from "@mui/material";
import TripDetailsPointCard from "./TripDetailsPoint";




const googleKey = process.env.REACT_APP_GOOGLE_KEY

const libraries: ("drawing" | "geometry" | "localContext" | "places" | "visualization")[] = ["places"];

export default function TripDetails() {


    let zoom = 8;

    let center = {
        lat: 42.697866831005435,
        lng: 23.321590139866355
    }

    const trip = useLoaderData() as Trip;
    const userId = sessionStorage.getItem('userId') as string
    const navigate = useNavigate()

    const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data/trips');
    const API_COMMENT: ApiComment<IdType, CommentCreate> = new commentService.ApiCommentImpl<IdType, CommentCreate>('data/comments');
    const API_POINT: ApiPoint<IdType, Point> = new pointService.ApiPointImpl<IdType, Point>('data/points');


    const [points, setPoints] = useState<Point[]>([])
    const [point, setPoint] = useState<Point>()
    const [pointNumber, setPointNumber] = useState<number>()
    const [visibile, setVisibile] = useState(false)
    const [comments, setComments] = useState<Comment[]>([])
    const [liked, setLiked] = useState<boolean>(false)
    const [hide, setHide] = useState<boolean>(false)
    const [pointCard, setPointCard] = useState<Point>()


    // console.log(trip.lat !== undefined)
    if ((trip.lat !== undefined) && (trip.lng !== undefined)) {


        center = {
            lat: Number(trip.lat),
            lng: Number(trip.lng)


        }

    }
    useEffect(() => {


        API_POINT.findByTripId(trip._id).then((data) => {

            if (data) {

                if (typeof data === "object") {

                    const arrPoints = data as any as Point[]

                    setPoints(arrPoints)
                }
            }
        })

        API_COMMENT.findByTripId(trip._id).then(async (data) => {
            if (data) {

                if (typeof data === "object") {

                    const arrComments = data as any as Comment[]

                    setComments(arrComments)
                }
            }



        })







    }, [])




    const deleteClickHandler = () => {


        API_TRIP.deleteById(trip._id).then((data) => {
            API_POINT.deleteByTripId(trip._id).then((data) => {
                API_COMMENT.deleteByTripId(trip._id).then((data) => {

                }).catch((err) => {
                    console.log(err)
                })
            }).catch((err) => {
                console.log(err)
            })
            navigate('/trips')
        }).catch((err) => {
            console.log(err)
        })


    }


    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',

        googleMapsApiKey: googleKey!,
        libraries,
    })


    const mapRef = React.useRef<google.maps.Map | null>(null)

    const pathPoints = (points?.length) && (points !== undefined) ? points?.map((x) => { return { lat: Number(x.lat), lng: Number(x.lng) } }) : []
    const onLoad = (map: google.maps.Map): void => {
        mapRef.current = map


    }

    const onUnmount = (): void => {
        mapRef.current = null
    }
    if (!isLoaded) return <div>MAP LOADING ...</div>



    const onMarkerClick = (id: string, i: number) => {


        setVisibile(true)

        setPointNumber(i)


        const currentPoint = points!.filter((x) => x._id === id)

        if (currentPoint !== undefined && currentPoint !== null) {


            setPointCard(currentPoint[0])

          

        }



    }

    const onLoadComments = (newCommentArr: Comment[] | undefined) => {

        setHide(true)

    }

    const onHideComments = () => {

        setHide(false)
    }

    const onDeleteComment = async (comment: Comment) => {


        API_COMMENT.deleteById(comment._id).then((data) => {
            if (data !== undefined) {


                const copyComments = [...comments]
                const index = copyComments.findIndex(cmt => {
                    return cmt._id === comment._id;
                });

                copyComments.splice(index, 1)

                setComments(copyComments)

            }
        }).catch((err) => console.log(err))



    }
    const onEditComment = async (comment: Comment) => {
        navigate(`/comments/edit/${comment._id}`)


    }

    const onLikeTrip = () => {

        setLiked(true)
        if ((userId !== undefined) && (trip !== undefined) && (userId !== null)) {
            trip.likes.push(userId)
            console.log(trip)

            API_TRIP.updateLikes(trip._id, trip).then((data) => {
                console.log(data)

            }).catch((err) => {
                console.log(err)
            })

        }

    }

    const reportClickHandler = () => {
        console.log(trip)
        console.log(userId)
        if ((userId !== undefined) && (trip !== undefined) && (userId !== null)) {
            trip.reportTrip?.push(userId)


            API_TRIP.reportTrip(trip._id, trip).then((data) => {
                console.log(data)

            }).catch((err) => {
                console.log(err)
            })

        }
    }


    const goBack = () => {
        navigate(-1);
    }

    return (
        <>



            <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

                <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', bgcolor: '#cfe8fc' }}>

                    <Card sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: '',
                        maxWidth: '450px', margin: '20px',
                        padding: '25px', backgroundColor: '#8d868670',
                        boxShadow: '3px 2px 5px black', border: 'solid 2px', borderRadius: '12px'
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
                        <Typography gutterBottom variant="subtitle1" component="div">
                            DESCRIPTION : {trip?.description}
                        </Typography>

                        {trip._ownerId === userId ?
                            <Button component={Link} to={`/trip/points/${trip?._id}`} variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}>ADD OR EDIT POINTS FOR YOUR TRIP</Button>

                            :
                            (points !== undefined && points.length > 0) ?
                                <Button component={Link} to={`/trip/points/${trip?._id}`} variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}>FOR THIS TRIP HAVE {points.length} POINTS</Button>

                                :
                                <Typography gutterBottom variant="subtitle1" component="div">
                                    FOR THIS TRIP DONT HAVE POINTS
                                </Typography>
                        }

                        <Button component={Link} to={`/comments/add-comment/${trip?._id}`} variant="contained" sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}>ADD COMMENT</Button>
                        <Button component={Link} to={`/trip/edit/${trip?._id}`} variant="contained" sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}>EDIT TRIP</Button>
                        <Button variant="contained" onClick={deleteClickHandler} sx={{ ':hover': { background: '#ef0a0a' }, margin: '5px' }}>DELETE TRIP</Button>
                        <Button variant="contained" onClick={reportClickHandler} sx={{ ':hover': { background: '#ef0a0a' }, margin: '5px' }}>REPORT TRIP</Button>
                        <Button onClick={goBack} variant="contained" sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}  >BACK</Button>


                        {trip.likes.some((x) => x === userId) || (liked === true) ?

                            <Button disabled variant="contained" sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}  >YOU LIKED THIS TRIP</Button>
                            :

                            <Button onClick={onLikeTrip} variant="contained" sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}  >LIKE TRIP</Button>
                        }




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

                    <CardMedia
                        component="img"

                        height="500px"
                        width="800"
                        image={trip.imageUrl}
                        alt="TRIP"

                    />




                </Container>
                <Container maxWidth={false} sx={{ display: hide ? 'flex' : 'none', flexWrap: 'wrap' }} >


                    {comments.length > 0 ? comments.map((x) => <CommentCard key={x._id} comment={x} onDeleteCom={onDeleteComment} onEditCom={onEditComment} />) : ''}
                </Container>
                <Container maxWidth={false} sx={{ display: 'flex', flexDirection:'row',justifyContent:'space-between' ,padding:'50px 50px'}} >


                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        options={options as google.maps.MapOptions}
                        center={(pathPoints?.length > 0) && (pathPoints !== undefined) ? pathPoints[0] : center}
                        zoom={zoom}
                        onLoad={onLoad}
                        onUnmount={onUnmount}



                    >
                        {pathPoints ? <PolylineF path={pathPoints} /> : null}
                        {/* {points ? points.map((x, i) => { return <MarkerF key={x._id} title={x.name} position={{ lat: Number(x.lat), lng: Number(x.lng) }} label={i + 1 + ''} animation={google.maps.Animation.DROP} onClick={() => onMarkerClick(x._id + '', i + 1)} /> }) : null} */}
                        {points?.length > 0 ? points.map((x, i) => { return <MarkerF key={x._id} title={x.name} position={{ lat: Number(x.lat), lng: Number(x.lng) }} label={i + 1 + ''} animation={google.maps.Animation.DROP} onClick={() => onMarkerClick(x._id + '', i + 1)} /> }) : <MarkerF position={{ lat: Number(trip.lat), lng: Number(trip.lng) }} />}
                    </GoogleMap>




                    <Box component='section' id="point-section-add">
                        {
                            pointCard ?<TripDetailsPointCard point={pointCard} key={pointCard._id} /> : ''

                        }

                    </Box>
                </Container>
            </Grid>
        </>
    )
}