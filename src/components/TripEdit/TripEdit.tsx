import { useNavigate, useParams } from "react-router-dom";
import { CurrencyCode, Trip, TripCreate, TripTipeOfGroup, TripTransport } from "../../model/trip";
import { IdType, toIsoDate, TripGroupId } from "../../shared/common-types";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import React, { BaseSyntheticEvent, FC, useContext, useEffect, useState } from "react";
import { Alert, Box, Button, ButtonGroup, Container, Grid, ImageList, ImageListItem, Snackbar, TextField, Typography } from "@mui/material";
import FormInputText from "../FormFields/FormInputText";
import FormInputSelect, { SelectOption } from "../FormFields/FormInputSelect";
import FormTextArea from "../FormFields/FormTextArea";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from "react-hook-form";
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';
import LoadingButton from "@mui/lab/LoadingButton";
import jwt_decode from "jwt-decode";
import { LoginContext } from "../../hooks/LoginContext";
import useMediaQuery from '@mui/material/useMediaQuery';
import { ApiTrip } from "../../services/tripService";
import * as tripService from "../../services/tripService";
import * as pointService from "../../services/pointService";
import GoogleMapWrapper from "../GoogleMapWrapper/GoogleMapWrapper";
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import CustomFileUploadButton from "../CustomFileUploadButton/CustomFileUploadButton ";
import { handleFilesChange } from "../../shared/handleFilesChange";
import { Point } from "../../model/point";
import { ApiPoint } from "../../services/pointService";
import RemoveAllImagesButton from "../RemoveAllImagesButton/RemoveAllImagesButton";
import { useConfirm } from "../ConfirmDialog/ConfirmDialog";


type decode = {
    _id: string,

}


const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data');
const API_POINT: ApiPoint<IdType, Point> = new pointService.ApiPointImpl<IdType, Point>('data/points');


const googleKey = process.env.REACT_APP_GOOGLE_KEY;
const libraries: Array<"drawing" | "places" | "geometry"> = ["places"]

let zoom = 8;

let center = {
    lat: 42.697866831005435,
    lng: 23.321590139866355
}


type FormData = {
    _ownerId: string;
    title: string;
    price: number;
    transport: string;
    countPeoples: number;
    typeOfPeople: string;
    destination: string;
    description: string;
    timeCreated: string | undefined;
    timeEdited?: string | undefined;
    lat: number | undefined;
    lng: number | undefined;
    imageFile: string[] | undefined;
    currency: string;
    dayNumber: number;
    tripGroupId?: string;
};


const TRIP_SELECT_OPTIONS_TRANSPORT: SelectOption[] = Object.keys(TripTransport)
    .filter((item) => !isNaN(Number(item)))
    .map((ordinal: string) => parseInt(ordinal))
    .map((ordinal: number) => ({ key: ordinal, value: TripTransport[ordinal] }));

const TRIP_SELECT_OPTIONS_TYPE_GROUPE: SelectOption[] = Object.keys(TripTipeOfGroup)
    .filter((item) => !isNaN(Number(item)))
    .map((ordinal: string) => parseInt(ordinal))
    .map((ordinal: number) => ({ key: ordinal, value: TripTipeOfGroup[ordinal] }));

const TRIP_SELECT_OPTIONS_CURRENCY: SelectOption[] = Object.keys(CurrencyCode)
    .map(key => ({
        key: key,
        value: CurrencyCode[key as keyof typeof CurrencyCode]
    }));

const schema = yup.object({
    title: yup.string().required().min(2).max(60).matches(/^(?!\s+$).*(\S{3})/, 'Title cannot be empty string and must contain at least 3 characters .'),
    price: yup.number().min(0.1, 'Price must be positive').max(1000000),
    countPeoples: yup.number().min(1, 'Count of people cannot be 0.').integer('Count of peoples must be intiger.').max(1000),
    destination: yup.string().required().min(3, 'Destination is required min length 3 chars.').max(60, 'Max length is 60 chars.').matches(/^(?!\s+$).*(\S{3})/, 'Destination cannot be empty string and must contain at least 3 characters .'),
    description: yup.string().max(1050, 'Description max length is 1050 chars').matches(/^(?!\s+$).*/, 'Description cannot be empty string.'),

}).required();


let userId: string | undefined;



const TripEdit: FC = () => {

    const idTrip = useParams().tripId;

    const [trip, setTrip] = useState<Trip>();
    const [images, setImages] = useState<string[]>();
    const [clickedPos, setClickedPos] = React.useState<google.maps.LatLngLiteral | undefined>({} as google.maps.LatLngLiteral);
    const [initialPoint, setInitialPoint] = React.useState<google.maps.LatLngLiteral>({ lat: Number(trip?.lat), lng: Number(trip?.lng) } as google.maps.LatLngLiteral);
    const [fileSelected, setFileSelected] = React.useState<File[]>([]);
    const [errorMessageSearch, setErrorMessageSearch] = useState('');
    const [visible, setVisible] = React.useState(true);
    const [loading, setLoading] = useState<boolean>(true);
    const [buttonAdd, setButtonAdd] = useState<boolean>(true);
    const [errorMessageImage, setErrorMessageImage] = useState<string | undefined>();
    const [imageBackground, setImageBackground] = useState<string>()
    const [errorApi, setErrorApi] = useState<string>();
    const [dayNumber, setDayNumber] = useState(1);
    const [checkDay, setCheckDay] = useState<boolean>(false);
    const [tripGroup, setTripGroup] = useState<TripGroupId[]>([]);
    const [confirmedChangeDayNumber, setConfirmedChangeDayNumber] = useState<boolean>(false);
    const [isImagesChanged, setIsImagesChanged] = useState(false);
    const [points, setPoints] = useState<Point[]>([]);

    const { confirm } = useConfirm();

    const { token } = useContext(LoginContext);

    const isIphone = /\b(iPhone)\b/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent);

    const iconFotoCamera = useMediaQuery('(max-width:600px)');


    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined;


    let positionPoint;

    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id;

    }


    useEffect(() => {

        if (idTrip && userId && accessToken) {

            API_TRIP.findById(idTrip, userId, accessToken).then((data) => {
                setTrip(prev => data)
                setImages(data.imageFile ? data.imageFile : []);
                setDayNumber(data.dayNumber)
                setInitialPoint({ lat: Number(data?.lat), lng: Number(data?.lng) })
                API_POINT.findByTripId(data._id, accessToken).then((data: Point[] | []) => {
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
                }).catch((err) => {
                    console.log(err);
                });

                reset({
                    title: data.title,
                    _ownerId: data._ownerId,
                    countPeoples: Number(data.countPeoples) || 0,
                    timeCreated: data.timeCreated,
                    lat: (data.lat !== undefined && data.lat !== null) ? Number(data.lat) : undefined,
                    lng: (data.lng !== undefined && data.lng !== null) ? Number(data.lng) : undefined,
                    timeEdited: data.timeEdited,
                    typeOfPeople: TripTipeOfGroup[data.typeOfPeople || 0],
                    description: data.description,
                    destination: data.destination,
                    price: Number(data.price) || 0,
                    transport: TripTransport[data.transport || 0],
                    imageFile: data.imageFile,
                    currency: data.currency,
                    dayNumber: data.dayNumber
                });

            }).catch((err) => {
                console.log(err)
            });

            API_TRIP.backgroundImages().then((data) => {
                setImageBackground(data[Math.floor(Math.random() * data.length)])

            }).catch((err) => {
                console.log(err)
            });

        }
    }, []);

    useEffect(() => {
        if (trip && trip.tripGroupId && accessToken) {


            API_TRIP.findByTripGroupId(trip.tripGroupId, accessToken).then((data) => {
                setTripGroup(data)

            }).catch((err) => {
                console.log(err)
            });

        }
    }, [trip])


    const { control, handleSubmit, reset, setValue, formState: { errors, isDirty, isValid } } = useForm<FormData>({

        mode: 'onChange',
        resolver: yupResolver(schema),
    });




    if (trip && (trip.lng !== undefined && trip.lng !== null) && (trip.lat !== undefined && trip.lat !== null) && (clickedPos?.lat === undefined)) {

        positionPoint = { lat: Number(trip.lat), lng: Number(trip.lng) }
        center = { lat: Number(trip.lat), lng: Number(trip.lng) }
    }


    const searchRef = React.useRef<HTMLInputElement | null>(null);

    const navigate = useNavigate();


    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',

        googleMapsApiKey: googleKey!,
        libraries,
    });




    const handleEditTripFilesChange = (event: BaseSyntheticEvent) => {
        handleFilesChange(event, fileSelected, setFileSelected, setErrorMessageImage, images?.length || 0);
    };

    const mapRef = React.useRef<google.maps.Map | null>(null);

    const onLoad = (map: google.maps.Map): void => {
        mapRef.current = map;
    }

    const onUnmount = (): void => {
        mapRef.current = null;
    }


    const onMapClick = async (e: google.maps.MapMouseEvent) => {
        if (points.length === 0) {
            if (e.latLng?.lat() !== undefined && (typeof (e.latLng?.lat()) === 'number') && (e.latLng?.lat() !== null)) {
                setClickedPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                setVisible(true);
                setInitialPoint({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            }
        }
    }


    const searchInp = async () => {
        if (searchRef.current?.value === '') {
            setErrorMessageSearch('Plece enter location');
            return;
        }

        setErrorMessageSearch('');
        const geocode = new google.maps.Geocoder();

        try {

            const result = await geocode.geocode({
                address: searchRef.current!.value
            });


            if (result) {
                let searchPosition = { lat: result.results[0].geometry.location.lat(), lng: result.results[0].geometry.location.lng() }


                zoom = 16;
                center = searchPosition;
                setClickedPos(searchPosition);
                setVisible(true);
                setInitialPoint(searchPosition);
            }

        } catch (err: any) {

            setErrorMessageSearch('Plece enter exact name location or choose from suggestions');

            console.log(err.message);
        }

        if (searchRef.current?.value !== '' && searchRef.current?.value !== null) {
            searchRef.current!.value = '';
        }
    }


    const removeMarker = () => {

        setClickedPos(undefined);
        setVisible(false);


        center = {
            lat: 42.697866831005435,
            lng: 23.321590139866355
        }
        zoom = 8;
    }




    if (!isLoaded) return <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh', '@media(max-width: 900px)': { display: 'flex', width: '100vw', padding: '0', margin: '0' } }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}><Typography sx={{ fontFamily: 'Space Mono, monospace' }} variant='h4'>MAP LOADING ...</Typography></Grid>



    const editTripSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {

        if (accessToken && trip && userId && trip?.tripGroupId) {
            if (trip.dayNumber !== dayNumber) {
                let flag = false
                if (!confirmedChangeDayNumber && tripGroup.some((x) => x.dayNumber === dayNumber)) {

                    const result = await confirm(`Day ${dayNumber} already exists!  Do you want to change it with day ${trip.dayNumber} `, 'Change Day Confirmation');
                    if (result) {
                        setConfirmedChangeDayNumber(prev => true)
                        setCheckDay(true)
                        flag = true;
                    } else {
                        return;
                    }

                }

                if (confirmedChangeDayNumber || flag) {
                    const findTrip = tripGroup.find(x => x.dayNumber === dayNumber)

                    if (findTrip) {
                        const tripId = findTrip._id;
                        try {
                            const prevTrip = await API_TRIP.findById(tripId, userId, accessToken)
                            prevTrip.dayNumber = trip.dayNumber
                            await API_TRIP.update(prevTrip._id, prevTrip, userId, accessToken);
                            setButtonAdd(false)
                        } catch (err) {
                            console.log(err)
                        }
                    }
                }


            }
            let formData = new FormData();
            let imagesNames;
            if (fileSelected && fileSelected.length > 0) {
                fileSelected.forEach((file) => {
                    formData.append('file', file);
                });


                imagesNames = await API_TRIP.sendFile(formData, accessToken).then((data) => {
                    let imageName = data as unknown as any as any[] | [];
                    return imageName.map((x) => {
                        return x.destination;
                    })
                }).catch((err) => {
                    console.log(err);
                });
            }


            let imagesNew = imagesNames as unknown as any as string[];

            if (imagesNew !== undefined && imagesNew.length > 0) {
                data.imageFile = images?.concat(imagesNew);
            } else {
                data.imageFile = images;
            }



            if (clickedPos?.lat) {
                data.lat = clickedPos.lat;
                data.lng = clickedPos.lng;
            } else {
                if ((trip.lat !== undefined && trip.lat !== null) && (trip.lng !== undefined && trip.lng !== null)) {
                    data.lat = Number(trip.lat);
                    data.lng = Number(trip.lng);
                }
            }


            data.title = data.title.trim();
            data.destination = data.destination.trim();
            data.description = data.description.trim();
            data.timeEdited = toIsoDate(new Date());
            data.typeOfPeople = TripTipeOfGroup[parseInt(data.typeOfPeople)];
            data.transport = TripTransport[parseInt(data.transport)];
            data.dayNumber = dayNumber;
            const editTrip = { ...data } as unknown as Trip;

            editTrip._id = trip._id;


            API_TRIP.update(trip._id, editTrip, userId, accessToken).then((data) => {
                setButtonAdd(true)
                navigate(`/trip/details/${trip._id}`);
            }).catch((err) => {
                console.log(err.message);
                setErrorApi(err.message ? err.message : typeof err === 'string' ? err : 'Something went wrong!');
                setLoading(false);
                setButtonAdd(true);
            });
        }
    }

    const goBack = () => {
        navigate(-1);
    }





    const deleteImage = async (item: string) => {

        if (accessToken && trip) {
            const result = await confirm('Are you sure you want to delete this image?', 'Delete Confirmation');
            if (result) {
                const index = images?.indexOf(item);
                if (index !== undefined) {
                    const deletedImage = images?.slice(index, index + 1);
                    if (deletedImage) {
                        API_TRIP.editImages(trip._id, deletedImage, accessToken).then((data) => {
                            setImages(data.imageFile);
                            setIsImagesChanged(true);
                        }).catch((err) => {
                            console.log(err);
                        });
                    }
                }
            }
        }
    }


    const dragMarker = (e: google.maps.MapMouseEvent) => {
        if (e.latLng?.lat() !== undefined && (typeof (e.latLng?.lat()) === 'number')) {
            setClickedPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
    }

    const onDeleteAllImage = () => {
        setFileSelected([])
    }




    const onDeleteImage = (event: BaseSyntheticEvent) => {
        let index = fileSelected.findIndex(x => {
            return x.name === event.currentTarget.id;
        })
        fileSelected.splice(index, 1);
        setFileSelected([...fileSelected]);
    }


    if (errorMessageImage) {

        setTimeout(() => {
            setErrorMessageImage(undefined);
        }, 5000);
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setErrorApi(undefined);
    };
    const increaseDayNumber = () => {
        const newDayNumber = dayNumber + 1;
        setDayNumber(newDayNumber);
        setValue("dayNumber", newDayNumber, { shouldDirty: true });

    };

    const decreaseDayNumber = () => {

        const newDayNumber = Math.max(dayNumber - 1, 1);
        setDayNumber(newDayNumber);
        setValue("dayNumber", newDayNumber, { shouldDirty: true });

    };

    const onSetDay = async () => {
        if (dayNumber !== trip?.dayNumber) {
            if (checkDay && trip) {
                setCheckDay(false)

                if (confirmedChangeDayNumber) {
                    setConfirmedChangeDayNumber(false);
                }

            } else {
                if (trip?.tripGroupId && accessToken) {

                    try {

                        const enableChangeDayNumber = tripGroup.some((x) => x.dayNumber === dayNumber)
                        if (enableChangeDayNumber) {

                            const result = await confirm(`Day ${dayNumber} already exists!  Do you want to change it with day ${trip.dayNumber} `, 'Change Day Confirmation');
                            if (result) {
                                setConfirmedChangeDayNumber(true)
                                setCheckDay(true)
                            }

                        } else {
                            setCheckDay(true)

                        }
                    } catch (err) {
                        console.log(err)
                    }

                }

            }
        }
    };


    return (
        <>
            <Grid container sx={!isIphone ?
                {
                    backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover", backgroundAttachment: 'fixed',
                    justifyContent: 'center', bgcolor: '#cfe8fc', padding: '15px 0', minHeight: '100vh', margin: '0px', width: '100vw',
                    '@media(max-width: 1000px)': { width: '100vw', padding: '15px 0px', margin: '-25px 0px 0px 0px' }
                }
                :
                {
                    backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",
                    justifyContent: 'center',
                    bgcolor: '#cfe8fc', height: '100vh', overflow: 'scroll',
                    '@media(max-width: 1000px)': {
                        width: '100vw', padding: '15px 0px', margin: '-25px 0px 0px 0px'
                    }


                }
            } spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

                <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '0px', width: '95%' }}>

                    <GoogleMapWrapper
                        center={center}
                        zoom={zoom}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        onMapClick={onMapClick}
                        dragMarker={dragMarker}
                        clickedPos={clickedPos}
                        positionPoint={positionPoint}
                        visible={visible}
                        initialPoint={initialPoint}
                        points={points}
                    />

                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', margin: '10px', '@media(max-width: 600px)': { display: 'flex', flexDirection: 'column', alignItems: 'center' } }}>

                        <Autocomplete>
                            <TextField id="outlined-search" sx={{ backgroundColor: '#f2f1e58f', borderRadius: '5px', margin: '2px' }} label="Search field" type="search" inputRef={searchRef} helperText={errorMessageSearch} />

                        </Autocomplete>

                        <Button variant="contained" onClick={searchInp} sx={{ ':hover': { background: '#4daf30' }, margin: '2px' }}>Search</Button>
                        <Button variant="contained" onClick={removeMarker} sx={{ ':hover': { color: 'rgb(248 245 245)' }, margin: '2px', background: 'rgb(194 194 224)', color: 'black' }}  >Remove Marker</Button>

                    </Box>
                    <Box component='div' sx={{
                        display: 'flex', flexDirection: 'row', justifyContent: 'space-around', minHeight: '100vh', '@media(max-width: 1120px)': {
                            display: 'flex', flexDirection: 'column-reverse', width: '100vw', alignItems: 'center'
                        }
                    }}>
                        <Box component='form'
                            sx={{
                                margin: '30px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                width: 'fit-content',
                                height: 'fit-content',
                                padding: '30px',
                                backgroundColor: '#eee7e79e',
                                boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px',
                                '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },
                                '& .MuiButton-root': { m: 1, width: '32ch' },
                            }}
                            noValidate
                            autoComplete='0ff'
                            onSubmit={handleSubmit(editTripSubmitHandler)}
                        >
                            <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h5">
                                EDIT TRIP
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', '@media(max-width: 600px)': { flexDirection: 'column' } }}>

                                <TextField
                                    name="dayNumber"
                                    label="DAY"
                                    value={dayNumber}
                                    size="small"
                                    disabled={checkDay}
                                    sx={{ maxWidth: '60px', marginRight: '8px', pointerEvents: 'none' }}
                                    inputProps={{ style: { textAlign: 'center' } }}
                                />
                                <ButtonGroup
                                    disabled={checkDay}
                                    sx={{

                                        margin: '10px',
                                        '& .MuiButton-root': {
                                            margin: '0px',
                                            padding: '0px',
                                            maxWidth: '100px',
                                            height: '30px',
                                            width: '50px'
                                        }
                                    }}>
                                    <Button variant="contained"
                                        aria-label="reduce"

                                        onClick={decreaseDayNumber}
                                    >
                                        <RemoveIcon fontSize="small" />
                                    </Button>
                                    <Button
                                        aria-label="increase"
                                        variant="contained"
                                        onClick={increaseDayNumber}
                                    >
                                        <AddIcon fontSize="small" />
                                    </Button>
                                </ButtonGroup>
                                <Button variant="contained" onClick={onSetDay} disabled={trip?.dayNumber === dayNumber}
                                >  {checkDay ? 'change day' : 'Set day'}</Button>
                            </Box>

                            <FormInputText name='title' label='TITLE' control={control} error={errors.title?.message}
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>

                                <FormInputText name='price' label='PRICE' type="number" control={control} error={errors.price?.message}
                                />
                                <FormInputSelect name='currency' label='currency' control={control} error={errors.transport?.message}
                                    options={TRIP_SELECT_OPTIONS_CURRENCY} />
                            </Box>
                            <FormInputSelect name='transport' label='TRANSPORT' control={control} error={errors.transport?.message}
                                options={TRIP_SELECT_OPTIONS_TRANSPORT} />

                            <FormInputText name='countPeoples' type="number" label='COUNT OF PEOPLE' control={control} error={errors.countPeoples?.message}
                            />

                            <FormInputSelect name='typeOfPeople' label='TYPE OF THE GROUP' control={control} error={errors.typeOfPeople?.message}
                                options={TRIP_SELECT_OPTIONS_TYPE_GROUPE} />

                            <FormInputText name='destination' label='DESTINATION' control={control} error={errors.destination?.message}
                            />

                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                                <CustomFileUploadButton handleFilesChange={handleEditTripFilesChange} images={images || []} fileSelected={fileSelected} iconFotoCamera={iconFotoCamera} />

                                <Typography variant="overline" display="block" gutterBottom style={{ marginRight: '15px' }}>     {((images ? images.length : 0) + fileSelected.length)}/9 uploaded images</Typography>
                            </Box >
                            {((images ? images.length : 0) + fileSelected.length) >= 9 ? <Typography style={{ color: 'red', marginLeft: '12px' }}>9 images are the maximum number to upload.</Typography> : ''}
                            {errorMessageImage ? <Typography style={{ color: 'red', marginLeft: '12px' }}>{errorMessageImage}</Typography> : ''}
                            {fileSelected.length > 0 ? <>
                                <Box component='div' id='box-images' sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    maxHeight: "200px",
                                    overflow: "hidden",
                                    overflowY: 'auto',
                                    padding: '6px',
                                    border: 'solid 1px black',
                                    margin: '6px',
                                    borderRadius: '5px',
                                }}>
                                    {fileSelected.map((x, i) => { return <li style={{ 'listStyle': 'none', display: 'flex', justifyContent: 'space-between', margin: '5px 0px', alignItems: 'center' }} key={i}><img src={URL.createObjectURL(x)} style={{ borderRadius: '5px' }} alt={x.name} height='45px' width='55px' /> {x.name.length > 60 ? '...' + x.name.slice(-60) : x.name} <HighlightOffSharpIcon sx={{ cursor: 'pointer', backgroundColor: '#ffffff54', borderRadius: '50%' }} onClick={onDeleteImage} key={x.name} id={x.name} /></li> }
                                    )}
                                </Box >

                                <RemoveAllImagesButton onDeleteAllImages={onDeleteAllImage} iconFotoCamera={iconFotoCamera} />


                            </> : ''}

                            <FormTextArea name="description" label="DESCRIPTION" control={control} error={errors.description?.message} multiline={true} rows={4} />
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                                {buttonAdd === true ?
                                    <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }} disabled={(fileSelected.length > 0 || (clickedPos?.lat && clickedPos.lng) ? false : (!isDirty || !isValid) && !isImagesChanged)} >EDIT YOUR TRIP</Button>
                                    : <LoadingButton variant="contained" loading={loading}   >
                                        <span>disabled</span>
                                    </LoadingButton>
                                }

                                <Button variant="contained" onClick={goBack} sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>
                            </Box>
                            <Box sx={{ position: 'relative', marginTop: '20px', display: 'flex', flexDirection: 'column', alignContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
                                <Snackbar sx={{ position: 'relative' }} open={errorApi ? true : false} autoHideDuration={5000} onClose={handleClose} >
                                    <Alert onClose={handleClose} severity="error">{errorApi}</Alert>
                                </Snackbar>
                            </Box>
                        </Box>

                        {trip && (trip.imageFile?.length && trip.imageFile?.length > 0) ?

                            <ImageList sx={{ width: 520, height: 'auto', margin: '30px', '@media(max-width: 600px)': { width: 'auto', height: 'auto', margin: '5px' } }} cols={trip.imageFile.length > 3 ? 3 : trip.imageFile.length} rowHeight={trip.imageFile.length > 9 ? 164 : trip.imageFile.length > 5 ? 300 : trip.imageFile.length > 2 ? 350 : 450}>
                                {images ? images.map((item, i) => (
                                    <ImageListItem key={item} sx={{ margin: '10px', padding: '10px', '@media(max-width: 600px)': { width: 'auto', height: 'auto', margin: '1px', padding: '0 8px' } }}>
                                        <HighlightOffSharpIcon sx={{ cursor: 'pointer', position: 'absolute', backgroundColor: '#ffffff54', borderRadius: '50%' }} onClick={() => deleteImage(item)} id={item} />
                                        <img
                                            src={`https://storage.googleapis.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format`}
                                            srcSet={`https://storage.googleapis.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}

                                            alt={item}
                                            loading="lazy"
                                        />
                                    </ImageListItem>
                                )) : ''}
                            </ImageList> :
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <Typography variant="h6" margin='10px' maxWidth='95%' alignContent='center' alignItems="center">
                                    FOR THIS TRIP DON'T HAVE IMAGES
                                </Typography>
                            </Box>}
                    </Box>
                </Container>
            </Grid>
        </>
    )
}

export default TripEdit;