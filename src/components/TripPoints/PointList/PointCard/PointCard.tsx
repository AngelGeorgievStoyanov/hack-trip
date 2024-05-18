import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import React, { FC, ReactElement, useContext } from "react";
import { Point } from "../../../../model/point";
import { ApiPoint } from "../../../../services/pointService";
import { IdType } from "../../../../shared/common-types";
import { containerStylePoint, optionsPoint } from "../../../settings";
import * as pointService from '../../../../services/pointService'
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, Grid, Typography } from "@mui/material";
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import { LoginContext } from "../../../../App";
import jwt_decode from "jwt-decode";


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
const libraries: Array<"drawing" | "places" | "geometry"> = [ "places"]
const googleKey = process.env.REACT_APP_GOOGLE_KEY

let userId: string | undefined;


type decode = {
    _id: string,
}


const PointCard: FC<PointCardProps> = ({ point, length }): ReactElement => {


    const idTrip = useParams().tripId;

    const { token } = useContext(LoginContext);

    const navigate = useNavigate();
    let center = {
        lat: Number(point.lat),
        lng: Number(point.lng)
    }


    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id;
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

    if (!isLoaded) return <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh', '@media(max-width: 900px)': { display: 'flex', width: '100vw', padding: '0', margin: '0' } }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}><Typography sx={{ fontFamily: 'Space Mono, monospace' }} variant='h4'>MAP LOADING ...</Typography></Grid>


    const deleteClickHandler = () => {
        if (idTrip && userId) {
            API_POINT.deleteById(point._id, idTrip, userId).then((data) => {
                navigate(`/trip/points/${idTrip}`);
            }).catch((err) => {
                console.log(err);
            });
        }

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
            {Number(point.pointNumber) > 1 ?
                <ArrowCircleUpIcon sx={{ ':hover': { cursor: 'pointer' } }} onClick={(e) => editPositionUp(e, +point.pointNumber, point._id)} /> : <ArrowCircleUpIcon sx={{ display: 'none' }} onClick={(e) => editPositionUp(e, +point.pointNumber, point._id)} />
            }
            <Card
                id={point._id + ''}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '300px', margin: '20px',
                    padding: '15px 0px', backgroundColor: '#e5e3e3d9',
                    boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px'
                }}>
                <Typography gutterBottom component="h6" sx={{ padding: '0px 10px' }}>
                    Point N {point.pointNumber}
                </Typography>
                <Typography gutterBottom component="h1" sx={{ padding: '0px 10px' }}>
                    NAME: {point.name}
                </Typography>
                <Typography gutterBottom component="p" sx={{ padding: '0px 10px' }}>
                    DESCRIPTION : {point.description}
                </Typography>
                {center.lng ?
                    <GoogleMap
                        mapContainerStyle={containerStylePoint}
                        options={optionsPoint}
                        center={center}
                        zoom={14}
                        onLoad={onLoad}
                        onUnmount={onUnmount}

                    >
                        <MarkerF position={center} title={'Point №' + point.pointNumber} label={point.pointNumber + ''} animation={google.maps.Animation.DROP} />
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
            {Number(point.pointNumber) < length ?
                <ArrowCircleDownIcon sx={{ ':hover': { cursor: 'pointer' } }} onClick={(e) => editPositionDwn(e, +point.pointNumber, point._id)} /> :
                <ArrowCircleDownIcon sx={{ display: 'none' }} onClick={(e) => editPositionDwn(e, +point.pointNumber, point._id)} />
            }
        </>
    )
}

export default PointCard;
