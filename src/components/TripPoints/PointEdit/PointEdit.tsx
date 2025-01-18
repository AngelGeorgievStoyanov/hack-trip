import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import React, { BaseSyntheticEvent, FC, useContext, useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Point } from "../../../model/point";
import { IdType } from "../../../shared/common-types";
import * as pointService from '../../../services/pointService';
import { ApiPoint } from "../../../services/pointService";
import { Alert, Box, Button, Container, Grid, ImageList, ImageListItem, Snackbar, TextField, Typography } from "@mui/material";
import FormInputText from "../../FormFields/FormInputText";
import { useForm } from "react-hook-form";
import FormTextArea from "../../FormFields/FormTextArea";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';
import useMediaQuery from '@mui/material/useMediaQuery';
import { LoginContext } from "../../../hooks/LoginContext";
import jwt_decode from "jwt-decode";
import { ApiTrip } from "../../../services/tripService";
import * as tripService from "../../../services/tripService";
import { TripCreate } from "../../../model/trip";
import GoogleMapWrapper from "../../GoogleMapWrapper/GoogleMapWrapper";
import CustomFileUploadButton from "../../CustomFileUploadButton/CustomFileUploadButton ";
import { handleFilesChange } from "../../../shared/handleFilesChange";
import RemoveAllImagesButton from "../../RemoveAllImagesButton/RemoveAllImagesButton";
import { useConfirm } from "../../ConfirmDialog/ConfirmDialog";
import LoadingButtonWrapper from "../../LoadingButtonWrapper/LoadingButtonWrapper";


let zoom = 8;
let center = {
    lat: 42.697866831005435,
    lng: 23.321590139866355
}


type decode = {
    _id: string,

}

const API_POINT: ApiPoint<IdType, Point> = new pointService.ApiPointImpl<IdType, Point>('data/points');
const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data');

const libraries: Array<"drawing" | "places" | "geometry"> = ["places"]
const googleKey = process.env.REACT_APP_GOOGLE_KEY;


type FormData = {
    name: string;
    description: string;
    lat: string;
    lng: string;
    pointNumber: IdType;
    imageFile: string[] | undefined;
    _ownerId?: string;
};

const schema = yup.object({
    name: yup.string().required().min(1).max(50).matches(/^(?!\s+$).*/, 'Name cannot be empty string.'),
    description: yup.string().matches(/^(?!\s+$).*/, 'Description cannot be empty string.').max(1050, 'Description max length is 1050 chars'),

}).required();


let userId: string | undefined;



const PointEdit: FC = () => {


    const point = useLoaderData() as Point;

    const [clickedPos, setClickedPos] = React.useState<google.maps.LatLngLiteral | undefined>({} as google.maps.LatLngLiteral);
    const [initialPoint, setInitialPoint] = React.useState<google.maps.LatLngLiteral>({ lat: Number(point.lat), lng: Number(point.lng) } as google.maps.LatLngLiteral);
    const [visible, setVisible] = React.useState(true);
    const [errorMessageSearch, setErrorMessageSearch] = useState('');
    const [images, setImages] = useState<string[]>();
    const [fileSelected, setFileSelected] = React.useState<File[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [buttonAdd, setButtonAdd] = useState<boolean>(true)
    const [errorMessageImage, setErrorMessageImage] = useState<string | undefined>();
    const [imageBackground, setImageBackground] = useState<string>()
    const [errorApi, setErrorApi] = useState<string>();

    const { confirm } = useConfirm();

    const { token } = useContext(LoginContext);

    const isIphone = /\b(iPhone)\b/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent);


    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined


    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id;

    }


    useEffect(() => {
        if (userId && accessToken) {

            API_POINT.findByPointId(point._id, accessToken).then((data) => {
                setImages(data.imageFile);
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


    const iconFotoCamera = useMediaQuery('(max-width:600px)');


    const { control, handleSubmit, reset, setValue, formState: { errors, isDirty, isValid } } = useForm<FormData>({


        defaultValues: {
            name: point.name, description: point.description,
            pointNumber: Number(point.pointNumber)
        },
        mode: 'onChange',
        resolver: yupResolver(schema),
    });

    let positionPoint
    if (point.lng !== 'undefined' && point.lat !== 'undefined' && (clickedPos?.lat === undefined)) {

        positionPoint = { lat: Number(point.lat), lng: Number(point.lng) }
        center = { lat: Number(point.lat), lng: Number(point.lng) }
    }

    const navigate = useNavigate();

    const searchRef = React.useRef<HTMLInputElement | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',

        googleMapsApiKey: googleKey!,
        libraries,
    });


    const mapRef = React.useRef<google.maps.Map | null>(null);

    const onLoad = (map: google.maps.Map): void => {
        mapRef.current = map

    }

    const onUnmount = (): void => {
        mapRef.current = null
    }

    const onMapClick = (e: google.maps.MapMouseEvent) => {

        if (e.latLng?.lat() !== undefined && (typeof (e.latLng?.lat()) === 'number')) {
            setClickedPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            setVisible(true);
            setInitialPoint({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
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
            reset({ name: '' });
            findAddress = searchRef.current!.value;
            inpName.value = searchRef.current!.value;

            setValue('name', searchRef.current!.value, { shouldValidate: true });
            setErrorMessageSearch('');

        }

        const geocode = new google.maps.Geocoder();

        try {

            const result = await geocode.geocode({
                address: findAddress
            });


            if (result) {
                let searchPosition = { lat: result.results[0].geometry.location.lat(), lng: result.results[0].geometry.location.lng() }
                zoom = 12;
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

    const findInMap = (e: React.MouseEvent) => {

        searchInp(e);
    }


    const removeMarker = () => {
        setClickedPos(undefined);
        setVisible(false);

        let inpName = document.getElementById('inputAddPointName') as HTMLInputElement;
        inpName.value = '';
        center = {
            lat: 42.697866831005435,
            lng: 23.321590139866355
        }
        zoom = 8;
    }


    if (!isLoaded) return <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh', '@media(max-width: 900px)': { display: 'flex', width: '100vw', padding: '0', margin: '0' } }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}><Typography sx={{ fontFamily: 'Space Mono, monospace' }} variant='h4'>MAP LOADING ...</Typography></Grid>


    const handleEditTripFilesChange = (event: BaseSyntheticEvent) => {
        handleFilesChange(event, fileSelected, setFileSelected, setErrorMessageImage, images?.length || 0);
    };


    const editPointSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {
        if (accessToken) {


            setButtonAdd(false)
            let formData = new FormData();

            let imagesNames;
            if (fileSelected && fileSelected.length > 0) {
                fileSelected.forEach((file) => {
                    formData.append('file', file);
                });


                imagesNames = await API_POINT.sendFile(formData, accessToken).then((data) => {

                    return data
                }).catch((err) => {
                    console.log(err);
                    setErrorApi(err.message && typeof err.message === 'string' ? err.message : 'Something went wrong!');
                    setLoading(false);
                    setButtonAdd(true);
                });
            }


            if (imagesNames !== undefined && imagesNames.length > 0) {
                data.imageFile = images?.concat(imagesNames);
            } else {
                data.imageFile = images;
            }

            data.lat = point.lat;
            data.lng = point.lng;
            if (clickedPos?.lat !== undefined) {
                data.lat = clickedPos.lat + '';
                data.lng = clickedPos.lng + '';
            }

            if (!data.lat) {
                setErrorMessageSearch('Plece enter exact name location or click in map');
                setErrorApi('Plece enter exact name location or click in map');
                setLoading(false);
                setButtonAdd(true);
                return;
            } else {
                setErrorMessageSearch('');
            }

            data.pointNumber = point.pointNumber;
            data.name = data.name.trim();
            data.description = data.description.trim();
            data._ownerId = userId;

            const editedPoint = { ...data } as Point;


            if (editedPoint.name.split(',').length > 1) {
                editedPoint.name = editedPoint.name.split(',')[0];

            } else if (editedPoint.name.split(' - ').length > 1) {
                editedPoint.name = editedPoint.name.split(' - ')[0];
            }

            API_POINT.update(point._id, editedPoint, accessToken).then((point) => {
                setButtonAdd(true)

                navigate(`/trip/points/${point._ownerTripId}`);

            }).catch((err) => {
                console.log(err.message && typeof err.message === 'string' ? err.message : 'Something went wrong!')
                setErrorApi(err.message && typeof err.message === 'string' ? err.message : 'Something went wrong!');
                setLoading(false);
                setButtonAdd(true);
            });
        }
    }


    const goBack = () => {
        navigate(-1);
    }


    const deleteImage = async (item: string) => {
        if (accessToken) {
            const result = await confirm('Are you sure you want to delete this image?', 'Delete Confirmation');
            if (result) {
                const index = images?.indexOf(item);
                if (index !== undefined) {
                    const deletedImage = images?.slice(index, index + 1);

                    if (deletedImage) {

                        API_POINT.editImages(point._id, deletedImage, accessToken).then((data) => {
                            setImages(data.imageFile);
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

    return (

        <>
            <Grid container sx={!isIphone ?
                {
                    backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",
                    backgroundAttachment: 'fixed', justifyContent: 'center', bgcolor: '#cfe8fc', padding: '15px 0',
                    minHeight: '100vh', margin: '0px', width: '100vw',
                    '@media(max-width: 1000px)': { width: '100vw', padding: '15px 0px', margin: '-25px 0px 0px -1px' }
                }
                :
                {
                    backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                    backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",
                    justifyContent: 'center',
                    bgcolor: '#cfe8fc', height: '100vh', overflow: 'scroll', margin: '-25px 0px 0px -1px', padding: '0px 0px 0px 13px',
                    '@media(max-width: 1000px)': { width: '100vw', padding: '15px 0px', margin: '-25px 0px 0px -1px' }

                }
            } spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '0px' }}>

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
                    />

                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', margin: '10px', '@media(max-width: 600px)': { display: 'flex', flexDirection: 'column', alignItems: 'center' } }}>


                        <Autocomplete>
                            <TextField id="outlined-search" sx={{ backgroundColor: '#f2f1e58f', borderRadius: '5px', margin: '2px' }} label="Search field" type="search" inputRef={searchRef} helperText={errorMessageSearch} />
                        </Autocomplete>
                        <Button variant="contained" onClick={searchInp} sx={{ ':hover': { background: '#4daf30' }, margin: '2px' }}>Search</Button>
                        <Button variant="contained" onClick={removeMarker} sx={{ ':hover': { color: 'rgb(248 245 245)' }, margin: '2px', background: 'rgb(194 194 224)', color: 'black' }}  >Remove Marker</Button>
                    </Box>

                    <Box component='div' sx={{
                        display: 'flex', flexDirection: 'row', justifyContent: 'space-around', minHeight: '100vh', '@media(max-width: 1020px)': {
                            display: 'flex', flexDirection: 'column-reverse', width: '100vw', alignItems: 'center'
                        }
                    }}>
                        <Box>
                            <Box sx={{ position: 'relative', marginTop: '20px', display: 'flex', flexDirection: 'column', alignContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
                                <Snackbar sx={{ position: 'relative', left: '0px', right: '0px' }} open={errorApi ? true : false} autoHideDuration={5000} onClose={handleClose} >
                                    <Alert onClose={handleClose} severity="error">{errorApi}</Alert>
                                </Snackbar>
                            </Box>
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
                                autoComplete="off"
                                onSubmit={handleSubmit(editPointSubmitHandler)}
                            >
                                <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h4">
                                    EDIT POINT
                                </Typography>
                                <span >
                                    <FormInputText name='name' type="search" label='NAME OF CITY,PLACE,LANDMARK OR ANOTHER' control={control} error={errors.name?.message} id='inputAddPointName'
                                    />
                                </span>
                                <Button variant="contained" onClick={findInMap} sx={{ ':hover': { background: '#4daf30' } }}>FIND IN MAP</Button>
                                <FormTextArea name="description" label="DESCRIPTION" control={control} error={errors.description?.message} multiline={true} rows={4} />

                                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                                    <CustomFileUploadButton handleFilesChange={handleEditTripFilesChange} images={images || []} fileSelected={fileSelected} iconFotoCamera={iconFotoCamera} disabled={!buttonAdd} />

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
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                                    {buttonAdd === true ?
                                        <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }} disabled={(fileSelected.length > 0 ? false : (!isDirty || !isValid))}>EDIT POINT</Button>
                                        : <LoadingButtonWrapper loading={loading}>
                                            <span>disabled</span>
                                        </LoadingButtonWrapper>}
                                    <Button onClick={goBack} variant="contained" sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>
                                </Box>
                            </Box>
                        </Box>

                        {(point.imageFile?.length && point.imageFile?.length > 0) ?

                            <ImageList sx={{ width: 520, height: 'auto', margin: '20px', '@media(max-width: 600px)': { width: 'auto', height: 'auto', margin: '5px' } }} cols={point.imageFile.length > 3 ? 3 : point.imageFile.length} rowHeight={point.imageFile.length > 9 ? 164 : point.imageFile.length > 5 ? 300 : point.imageFile.length > 2 ? 350 : 450}>
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
                                    FOR THIS POINT DON'T HAVE IMAGES
                                </Typography>
                            </Box>
                        }
                    </Box>
                </Container>
            </Grid>
        </>
    )
}


export default PointEdit;