import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import React from "react";
import { Point } from "../../../../model/point";
import { ApiPoint } from "../../../../services/pointService";
import { IdType } from "../../../../shared/common-types";
import { containerStylePoint, optionsPoint } from "../../../settings";
import * as pointService from '../../../../services/pointService'
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, Typography } from "@mui/material";
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';


interface PointCardProps {
    point: Point;
    id: IdType;
    length: number
}


export interface points {
    currentCardId: string;
    currentIdNewPosition: number;
    upCurrentCardId: string;
    upCurrentCardNewPosition: number
}

const API_POINT: ApiPoint<IdType, Point> = new pointService.ApiPointImpl<IdType, Point>('data/points');
const libraries: ("drawing" | "geometry" | "localContext" | "places" | "visualization")[] = ["places"];
const googleKey = process.env.REACT_APP_GOOGLE_KEY

export default function PointCard({ point, length }: PointCardProps) {

    const idTrip = useParams().tripId;


    const navigate = useNavigate();
    let center = {
        lat: Number(point.lat),
        lng: Number(point.lng)
    }


    const mapRef = React.useRef<google.maps.Map | null>(null);


    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',

        googleMapsApiKey: googleKey!,
        libraries,
    })

    const onLoad = (map: google.maps.Map): void => {
        mapRef.current = map;
    }

    const onUnmount = (): void => {
        mapRef.current = null;
    }

    if (!isLoaded) return <div>MAP LOADING ...</div>

    const deleteClickHandler = () => {
        API_POINT.deleteById(point._id, idTrip + '').then((data) => {
            navigate(`/trip/points/${idTrip}`);
        }).catch((err) => {
            console.log(err);
        });

    }

    const editPositionUp = async (e: React.MouseEvent, pointPosition: number, id: IdType) => {

        let card = e.currentTarget.parentElement?.children[(pointPosition * 3) - 5];
        let idCardUp = card?.getAttribute('id');
        if (idCardUp !== null && idCardUp !== undefined) {

            let currentCardId = id;
            let currentIdNewPosition = pointPosition - 1;
            let upCurrentCardId = idCardUp;
            let upCurrentCardNewPosition = +pointPosition;

            let points = {
                currentCardId,
                currentIdNewPosition,
                upCurrentCardId,
                upCurrentCardNewPosition
            } as points;

            await API_POINT.editPointPosition(id, points).then((data) => {

                navigate(`/trip/points/${idTrip}`);
            }).catch(err => {
                console.log(err)
            });
        }
    }


    const editPositionDwn = async (e: React.MouseEvent, pointPosition: number, id: IdType) => {


        let card = e.currentTarget.parentElement?.children[(pointPosition * 3) + 1];
        let idCardUp = card?.getAttribute('id');


        if (idCardUp !== null && idCardUp !== undefined) {

            let currentCardId = id;
            let currentIdNewPosition = pointPosition + 1;
            let upCurrentCardId = idCardUp;
            let upCurrentCardNewPosition = +pointPosition;

            let points = {
                currentCardId,
                currentIdNewPosition,
                upCurrentCardId,
                upCurrentCardNewPosition
            } as points


            await API_POINT.editPointPosition(id, points).then((data) => {
                navigate(`/trip/points/${idTrip}`);
            }).catch(err => {
                console.log(err)
            });
        }

    }


    return (
        <>
            {point.pointNumber > 1 ?
                <ArrowCircleUpIcon onClick={(e) => editPositionUp(e, +point.pointNumber, point._id)} /> : <ArrowCircleUpIcon sx={{ display: 'none' }} onClick={(e) => editPositionUp(e, +point.pointNumber, point._id)} />
            }
            <Card
                id={point._id + ''}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '300px', margin: '20px',
                    padding: '15px 0px', backgroundColor: '#8d868670',
                    boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px'
                }}>
                <Typography gutterBottom component="h6" sx={{padding:'0px 10px'}}>
                    Point N {point.pointNumber}
                </Typography>
                <Typography gutterBottom component="h1" sx={{padding:'0px 10px'}}>
                    NAME: {point.name}
                </Typography>
                <Typography gutterBottom component="p" sx={{padding:'0px 10px'}}>
                    DESCRIPTION : {point.description}
                </Typography>
                {center.lng ?
                    <GoogleMap
                        mapContainerStyle={containerStylePoint}
                        options={optionsPoint}
                        center={center}
                        zoom={12}
                        onLoad={onLoad}
                        onUnmount={onUnmount}

                    >
                        <MarkerF position={center} title={'Point ???'+point.pointNumber } label={point.pointNumber + ''} animation={google.maps.Animation.DROP} />
                    </GoogleMap>
                    :
                    <Typography gutterBottom component="p">
                        NO MAP MARKER ADDED
                    </Typography>
                }
                <span>
                    <Button variant="contained" component={Link} to={`/points/edit/${point._id}`} sx={{ ':hover': { background: '#4daf30' }, margin: '5px' }}>EDIT POINT</Button>
                    <Button variant="contained" onClick={deleteClickHandler} sx={{ ':hover': { background: '#ef0a0a' }, margin: '5px' }}>DELETE POINT</Button>
                </span>
            </Card>
            {point.pointNumber < length ?
                <ArrowCircleDownIcon onClick={(e) => editPositionDwn(e, +point.pointNumber, point._id)} /> :
                <ArrowCircleDownIcon sx={{ display: 'none' }} onClick={(e) => editPositionDwn(e, +point.pointNumber, point._id)} />
            }
        </>
    )
}