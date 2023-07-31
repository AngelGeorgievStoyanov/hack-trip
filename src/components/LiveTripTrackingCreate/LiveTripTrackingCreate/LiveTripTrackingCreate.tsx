
import { GoogleMap, Marker, MarkerF, PolylineF, useJsApiLoader } from "@react-google-maps/api";
import React, { FC, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { containerStyle, options } from "../../settings";
import { IdType } from "../../../shared/common-types";
import { Box, Button, Container, Grid, IconButton, Typography } from "@mui/material";
import FormInputText from "../../FormFields/FormInputText";
import FormTextArea from "../../FormFields/FormTextArea";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { LoginContext } from "../../../App";
import jwt_decode from "jwt-decode";
import * as tripService from '../../../services/tripService';
import { Trip } from '../../../model/trip';
import { ApiTrip } from '../../../services/tripService';
import PlayCircleFilledTwoToneIcon from '@mui/icons-material/PlayCircleFilledTwoTone';
import StopCircleTwoToneIcon from '@mui/icons-material/StopCircleTwoTone';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
type decode = {
    _id: string,
}


const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data/trips');

const googleKey = process.env.REACT_APP_GOOGLE_KEY;
let zoom = 8;

let center = {
    lat: 42.697866831005435,
    lng: 23.321590139866355
}


type FormData = {
    name: string;
    description: string;
    lat: string;
    lng: string;
    _ownerId: string,


};


const libraries: ("drawing" | "geometry" | "localContext" | "places" | "visualization")[] = ["places"];


const schema = yup.object({
    name: yup.string().required().min(1).max(100).matches(/^(?!\s+$).*/, 'Name cannot be empty string.'),
    description: yup.string().matches(/^(?!\s+$).*/, 'Description cannot be empty string.').max(1050, 'Description max length is 1050 chars'),

}).required();

let userId: string | undefined;


type positionsPoints = {
    lng: number,
    lat: number,
    alt: number | null,
    timestamp: number,
    speed: number | null

}

let watchPos: number

let optionsPosition = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 0,
};
let sum: number = 0

interface ctr {
    lat: number;
    lng: number;
}

const dateRegExp = new RegExp('[0-9]{2}:[0-9]{2}:[0-9]{2}')

let wakelock: WakeLockSentinel | null;

const LiveTripTrackingCreate: FC = () => {


    const { userL } = useContext(LoginContext);
    const [errorMessageImage, setErrorMessageImage] = useState<string | undefined>();
    const [imageBackground, setImageBackground] = useState<string>()
    const [errorMessageGPS, setErrorMessageGPS] = useState<string | undefined>();
    const [startPosition, setStartPosition] = useState<positionsPoints | undefined>()
    const [liveTrackingPositions, setLiveTrackingPositions] = useState<positionsPoints[]>([])
    const [centerP, setCenterP] = useState<ctr | undefined>()
    const [stopTracking, setStopTracking] = useState<boolean>(false)
    const [mypos, setMypos] = useState<boolean>(false)
    const [showBtn, setShowBtn] = useState<boolean>(false)


    const isIphone = /\b(iPhone)\b/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent);

    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(window.navigator.userAgent);

    const accessToken = userL?.accessToken ? userL.accessToken : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id;
    }



    useEffect(() => {
        API_TRIP.backgroundImages().then((data) => {
            setImageBackground(data[Math.floor(Math.random() * data.length)])

        }).catch((err) => {
            console.log(err)
        });
    }, [])


    const { control, formState: { errors } } = useForm<FormData>({


        defaultValues: {
            name: '', description: '',
        },
        mode: 'onChange',
        resolver: yupResolver(schema),
    });


    const pathPoints = (liveTrackingPositions?.length) && (liveTrackingPositions !== undefined) ? liveTrackingPositions?.sort((a, b) => Number(a.timestamp) - Number(b.timestamp)).map((x) => { return { lat: Number(x.lat), lng: Number(x.lng) } }) : [];

    const [clickedPos, setClickedPos] = React.useState<google.maps.LatLngLiteral | undefined>({} as google.maps.LatLngLiteral);

    const navigate = useNavigate();

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',

        googleMapsApiKey: googleKey!,
        libraries,
    });

    const mapRef = React.useRef<google.maps.Map | null>(null);

    const onLoad = (map: google.maps.Map): void => {
        mapRef.current = map;
    }

    const onUnmount = (): void => {
        mapRef.current = null;
    }

    // const onMapClick = (e: google.maps.MapMouseEvent) => {


    //     if (e.latLng?.lat() !== undefined && (typeof (e.latLng?.lat()) === 'number')) {

    //         // center = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    //         setClickedPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    //         setCenterP({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    //     }
    // }


    const removeMarker = () => {
        setClickedPos(undefined);
        center = {
            lat: 42.697866831005435,
            lng: 23.321590139866355
        }
        zoom = 8;
    }


    if (!isLoaded) return <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh', '@media(max-width: 900px)': { display: 'flex', width: '100vw', padding: '0', margin: '0' } }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}><Typography sx={{ fontFamily: 'Space Mono, monospace' }} variant='h4'>MAP LOADING ...</Typography></Grid>


    const dragMarker = (e: google.maps.MapMouseEvent) => {

        if (e.latLng?.lat() !== undefined && (typeof (e.latLng?.lat()) === 'number')) {

            setClickedPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
    }


    if (errorMessageImage) {

        setTimeout(() => {
            setErrorMessageImage(undefined)
        }, 5000)

    }


    if (errorMessageGPS) {

        setTimeout(() => {
            setErrorMessageGPS(undefined)
        }, 5000)

    }


    const getPosition = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getGPS, gpsError)
        } else {
            setErrorMessageGPS('No GPS Funtionality.')
        }
    }

    const getGPS = (position: any) => {
        setClickedPos({ lat: position.coords.latitude, lng: position.coords.longitude });
        center = { lat: position.coords.latitude, lng: position.coords.longitude };
        zoom = 16;
    }


    const onStartTracking = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getSTART, gpsError, optionsPosition)
            watchPos = navigator.geolocation.watchPosition(startWatch, gpsError)
            lockWakeState()
        } else {
            setErrorMessageGPS('No GPS Funtionality.')
        }
    }



    const startWatch = (position: any) => {
        setLiveTrackingPositions(prev => [...prev, { lat: position.coords.latitude, lng: position.coords.longitude, alt: position.coords.altitude, timestamp: position.timestamp, speed: position.coords.speed }])

    }


    const getSTART = (position: any) => {
        removeMarker()
        setStartPosition({ lat: position.coords.latitude, lng: position.coords.longitude, alt: position.coords.altitude, timestamp: position.timestamp, speed: position.coords.speed })
        center = { lat: position.coords.latitude, lng: position.coords.longitude };
        zoom = 16;
    }

    const gpsError = (error: any) => {
        setErrorMessageGPS('GPS Error: ' + error.code + ', ' + error.message)
    }



    const goBack = () => {
        navigate(-1);
    }


    const onStopTracking = () => {
        navigator.geolocation.clearWatch(watchPos);
        setStopTracking(true)
        releaseWakeState()
    }



    const distanceBeetweenTwoCordinates = (lat1: number, lat2: number, lng1: number, lng2: number) => {
        // Degrees to radians
        lng1 = lng1 * (Math.PI / 180); //(Math.PI / 180) ~ 57,29577951
        lng2 = lng2 * (Math.PI / 180);
        lat1 = lat1 * (Math.PI / 180);
        lat2 = lat2 * (Math.PI / 180);


        //Haversine formula
        let dlng = lng2 - lng1;
        let dlat = lat2 - lat1;
        let a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlng / 2), 2);

        let c = 2 * Math.asin(Math.sqrt(a));

        let r = 6371;//TODO this is in km


        return (c * r);
    }



    if (liveTrackingPositions.length > 0) {

        let point: positionsPoints | undefined;
        sum = 0;

        liveTrackingPositions.forEach((x, i) => {
            if (point !== undefined) {
                let distanceBeetewTwoPoints = distanceBeetweenTwoCordinates(point.lat, x.lat, point.lng, x.lng);
                sum += distanceBeetewTwoPoints;
                point = x;
            } else {
                point = x;
            }
        })
    }

    const onDragMap = () => {
        setCenterP(undefined)
        setMypos(false)
        if (liveTrackingPositions.length) {
            setShowBtn(true)
        }
    }


    const onDeleteTracking = () => {
        setStartPosition(undefined)
        setStopTracking(false)
        setLiveTrackingPositions([])
    }



    const onMyLocationCenter = () => {
        setMypos(true)
        setShowBtn(false)
    }


    if (mypos && liveTrackingPositions.length) {
        center = { lat: liveTrackingPositions[liveTrackingPositions.length - 1].lat, lng: liveTrackingPositions[liveTrackingPositions.length - 1].lng }
    }

    if (showBtn === false && liveTrackingPositions.length) {
        center = { lat: liveTrackingPositions[liveTrackingPositions.length - 1].lat, lng: liveTrackingPositions[liveTrackingPositions.length - 1].lng }
    }


    const canWakeLock = () => 'wakeLock' in navigator;

    const lockWakeState = async () => {
        if (!canWakeLock()) return;
        try {
            wakelock = await navigator.wakeLock.request('screen');
            wakelock.addEventListener('release', () => {
                console.log('Screen Wake State Locked:', wakelock ? 'false' : 'true');
            });
            console.log('Screen Wake State Locked:', wakelock ? 'true' : 'false');
        } catch (err: any) {
            console.error('Failed to lock wake state with reason:', err.message);
        }
    }

    const releaseWakeState = () => {
        if (wakelock) wakelock.release();
        wakelock = null;
    }

    return (
        <>
            <Grid container sx={!isIphone ?
                {
                    backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover", backgroundAttachment: 'fixed',
                    justifyContent: 'center', padding: '0px 0px 0px 13px', bgcolor: '#cfe8fc', minHeight: '100vh', '@media(max-width: 600px)': {
                        display: 'flex', flexDirection: 'column'
                    }
                }
                :
                {
                    backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",
                    justifyContent: 'center',
                    bgcolor: '#cfe8fc', height: '100vh', overflow: 'scroll', margin: '-25px 0px 0px 0px', padding: '0px 0px 0px 13px'

                }

            } spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

                <Container maxWidth={false} sx={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', '@media(max-width: 1020px)': {
                        display: 'flex', flexDirection: 'column', maxWidth: '100%'
                    }
                }}>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '100%', marginTop: '5px' }}>

                        <Box sx={{ display: 'flex', maxWidth: '600px', border: 'solid 1px', boxShadow: '3px 2px 5px black', '@media(max-width: 920px)': { maxWidth: '97%' } }} >

                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                options={options as google.maps.MapOptions}
                                center={centerP || center}
                                zoom={zoom}
                                onLoad={onLoad}
                                onUnmount={onUnmount}
                                // onClick={onMapClick}
                                onDragStart={onDragMap}
                            >
                                {clickedPos?.lat ? <Marker position={clickedPos} animation={google.maps.Animation.DROP} draggable onDragEnd={dragMarker} /> : null}
                                {startPosition?.lat ? <Marker position={startPosition} icon={{ url: 'https://storage.googleapis.com/hack-trip/plug-outlet-svgrepo-com.svg', anchor: new google.maps.Point(46, 46) }} /> : ''}
                                {pathPoints ? <PolylineF path={pathPoints} /> : null}
                                {liveTrackingPositions.length ? <MarkerF icon={{ url: 'https://storage.googleapis.com/hack-trip/electric-car-electric-vehicle-svgrepo-com.svg', size: new google.maps.Size(50, 50), scaledSize: new google.maps.Size(50, 50), anchor: new google.maps.Point(25, 40) }} position={{ lat: liveTrackingPositions[liveTrackingPositions.length - 1].lat, lng: liveTrackingPositions[liveTrackingPositions.length - 1].lng }} /> : ''}

                            </GoogleMap>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', margin: '10px', '@media(max-width: 900px)': { display: 'flex', flexDirection: 'column', alignItems: 'center' } }}>
                            {!liveTrackingPositions.length ?
                                <>
                                    <Button variant="contained" onClick={removeMarker} sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black', margin: '2px' }}  >Remove Marker</Button>
                                    <Button variant="contained" onClick={getPosition} sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black', margin: '2px' }}  >Gps position</Button>
                                </>
                                : ''}
                            {errorMessageGPS ? <Typography style={{ color: 'red', marginLeft: '12px' }}>{errorMessageGPS}</Typography> : ''}

                        </Box>

                        {showBtn ?

                            <IconButton >
                                <MyLocationRoundedIcon onClick={onMyLocationCenter} sx={{ fontSize: 55 }} />


                            </IconButton>
                            : ''}


                        <Box component='form'
                            sx={{
                                margin: '30px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                maxWidth: '430px',
                                minHeight: '250px',
                                maxHeight: '1100px',
                                padding: '30px',
                                backgroundColor: '#eee7e79e',
                                boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px',
                                '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },
                                '& .MuiButton-root': { m: 1, width: '32ch' },
                            }}
                            noValidate
                            autoComplete="off"

                        >

                            <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h5">
                                TEST PAGE - START LIVE TRIP
                            </Typography>
                            <span >
                                <FormInputText name='name' label='Name fo the live trip' control={control} error={errors.name?.message} />
                            </span>
                            <FormTextArea name="description" label="DESCRIPTION" control={control} error={errors.description?.message} multiline={true} rows={2} />

                            {
                                liveTrackingPositions.length > 0 ?
                                    <>
                                        <Typography>This is test: live tracking</Typography>
                                        <Typography>GPS latitude: {liveTrackingPositions[liveTrackingPositions.length - 1].lat ? liveTrackingPositions[liveTrackingPositions.length - 1].lat.toFixed(7) : 'null'}</Typography>
                                        <Typography>GPS longitude:  {liveTrackingPositions[liveTrackingPositions.length - 1].lng ? liveTrackingPositions[liveTrackingPositions.length - 1].lng.toFixed(7) : 'null'}</Typography>
                                        <Typography>GPS Times: {liveTrackingPositions[liveTrackingPositions.length - 1].timestamp ? (new Date(liveTrackingPositions[liveTrackingPositions.length - 1].timestamp) + '').match(dateRegExp) : 'null'}</Typography>
                                        <Typography>GPS Speed: {liveTrackingPositions[liveTrackingPositions.length - 1].speed ? Math.floor(Number(liveTrackingPositions[liveTrackingPositions.length - 1].speed) * 3.6) + '  km/h' : 'null'}</Typography>
                                        <Typography>GPS total km: {sum < 1 ? Number(sum.toFixed(3)) * 1000 + ' m' : sum.toFixed(3) + ' km'}</Typography>
                                        <Typography>GPS altitude now:  {liveTrackingPositions[liveTrackingPositions.length - 1].alt ? (liveTrackingPositions[liveTrackingPositions.length - 1].alt)?.toFixed(0) + ' m' : 'null'}</Typography>
                                        <Typography>GPS altitude from start:  {liveTrackingPositions[liveTrackingPositions.length - 1].alt && liveTrackingPositions[0].alt ? (liveTrackingPositions[0].alt)?.toFixed(0) + ' m ' : 'null'}</Typography>
                                        <Typography>GPS alt diff from start:  {liveTrackingPositions[liveTrackingPositions.length - 1].alt && liveTrackingPositions[0].alt ? (Math.round(Number(liveTrackingPositions[liveTrackingPositions.length - 1].alt)) - Math.round(liveTrackingPositions[0].alt)) + ' m' : 'null'}</Typography>

                                    </>
                                    :
                                    ''}
                            <Box component='div' sx={{ display: 'flex', '@media(max-width: 600px)': { flexDirection: 'column', alignItems: 'center' } }}>
                                {mobile ?
                                    <>
                                        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-around' }}>

                                            <IconButton disabled={liveTrackingPositions.length > 0 ? true : false}>

                                                < PlayCircleFilledTwoToneIcon onClick={onStartTracking} sx={{ fontSize: 55 }} />
                                            </IconButton>
                                            {liveTrackingPositions.length ?
                                                <>
                                                    {/* <Button variant="contained" onClick={onStopTracking} disabled={stopTracking}>STOP</Button> */}
                                                    <IconButton disabled={stopTracking}>
                                                        < StopCircleTwoToneIcon onClick={onStopTracking} sx={{ fontSize: 55 }} />
                                                    </IconButton>

                                                </>
                                                : ''}
                                        </Box>


                                        {stopTracking ?
                                            <Button variant="contained" onClick={onDeleteTracking} >DELETE TRACKING</Button>
                                            : ''}
                                    </>
                                    :
                                    <>
                                        <Button variant="contained" onClick={onStartTracking} sx={{ ':hover': { background: '#4daf30' } }} disabled={liveTrackingPositions.length > 0 ? true : false}>START</Button>
                                        {liveTrackingPositions.length ?
                                            <Button variant="contained" onClick={onStopTracking} disabled={stopTracking}>STOP</Button>
                                            : ''}
                                        {stopTracking ?
                                            <Button variant="contained" onClick={onDeleteTracking} >DELETE TRACKING</Button>
                                            : ''}
                                    </>
                                }

                                <Button onClick={goBack} variant="contained" sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Grid>
        </>
    )
};

export default LiveTripTrackingCreate;


