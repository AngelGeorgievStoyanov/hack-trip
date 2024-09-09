import { useJsApiLoader, Autocomplete, } from "@react-google-maps/api";
import React, { BaseSyntheticEvent, FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiTrip } from "../../services/tripService";
import * as tripService from '../../services/tripService'
import { CurrencyCode, TripCreate, TripTipeOfGroup, TripTransport } from "../../model/trip";
import { IdType, toIsoDate, TripGroupId } from "../../shared/common-types";
import { Alert, Box, Button, ButtonGroup, Container, Grid, Snackbar, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import FormInputText from "../FormFields/FormInputText";
import FormInputSelect, { SelectOption } from "../FormFields/FormInputSelect";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import FormTextArea from "../FormFields/FormTextArea";
import LoadingButton from '@mui/lab/LoadingButton';
import jwt_decode from "jwt-decode";
import { LoginContext } from "../../hooks/LoginContext";
import { useContext } from 'react';
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';
import useMediaQuery from '@mui/material/useMediaQuery';
import GoogleMapWrapper from "../GoogleMapWrapper/GoogleMapWrapper";
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import CustomFileUploadButton from "../CustomFileUploadButton/CustomFileUploadButton ";
import { handleFilesChange } from "../../shared/handleFilesChange";
import RemoveAllImagesButton from "../RemoveAllImagesButton/RemoveAllImagesButton";

const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data');



const googleKey = process.env.REACT_APP_GOOGLE_KEY
const libraries: Array<"drawing" | "places" | "geometry"> = ["places"]



type FormData = {
    _ownerId: string;
    title: string;
    price: number | string | undefined;
    transport: string;
    countPeoples: number | string | undefined;
    typeOfPeople: string;
    destination: string;
    description: string;
    timeCreated: string | undefined;
    timeEdited?: string | undefined;
    lat: number | string | undefined;
    lng: number | string | undefined;
    imageFile: string[] | undefined;
    currency: string;
    dayNumber: number;
    tripGroupId?: string;
};

const TRIP_SELECT_OPTIONS_CURRENCY: SelectOption[] = Object.keys(CurrencyCode)
    .map(key => ({
        key: key,
        value: CurrencyCode[key as keyof typeof CurrencyCode]
    }));

const TRIP_SELECT_OPTIONS_TRANSPORT: SelectOption[] = Object.keys(TripTransport)
    .filter((item) => !isNaN(Number(item)))
    .map((ordinal: string) => parseInt(ordinal))
    .map((ordinal: number) => ({ key: ordinal, value: TripTransport[ordinal] }));

const TRIP_SELECT_OPTIONS_TYPE_GROUPE: SelectOption[] = Object.keys(TripTipeOfGroup)
    .filter((item) => !isNaN(Number(item)))
    .map((ordinal: string) => parseInt(ordinal))
    .map((ordinal: number) => ({ key: ordinal, value: TripTipeOfGroup[ordinal] }));

const schema = yup.object({
    title: yup.string().required().min(2).max(60).matches(/^(?!\s+$).*(\S{3})/, 'Title cannot be empty string and must contain at least 3 characters .'),
    price: yup.number().transform((value) => (isNaN(value) || value === null || value === undefined) ? 0 : value).required().min(0.0000000000000000000000000000001, 'Price must be positive').max(1000000),
    countPeoples: yup.number().transform((value) => (isNaN(value) || value === null || value === undefined) ? 0 : value).required().min(1, 'Count of people cannot be 0.').integer('Count of peoples must be intiger.').max(1000),
    destination: yup.string().required().min(3, 'Destination is required min length 3 chars.').max(60, 'Max length is 60 chars.').matches(/^(?!\s+$).*(\S{3})/, 'Destination cannot be empty string and must contain at least 3 characters .'),
    description: yup.string().max(1050, 'Description max length is 1050 chars').matches(/^(?!\s+$).*/, 'Description cannot be empty string.'),

}).required();


let center = {
    lat: 42.697866831005435,
    lng: 23.321590139866355
}


let zoom = 8;


type decode = {
    _id: string,
}

let _ownerId: string | undefined;


const CreateTrip: FC = () => {

    const [errorMessageSearch, setErrorMessageSearch] = useState('');
    const [clickedPos, setClickedPos] = React.useState<google.maps.LatLngLiteral | undefined>({} as google.maps.LatLngLiteral);
    const [fileSelected, setFileSelected] = React.useState<File[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [buttonAdd, setButtonAdd] = useState<boolean>(true)
    const [errorMessageImage, setErrorMessageImage] = useState<string | undefined>();
    const { token } = useContext(LoginContext);
    const [imageBackground, setImageBackground] = useState<string>()
    const [errorApi, setErrorApi] = useState<string>();
    const [dayNumber, setDayNumber] = useState(1);
    const [missingDays, setMissingDays] = useState<number[]>([]);
    const [tripGroup, setTripGroup] = useState<TripGroupId[]>([]);


    const { tripGroupId } = useParams();
    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        _ownerId = decode._id;

    }

    const iconFotoCamera = useMediaQuery('(max-width:600px)');


    useEffect(() => {
        API_TRIP.backgroundImages().then((data) => {
            setImageBackground(data[Math.floor(Math.random() * data.length)])

        }).catch((err) => {
            console.log(err)
        });


        if (tripGroupId && accessToken) {

            API_TRIP.findByTripGroupId(tripGroupId, accessToken).then((data) => {
                setDayNumber(data[0].dayNumber + 1)
                const sortedTripGroup = [...data].sort((a, b) => a.dayNumber - b.dayNumber);

                setMissingDays(findMissingDays(sortedTripGroup));
                setTripGroup(sortedTripGroup)
            }).catch((err) => {
                console.log(err)
            });

        }
    }, [])


    const findMissingDays = (sortedTripGroup: TripGroupId[]) => {
        const missingDays = [];
        for (let i = 1; i < sortedTripGroup.length; i++) {
            const currentDay = sortedTripGroup[i - 1].dayNumber;
            const nextDay = sortedTripGroup[i].dayNumber;
            for (let j = currentDay + 1; j < nextDay; j++) {
                missingDays.push(j);
            }
        }
        return missingDays;
    }


    const { control, handleSubmit, formState: { errors, isValid, isDirty }, reset } = useForm<FormData>({


        defaultValues: {
            title: '', _ownerId: '', countPeoples: '', timeCreated: '', lat: '', lng: '',
            timeEdited: '', typeOfPeople: TripTipeOfGroup["Another type"] + '', description: '', destination: '',
            price: '', transport: TripTransport["Another type"] + '', imageFile: [], currency: CurrencyCode.EUR
        },
        mode: 'onChange',
        resolver: yupResolver(schema),
    });


    const navigate = useNavigate();
    const searchRef = React.useRef<HTMLInputElement | null>(null);



    const handleCreateTripFilesChange = (event: BaseSyntheticEvent) => {
        handleFilesChange(event, fileSelected, setFileSelected, setErrorMessageImage);
    };

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',

        googleMapsApiKey: googleKey!,
        libraries,
    })


    const mapRef = React.useRef<google.maps.Map | null>(null)

    const onLoad = (map: google.maps.Map): void => {
        mapRef.current = map;
    }

    const onUnmount = (): void => {
        mapRef.current = null;
    }

    const onMapClick = (e: google.maps.MapMouseEvent) => {

        if (e.latLng?.lat() !== undefined && (typeof (e.latLng?.lat()) === 'number')) {

            setClickedPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
    }



    const searchInp = async () => {

        if (!searchRef.current?.value) {

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
                zoom = 16
                center = { lat: result.results[0].geometry.location.lat(), lng: result.results[0].geometry.location.lng() }
                setClickedPos({ lat: result.results[0].geometry.location.lat(), lng: result.results[0].geometry.location.lng() })

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
        center = {
            lat: 42.697866831005435,
            lng: 23.321590139866355
        }
        zoom = 8;
    }




    if (!isLoaded) return <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh', '@media(max-width: 900px)': { display: 'flex', width: '100vw', padding: '0', margin: '0' } }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}><Typography sx={{ fontFamily: 'Space Mono, monospace' }} variant='h4'>MAP LOADING ...</Typography></Grid>






    const createTripSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined, addPoints?: boolean, nextDayTrip?: boolean) => {
        if (accessToken) {
            setButtonAdd(false)
            event?.preventDefault();

            let formData = new FormData();

            let imagesNames;

            if (fileSelected && fileSelected.length > 0) {

                fileSelected.forEach((file) => {
                    formData.append('file', file);
                }
                );


                imagesNames = await API_TRIP.sendFile(formData, accessToken).then((data) => {
                    let imageName = data as unknown as any as any[];
                    return imageName.map((x) => {
                        return x.destination;
                    })
                }).catch((err) => {
                    console.log(err);
                });

                if (imagesNames) {
                    data.imageFile = imagesNames;
                }
            }

            if (clickedPos) {
                data.lat = clickedPos.lat;
                data.lng = clickedPos.lng;
            }


            if (_ownerId) {
                data._ownerId = _ownerId;
            }

            data.title = data.title.trim();
            data.destination = data.destination.trim();
            data.description = data.description.trim();

            data.timeCreated = toIsoDate(new Date());
            data.typeOfPeople = TripTipeOfGroup[parseInt(data.typeOfPeople)];
            data.transport = TripTransport[parseInt(data.transport)];
            if (dayNumber) {
                data.dayNumber = dayNumber
            }
            if (tripGroupId) {
                data.tripGroupId = tripGroupId
            }
            const newTrip = { ...data } as any as TripCreate;


            API_TRIP.create(newTrip, accessToken).then((trip) => {
                setButtonAdd(true)
                if (addPoints === true) {
                    navigate(`/trip/points/${trip._id}`);

                } else if (nextDayTrip) {

                    reset();
                    API_TRIP.findByTripGroupId(trip.tripGroupId, accessToken).then((data) => {

                        setDayNumber(data[0].dayNumber + 1)
                        const sortedTripGroup = [...data].sort((a, b) => a.dayNumber - b.dayNumber);
                        setMissingDays(findMissingDays(sortedTripGroup));
                        setFileSelected([]);
                        setTripGroup(sortedTripGroup);

                    }).catch((err) => {
                        console.log(err.message)
                    })
                } else {

                    navigate(`/trip/details/${trip._id}`);
                }



            }).catch((err) => {
                console.log(typeof err === 'string' ? err : typeof err.message === 'string' ? err.message : 'Something went wrong!');
                setErrorApi(err && typeof err === 'string' ? err : typeof err.message === 'string' ? err.message : 'Something went wrong!');

                setLoading(false);
                setButtonAdd(true);
            })
        }
    }


    const addPoints = (e: React.MouseEvent) => {
        e.preventDefault();


        const target = e.currentTarget.parentElement?.parentElement as HTMLFormElement;
        const data = Object.fromEntries(new FormData(target)) as any as FormData;

        e as any as BaseSyntheticEvent<HTMLFormElement>

        createTripSubmitHandler(data, e, true);

    }

    const addNextDay = (e: React.MouseEvent) => {
        e.preventDefault();


        const target = e.currentTarget.parentElement?.parentElement as HTMLFormElement;
        const data = Object.fromEntries(new FormData(target)) as any as FormData;

        e as any as BaseSyntheticEvent<HTMLFormElement>

        createTripSubmitHandler(data, e, false, true);

    }

    const dragMarker = (e: google.maps.MapMouseEvent) => {

        if (e.latLng?.lat() !== undefined && (typeof (e.latLng?.lat()) === 'number')) {

            setClickedPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
    }

    const onDeleteImage = (event: BaseSyntheticEvent) => {



        let index = fileSelected.findIndex(x => {
            return x.name === event.currentTarget.id
        })

        fileSelected.splice(index, 1)

        setFileSelected([...fileSelected])
    }


    if (errorMessageImage) {

        setTimeout(() => {
            setErrorMessageImage(undefined)
        }, 5000)


    }

    const onDeleteAllImage = () => {
        setFileSelected([])
    }



    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setErrorApi(undefined);
    };


    const increaseDayNumber = () => {
        const day = dayNumber + 1;
        setDayNumber(day);
        checkDay(day);
        if (errorApi) {
            setErrorApi(undefined);
        }
    };

    const decreaseDayNumber = () => {
        const day = Math.max(dayNumber - 1, 1);
        setDayNumber(day);
        checkDay(day);
        if (errorApi) {
            setErrorApi(undefined);
        }
    };


    const handleCloseMissingDays = () => {
        setMissingDays([]);
    }

    const checkDay = (dayNumberNow: number) => {

        if (tripGroup.some((x) => x.dayNumber === dayNumberNow)) {
            setErrorApi(`Day ${dayNumberNow} alredi exists`);
        }
    }


    return (
        <>

            <Grid container sx={{
                backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",
                backgroundAttachment: 'fixed', justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh',
                '@media(max-width: 900px)': { display: 'flex', width: '100vw', padding: '0', margin: '-25px 0px 0px 0px' }
            }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <div>
                    {missingDays.length > 0 && (
                        <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'left' }} open={missingDays.length > 0 ? true : false} autoHideDuration={10000} onClose={handleCloseMissingDays} >
                            <Alert severity="info" onClose={handleCloseMissingDays}>
                                Missing day(s): {missingDays.join(', ')}
                            </Alert>
                        </Snackbar>
                    )}
                </div>
                <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>

                    <GoogleMapWrapper
                        center={center}
                        zoom={zoom}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        onMapClick={onMapClick}
                        dragMarker={dragMarker}
                        clickedPos={clickedPos}
                    />

                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', margin: '10px', '@media(max-width: 900px)': { display: 'flex', flexDirection: 'column', alignItems: 'center' } }}>


                        <Autocomplete>
                            <TextField id="outlined-search" sx={{ backgroundColor: '#f2f1e58f', borderRadius: '5px', margin: '2px' }} label="Search field" type="search" inputRef={searchRef} helperText={errorMessageSearch} />

                        </Autocomplete>

                        <Button variant="contained" onClick={searchInp} sx={{ ':hover': { background: '#4daf30' }, margin: '2px' }}>Search</Button>

                        <Button variant="contained" onClick={removeMarker} sx={{ ':hover': { color: 'rgb(248 245 245)' }, margin: '2px', background: 'rgb(194 194 224)', color: 'black' }}  >Remove Marker</Button>


                    </Box>

                    <Box component='form'
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            width: 'fit-content',
                            height: 'fit-content',
                            padding: '30px',
                            backgroundColor: '#eee7e79e',
                            boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px',
                            '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },
                            '& .MuiButton-root': { m: 1 },
                            marginBottom: '5px'
                        }}
                        encType="multipart/form-data"
                        method="post"
                        noValidate
                        autoComplete='0ff'
                        onSubmit={handleSubmit(createTripSubmitHandler)}
                    >

                        <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h5">
                            CREATE TRIP
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>

                            <TextField
                                name="dayNumber"
                                label="DAY"
                                value={dayNumber}
                                size="small"
                                sx={{ maxWidth: '60px', marginRight: '8px', pointerEvents: 'none' }}
                                inputProps={{ style: { textAlign: 'center' } }}
                            />
                            <ButtonGroup
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
                            options={TRIP_SELECT_OPTIONS_TRANSPORT} defaultOptionIndex={1} />
                        <FormInputText name='countPeoples' type="number" label='COUNT OF PEOPLE' control={control} error={errors.countPeoples?.message}
                        />
                        <FormInputSelect name='typeOfPeople' label='TYPE OF THE GROUP' control={control} error={errors.typeOfPeople?.message}
                            options={TRIP_SELECT_OPTIONS_TYPE_GROUPE} defaultOptionIndex={1} />

                        <FormInputText name='destination' label='DESTINATION' control={control} error={errors.destination?.message}
                        />

                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                            <CustomFileUploadButton handleFilesChange={handleCreateTripFilesChange} images={[]} fileSelected={fileSelected} iconFotoCamera={iconFotoCamera} />

                            <Typography variant="overline" display="block" gutterBottom style={{ marginRight: '15px' }}>     {fileSelected.length}/9 uploaded images</Typography>
                        </Box >
                        {fileSelected.length === 9 ? <Typography style={{ color: 'red', marginLeft: '12px' }}>9 images are the maximum number to upload.</Typography> : ''}
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
                                <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }} disabled={(tripGroup.some((x) => x.dayNumber === dayNumber)) || (!isDirty || !isValid)}>ADD TRIP</Button>
                                : <LoadingButton variant="contained" loading={loading}   >
                                    <span>disabled</span>
                                </LoadingButton>
                            }
                            {buttonAdd === true ?
                                <Button variant="contained" onClick={addNextDay} sx={{ ':hover': { background: '#4daf30' } }} disabled={(tripGroup.some((x) => x.dayNumber === dayNumber)) || (!isDirty || !isValid)}>ADD NEXT DAY TRIP</Button>
                                : <LoadingButton variant="contained" loading={loading}   >
                                    <span>disabled</span>
                                </LoadingButton>
                            }
                            {buttonAdd === true ?

                                <Button variant="contained" disabled={!isValid} onClick={addPoints} sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}>ADD POINT`S FOR THE TRIP</Button>
                                : <LoadingButton variant="contained" loading={loading}   >
                                    <span>disabled</span>
                                </LoadingButton>
                            }
                        </Box>
                        <Box sx={{ position: 'relative', marginTop: '20px', display: 'flex', flexDirection: 'column', alignContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
                            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'left' }} open={errorApi ? true : false} autoHideDuration={5000} onClose={handleClose} >
                                <Alert onClose={handleClose} severity="error">{errorApi}</Alert>
                            </Snackbar>
                        </Box>
                    </Box>
                </Container>
            </Grid>
        </>
    )
};

export default CreateTrip;


