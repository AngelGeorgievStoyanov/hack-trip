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


let zoom = 8;

let center = {
    lat: 42.697866831005435,
    lng: 23.321590139866355
}

const googleKey = process.env.REACT_APP_GOOGLE_KEY

const libraries: ("drawing" | "geometry" | "localContext" | "places" | "visualization")[] = ["places"];

export default function TripDetails() {

    const userId = localStorage.getItem('userId') as string
    const navigate = useNavigate()

    const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data/trips');
    const API_COMMENT: ApiComment<IdType, CommentCreate> = new commentService.ApiCommentImpl<IdType, CommentCreate>('data/comments');


    const API_POINT: ApiPoint<IdType, Point> = new pointService.ApiPointImpl<IdType, Point>('data/points');
    const [points, setPoints] = useState<Point[]>()
    const [point, setPoint] = useState<Point>()
    const [pointNumber, setPointNumber] = useState<number>()
    const [visibile, setVisibile] = useState(false)
    const trip = useLoaderData() as Trip;
    const [comments, setComments] = useState<Comment[]>([])
    const [liked, setLiked] = useState<boolean>()

    
    useEffect(() => {

        trip.likes.find((x) => x === userId) ? setLiked(true) : setLiked(false)



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

    const pathPoints = points?.map((x) => { return { lat: Number(x.lat), lng: Number(x.lng) } })
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

            const sec = document.getElementById('point-section-add') as HTMLElement
            setPoint(currentPoint[0])

            if (sec.childNodes.length > 0) {
                const children = Array.from(sec.childNodes)

                children.map((x) => x.remove())

            }


            const article = document.createElement('article')
            article.className = 'article-point-card'
            const h1 = document.createElement('h1')
            h1.innerText = 'Point name ' + currentPoint[0].name
            const p = document.createElement('p')
            p.innerText = 'Descrioption ' + currentPoint[0].description
            let image
            if (currentPoint[0].imageUrl) {
                image = document.createElement('img')
                image.className = 'article-point-image'
                image.setAttribute('src', currentPoint[0].imageUrl)
            }

            article.append(h1)
            article.append(p)
            if (image !== undefined) {
                article.append(image)
            }

            sec.append(article)

        }





    }

    const onLoadComments = (newCommentArr: Comment[] | undefined) => {


        const btnHide = document.getElementsByClassName('btn-hide')[0] as HTMLElement
        btnHide.style.display = 'block'
        const section = document.getElementsByClassName('section-trip-comments')[0] as HTMLElement
        section.style.display = 'flex'




    }

    const onHideComments = () => {
        const section = document.getElementsByClassName('section-trip-comments')[0] as HTMLElement
        section.style.display = 'none'
        const btnHide = document.getElementsByClassName('btn-hide')[0] as HTMLElement
        btnHide.style.display = 'none'
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
        console.log(comment, '---coment--')
        navigate(`/comments/edit/${comment._id}`)



    }

    const onLikeTrip = () => {
        console.log(trip)
        console.log(userId)
        if ((userId !== undefined) && (trip !== undefined) && (userId !== null)) {
            trip.likes.push(userId)
            console.log(trip)

            API_TRIP.update(trip._id, trip).then((data) => {
                console.log(data)
                setLiked(true)
            }).catch((err) => {
                console.log(err)
            })

        }

    }

    return (
        <>
            <section className="section-details">

                <article className="article-details">

                    <h2 className="info">Trip name : {trip?.title}</h2>
                    <h4 className="info">Price of the Trip: {trip?.price} euro </h4>
                    <h4 className="info">Transport with: {trip?.transport}</h4>
                    <h4 className="info">Coun of people: {trip?.countPeoples}</h4>
                    <h4 className="info">Type of the group: {trip?.typeOfPeople}</h4>
                    <h4 className="info">Destination: {trip?.destination}</h4>
                    <p>Description : {trip?.description}</p>

                    <button type="button">
                        <Link to={`/trip/points/${trip?._id}`} className="Btn">ADD POINTS FOR YOUR TRIP</Link>
                    </button>


                    <button className="btn">
                        <Link to={`/comments/add-comment/${trip?._id}`} className="btn">ADD COMMENT</Link>
                    </button>
                    <button className="btn"><Link to={`/trip/edit/${trip?._id}`} className="btn">EDIT TRIP</Link></button>
                    <button className="btn" onClick={deleteClickHandler}>DELETE TRIP</button>
                    <button className="btn"><Link to={'/trips'}>BACK</Link></button>
                    {liked === true ? <button disabled>YOU LIKED THIS TRIP</button> : <button onClick={onLikeTrip}>LIKE TRIP</button>}

                    {comments?.length ? <button onClick={() => onLoadComments(undefined)} className="btn">FOR THIS TRIP HAVE {comments?.length} COMMENTS, SEE ALL COMMENTS</button> : <h4>FOR THIS TRIP DON'T HAVE COMMENT</h4>}
                    {comments.length > 0 ? <button onClick={onHideComments} className="btn-hide" style={{ display: 'none' }} >HIDE COMMENTS</button> : ''}

                </article>

                <article>
                    <img className="section-details-img" src={trip?.imageUrl} alt="Trip" />

                </article>


            </section>
            <section style={{ display: 'none' }} className="section-trip-comments">
                {comments.length > 0 ? comments.map((x) => <CommentCard key={x._id} comment={x} onDeleteCom={onDeleteComment} onEditCom={onEditComment} />) : ''}
            </section>
            <section>


                <GoogleMap
                    mapContainerStyle={containerStyle}
                    options={options as google.maps.MapOptions}
                    center={pathPoints ? pathPoints[0] : center}
                    zoom={zoom}
                    onLoad={onLoad}
                    onUnmount={onUnmount}



                >
                    {pathPoints ? <PolylineF path={pathPoints} /> : null}
                    {points ? points.map((x, i) => { return <MarkerF key={x._id} title={x.name} position={{ lat: Number(x.lat), lng: Number(x.lng) }} label={i + 1 + ''} animation={google.maps.Animation.DROP} onClick={() => onMarkerClick(x._id + '', i + 1)} /> }) : null}
                </GoogleMap>

            </section>
            <section id="point-section-add"></section>
        </>
    )
}