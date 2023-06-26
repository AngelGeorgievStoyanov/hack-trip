import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import React, { BaseSyntheticEvent, FC, useContext, useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { containerStyle, options } from "../settings";
import { IdType } from "../../shared/common-types";
import { Point, PointCreate } from "../../model/point";
import * as pointService from '../../services/pointService';
import { ApiPoint } from "../../services/pointService";
import PointList from "./PointList/PointList";
import { Box, Button, Container, Grid, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import FormInputText from "../FormFields/FormInputText";
import FormTextArea from "../FormFields/FormTextArea";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { LoginContext } from "../../App";
import LoadingButton from "@mui/lab/LoadingButton";
import imageCompression from "browser-image-compression";
import jwt_decode from "jwt-decode";
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import useMediaQuery from '@mui/material/useMediaQuery';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';
import * as tripService from '../../services/tripService';
import { Trip } from '../../model/trip';
import { ApiTrip } from '../../services/tripService';



type decode = {
    _id: string,
}


const API_POINT: ApiPoint<IdType, PointCreate> = new pointService.ApiPointImpl<IdType, PointCreate>('data/points');
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
    _ownerTripId: string;
    pointNumber: IdType;
    imageFile: string[] | undefined;
    _ownerId: string,


};


const libraries: ("drawing" | "geometry" | "localContext" | "places" | "visualization")[] = ["places"];


const schema = yup.object({
    name: yup.string().required().min(1).max(100).matches(/^(?!\s+$).*/, 'Name cannot be empty string.'),
    description: yup.string().matches(/^(?!\s+$).*/, 'Description cannot be empty string.').max(1050, 'Description max length is 1050 chars'),

}).required();

let userId: string | undefined;


const TripPoints: FC = () => {

    const points = useLoaderData() as Point[]

    const { userL } = useContext(LoginContext);

    const idTrip = useParams().tripId;
    const [fileSelected, setFileSelected] = React.useState<File[]>([]);
    const [errorMessageSearch, setErrorMessageSearch] = useState('');
    const [loading, setLoading] = useState<boolean>(true);
    const [buttonAdd, setButtonAdd] = useState<boolean>(true)
    const [errorMessageImage, setErrorMessageImage] = useState<string | undefined>();
    const [imageBackground, setImageBackground] = useState<string>()


    const isIphone = /\b(iPhone)\b/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent);
  
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(window.navigator.userAgent);

    const accessToken = userL?.accessToken ? userL.accessToken : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id;
    }



    const iconFotoCamera = useMediaQuery('(max-width:600px)');


    useEffect(() => {
        API_TRIP.backgroundImages().then((data) => {
            setImageBackground(data[Math.floor(Math.random() * data.length)])

        }).catch((err) => {
            console.log(err)
        });
    }, [])

    const { control, handleSubmit, reset, setValue, formState: { errors, isDirty, isValid } } = useForm<FormData>({


        defaultValues: {
            name: '', description: '', imageFile: []
        },
        mode: 'onChange',
        resolver: yupResolver(schema),
    });


    const [clickedPos, setClickedPos] = React.useState<google.maps.LatLngLiteral | undefined>({} as google.maps.LatLngLiteral);

    const navigate = useNavigate();
    const searchRef = React.useRef<HTMLInputElement | null>(null);

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

    const onMapClick = (e: google.maps.MapMouseEvent) => {


        if (e.latLng?.lat() !== undefined && (typeof (e.latLng?.lat()) === 'number')) {

            setClickedPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
    }



    const handleFilesChange = async (event: BaseSyntheticEvent) => {

        let files: File[] = Array.from(event.target.files);

        if (!files) return;
        if (files.length === 0) return

        while (files.some((x) => !x.name.match(/\.(jpg|jpeg|PNG|gif|JPEG|png|JPG|gif)$/))) {
            setErrorMessageImage('Please select valid file image');

            let index = files.findIndex((x: any) => {
                return !x.name.match(/\.(jpg|jpeg|PNG|gif|JPEG|png|JPG|gif)$/)
            })

            files.splice(index, 1)
        }

        if (files.length > 9) {
            files = files.slice(0, 9)
        }

        if (fileSelected.length > 0) {
            files = files.slice(0, 9 - fileSelected.length)
        }

        let indexSize: number = 0;
        let totalSize: number = 0;

        if (mobile) {
            files.map((x, i) => {
                totalSize += x.size;

                if (totalSize > 40000000 && indexSize === 0) {
                    indexSize = i - 1;
                }
            });

        }


        if (indexSize > 0) {
            files = files.slice(0, indexSize)

        }


        files.map(async (x: File) => {



            if (x.name.match(/\.(jpg|jpeg|PNG|gif|JPEG|png|JPG|gif)$/)) {

                if (x.size > 1000000) {

                    const options = {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true,
                        fileType: x.type,
                        name: !x.name ? 'IMG' + (Math.random() * 3).toString() :
                            x.name.split(/[,\s]+/).length > 1 ? x.name.split(/[,\s]+/)[0] + '.jpg' : x.name
                    }
                    try {
                        const compressedFile = await imageCompression(x, options)

                        let compressFile = new File([compressedFile], options.name, { type: x.type })

                        return setFileSelected(prev => [...prev, compressFile]);

                    } catch (err) {
                        console.log(err);
                    }
                } else {
                    const options = {
                        name: !x.name ? 'IMG' + (Math.random() * 3).toString() :
                            x.name.split(/[,\s]+/).length > 1 ? x.name.split(/[,\s]+/)[0] + '.jpg' : x.name
                    }
                    let file = new File([x], options.name, { type: x.type });

                    return setFileSelected(prev => [...prev, file]);
                }
            } else if (!x.name.match(/\.(jpg|jpeg|PNG|gif|JPEG|png|JPG|gif)$/)) {
                setErrorMessageImage('Please select valid file image');
                return
            }
        })


    }


    const searchInp = async (e: React.MouseEvent) => {

        let findAddress = '';
        const inpName = document.getElementById('inputAddPointName') as HTMLInputElement;
        const btnFind = e.target as HTMLElement;


        if (btnFind.textContent === 'FIND IN MAP') {
            findAddress = inpName.value;

        } else if (searchRef.current?.value === '') {
            setErrorMessageSearch('Plece enter location');
            return;

        } else {
            reset({
                name: '', description: '', lat: '', lng: '', _ownerTripId: ''
            });

            if (searchRef.current!.value.split(',').length > 1) {
                findAddress = searchRef.current!.value.split(',')[0];
                inpName.value = searchRef.current!.value.split(',')[0];
            } else if (searchRef.current!.value.split('-').length > 1) {
                findAddress = searchRef.current!.value.split('-')[0];
                inpName.value = searchRef.current!.value.split('-')[0];
            } else {
                findAddress = searchRef.current!.value;
                inpName.value = searchRef.current!.value;
            }

            setValue('name', searchRef.current!.value, { shouldValidate: true });

            setErrorMessageSearch('');
        }


        const geocode = new google.maps.Geocoder();

        try {
            const result = await geocode.geocode({
                address: findAddress
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

    const findInMap = (e: React.MouseEvent) => {

        searchInp(e);
    }



    const removeMarker = () => {
        setClickedPos(undefined);
        let inpName = document.getElementById('inputAddPointName') as HTMLInputElement;
        inpName.value = '';
        center = {
            lat: 42.697866831005435,
            lng: 23.321590139866355
        }
        zoom = 8;
    }




    if (!isLoaded) return <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh', '@media(max-width: 900px)': { display: 'flex', width: '100vw', padding: '0', margin: '0' } }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}><Typography sx={{ fontFamily: 'Space Mono, monospace' }} variant='h4'>MAP LOADING ...</Typography></Grid>



    const createTripSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {
        setButtonAdd(false)
        let formData = new FormData();


        if (fileSelected) {
            fileSelected.forEach((file) => {
                formData.append('file', file);
            }
            )
        }
        const imagesNames = await API_POINT.sendFile(formData).then((data) => {
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


        data.pointNumber = points.length + 1;


        if (clickedPos?.lat !== undefined) {
            data.lat = clickedPos.lat + '';
            data.lng = clickedPos.lng + '';
        }

        if (!data.lat) {
            setErrorMessageSearch('Plece enter exact name location or click in map');
            return;
        } else {
            setErrorMessageSearch('');
        }

        if (idTrip) {
            data._ownerTripId = idTrip;
        }

        data.name = data.name.trim();
        data.description = data.description.trim();
        if (userId !== null) {
            data._ownerId = userId + ''
        }


        const newPoint = { ...data } as PointCreate;


        if (newPoint.name.split(',').length > 1) {
            newPoint.name = newPoint.name.split(',')[0];
        } else if (newPoint.name.split('-').length > 1) {
            newPoint.name = newPoint.name.split('-')[0];
        }


        API_POINT.create(newPoint).then((point) => {
            setClickedPos(undefined);
            setButtonAdd(true)
            reset({ name: '', imageFile: [] });
            center = {
                lat: Number(point.lat),
                lng: Number(point.lng)
            }

            zoom = 8;

            setFileSelected([])
            navigate(`/trip/points/${idTrip}`);
        }).catch((err) => {
            console.log(err);
        });
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



    const MuiTooltipIconFotoCamera = () => {
        return (
            <Tooltip title='UPLOAD' arrow>
                <IconButton disabled={fileSelected.length >= 9 ? true : false} color="primary" aria-label="upload picture" component="label">
                    <input hidden accept="image/*" multiple type="file" onChange={handleFilesChange} />

                    <PhotoCamera fontSize="large" />
                </IconButton>
            </Tooltip>
        )
    }


    const MuiTooltipIconRemoveAll = () => {
        return (
            <Tooltip title='REMOVE ALL IMAGES' arrow>
                <DeleteForeverIcon color="primary" fontSize="large" onClick={onDeleteAllImage} />
            </Tooltip>
        )
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
                    <Box>
                        <PointList points={points} />

                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '100%' }}>

                        <Box sx={{ display: 'flex', maxWidth: '600px', border: 'solid 1px', boxShadow: '3px 2px 5px black', '@media(max-width: 920px)': { maxWidth: '97%' } }} >


                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                options={options as google.maps.MapOptions}
                                center={center}
                                zoom={zoom}
                                onLoad={onLoad}
                                onUnmount={onUnmount}
                                onClick={onMapClick}
                            >
                                {clickedPos?.lat ? <Marker position={clickedPos} animation={google.maps.Animation.DROP} draggable onDragEnd={dragMarker} /> : null}
                            </GoogleMap>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', margin: '10px', '@media(max-width: 900px)': { display: 'flex', flexDirection: 'column', alignItems: 'center' } }}>


                            <Autocomplete>
                                <TextField id="outlined-search" sx={{ backgroundColor: '#f2f1e58f', borderRadius: '5px' }} label="Search field" type="search" inputRef={searchRef} helperText={errorMessageSearch} />
                            </Autocomplete>
                            <Button variant="contained" onClick={searchInp} sx={{ ':hover': { background: '#4daf30' } }}>Search</Button>
                            <Button variant="contained" onClick={removeMarker} sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >Remove Marker</Button>
                        </Box>
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
                            onSubmit={handleSubmit(createTripSubmitHandler)}
                        >

                            <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h5">
                                ADD POINT
                            </Typography>
                            <span >
                                <FormInputText name='name' type="search" label='NEME OF CITY, PLACE, LANDMARK OR ANOTHER' control={control} error={errors.name?.message} id='inputAddPointName'
                                />
                            </span>
                            <Button variant="contained" onClick={findInMap} sx={{ ':hover': { background: '#4daf30' } }}>FIND IN MAP</Button>
                            <FormTextArea name="description" label="DESCRIPTION" control={control} error={errors.description?.message} multiline={true} rows={4} />


                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                {iconFotoCamera ?
                                    <MuiTooltipIconFotoCamera />
                                    :
                                    <Box sx={{ width: '30ch' }}>
                                        <Button variant="contained" component="label" disabled={fileSelected.length >= 9 ? true : false} >
                                            Upload
                                            <input hidden accept="image/*" multiple type="file" onChange={handleFilesChange} />

                                        </Button>
                                    </Box>
                                }
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
                                {iconFotoCamera ?
                                    <MuiTooltipIconRemoveAll />
                                    :
                                    <Box component='div' sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button variant="contained" onClick={onDeleteAllImage}>Remove all images</Button>
                                    </Box>
                                }


                            </> : ''}


                            <Box component='div' sx={{ display: 'flex', '@media(max-width: 600px)': { flexDirection: 'column', alignItems: 'center' } }}>

                                {buttonAdd === true ?
                                    <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }} disabled={!isDirty || !isValid}>ADD POINT</Button>
                                    : <LoadingButton variant="contained" loading={loading}   >
                                        <span>disabled</span>
                                    </LoadingButton>}

                                <Button component={Link} to={`/trip/details/${idTrip}`} variant="contained" sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Grid>
        </>
    )
};

export default TripPoints;


