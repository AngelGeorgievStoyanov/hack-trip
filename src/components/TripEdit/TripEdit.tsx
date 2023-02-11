import { useLoaderData, useNavigate } from "react-router-dom";
import { Trip, TripTipeOfGroup, TripTransport } from "../../model/trip";
import { IdType, toIsoDate } from "../../shared/common-types";
import * as tripService from '../../services/tripService';
import { ApiTrip } from "../../services/tripService";
import { Autocomplete, GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import React, { BaseSyntheticEvent, useEffect, useState } from "react";
import { containerStyle, options } from "../settings";
import { Box, Button, CardMedia, Container, Grid, ImageList, ImageListItem, TextField, Typography } from "@mui/material";
import FormInputText from "../FormFields/FormInputText";
import FormInputSelect, { SelectOption } from "../FormFields/FormInputSelect";
import FormTextArea from "../FormFields/FormTextArea";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from "react-hook-form";
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';
import FileUpload from "react-mui-fileuploader";
import LoadingButton from "@mui/lab/LoadingButton";



const googleKey = process.env.REACT_APP_GOOGLE_KEY;
const libraries: ("drawing" | "geometry" | "localContext" | "places" | "visualization")[] = ["places"];

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

};
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
    price: yup.number().min(0.1, 'Price must be positive').max(1000000),
    countPeoples: yup.number().min(1, 'Count of people cannot be 0.').integer('Count of peoples must be intiger.').max(1000),
    destination: yup.string().required().min(3, 'Destination is required min length 3 chars.').max(60, 'Max length is 60 chars.').matches(/^(?!\s+$).*(\S{3})/, 'Destination cannot be empty string and must contain at least 3 characters .'),
    description: yup.string().max(1050, 'Description max length is 1050 chars').matches(/^(?!\s+$).*/, 'Description cannot be empty string.'),

}).required();




export default function TripEdit() {

    const trip = useLoaderData() as Trip;

    const [images, setImages] = useState<string[]>();
    const [clickedPos, setClickedPos] = React.useState<google.maps.LatLngLiteral | undefined>({} as google.maps.LatLngLiteral);
    const [initialPoint, setInitialPoint] = React.useState<google.maps.LatLngLiteral>({ lat: Number(trip.lat), lng: Number(trip.lng) } as google.maps.LatLngLiteral);
    const [fileSelected, setFileSelected] = React.useState<File[]>([]);
    const [errorMessageSearch, setErrorMessageSearch] = useState('');
    const [visible, setVisible] = React.useState(true);
    const [loading, setLoading] = useState<boolean>(true);
    const [buttonAdd, setButtonAdd] = useState<boolean>(true)

    let positionPoint;


    useEffect(() => {
        API_TRIP.findById(trip._id).then((data) => {
            setImages(data.imageFile);
        }).catch((err) => console.log(err));
    }, []);

    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({


        defaultValues: {
            title: trip.title, _ownerId: trip._ownerId, countPeoples: +trip.countPeoples,
            timeCreated: trip.timeCreated,
            lat: (trip.lat !== undefined && trip.lat !== null) ? Number(trip.lat) : undefined,
            lng: (trip.lng !== undefined && trip.lng !== null) ? Number(trip.lng) : undefined,
            timeEdited: trip.timeEdited, typeOfPeople: TripTipeOfGroup[trip.typeOfPeople],
            description: trip.description, destination: trip.destination,
            price: +trip.price, transport: TripTransport[trip.transport],
            imageFile: trip.imageFile
        },
        mode: 'onChange',
        resolver: yupResolver(schema),
    });




    if ((trip.lng !== undefined && trip.lng !== null) && (trip.lat !== undefined && trip.lat !== null) && (clickedPos?.lat === undefined)) {

        positionPoint = { lat: Number(trip.lat), lng: Number(trip.lng) }
        center = { lat: Number(trip.lat), lng: Number(trip.lng) }
    }


    const searchRef = React.useRef<HTMLInputElement | null>(null);

    const navigate = useNavigate();

    const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data/trips');

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',

        googleMapsApiKey: googleKey!,
        libraries,
    });


    const handleFilesChange = (files: any) => {

        if (!files) return;

        setFileSelected([...files]);

    };


    const mapRef = React.useRef<google.maps.Map | null>(null);

    const onLoad = (map: google.maps.Map): void => {
        mapRef.current = map;
    }

    const onUnmount = (): void => {
        mapRef.current = null;
    }


    const onMapClick = async (e: google.maps.MapMouseEvent) => {

        if (e.latLng?.lat() !== undefined && (typeof (e.latLng?.lat()) === 'number') && (e.latLng?.lat() !== null)) {
            setClickedPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            setVisible(true);
            setInitialPoint({ lat: e.latLng.lat(), lng: e.latLng.lng() });
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

        } catch (error: any) {

            setErrorMessageSearch('Plece enter exact name location or choose from suggestions');

            console.log(error.message);
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





    if (!isLoaded) return <div>MAP LOADING ...</div>


    const editTripSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {
        setButtonAdd(false)
        let formData = new FormData();


        if (fileSelected) {
            fileSelected.forEach((file) => {
                formData.append('file', file);
            });
        }


        let imagesNames = await API_TRIP.sendFile(formData).then((data) => {
            let imageName = data as unknown as any as any[] | [];
            return imageName.map((x) => {
                return x.destination;
            })
        }).catch((err) => {
            console.log(err);
        });


        let imagesNew = imagesNames as unknown as any as string[];

        if (imagesNew.length > 0) {
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
        const editTrip = { ...data } as any;

        editTrip.id = trip._id as any as Trip;

        API_TRIP.update(trip._id, editTrip).then((data) => {
            setButtonAdd(true)
            navigate(`/trip/details/${trip._id}`);
        }).catch((err) => {
            console.log(err);
        });
    }

    const goBack = () => {
        navigate(-1);
    }





    const deleteImage = (e: React.MouseEvent) => {

        const index = images?.indexOf(e.currentTarget.id);
        if (index !== undefined) {
            const deletedImage = images?.slice(index, index + 1);
            if (deletedImage) {
                API_TRIP.editImages(trip._id, deletedImage).then((data) => {
                    setImages(data.imageFile);
                }).catch((err) => {
                    console.log(err);
                });
            }
        }
    }


    const dragMarker = (e: google.maps.MapMouseEvent) => {
        if (e.latLng?.lat() !== undefined && (typeof (e.latLng?.lat()) === 'number')) {
            setClickedPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
    }



    return (
        <>
            <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
                    <Box sx={{ display: 'flex', maxWidth: '600px', '@media(max-width: 600px)': { maxWidth: '97%' } }} >
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            options={options as google.maps.MapOptions}
                            center={center}
                            zoom={zoom}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                            onClick={onMapClick}
                        >
                            {positionPoint?.lat ? <MarkerF visible={visible} animation={google.maps.Animation.DROP} position={initialPoint} draggable onDragEnd={dragMarker} /> :
                                clickedPos?.lat ? <MarkerF animation={google.maps.Animation.DROP} visible={visible} position={clickedPos} draggable onDragEnd={dragMarker} /> : null}

                        </GoogleMap>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', margin: '10px', minWidth: '500px', '@media(max-width: 600px)': { display: 'flex', flexDirection: 'column', alignItems: 'center' } }}>

                        <Autocomplete>
                            <TextField id="outlined-search" label="Search field" type="search" inputRef={searchRef} helperText={errorMessageSearch} />

                        </Autocomplete>

                        <Button variant="contained" onClick={searchInp} sx={{ ':hover': { background: '#4daf30' } }}>Search</Button>
                        <Button variant="contained" onClick={removeMarker} sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >Remove Marker</Button>

                    </Box>
                    <Box component='div' sx={{
                        display: 'flex', flexDirection: 'row', justifyContent: 'space-around', minHeight: '100vh', '@media(max-width: 600px)': {
                            display: 'flex', flexDirection: 'column-reverse', width: '100vw'
                        }
                    }}>
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
                                backgroundColor: '#8d868670',
                                boxShadow: '3px 2px 5px black', border: 'solid 2px', borderRadius: '12px',
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

                            <FormInputText name='title' label='TITLE' control={control} error={errors.title?.message}
                            />
                            <FormInputText name='price' label='PRICE' type="number" control={control} error={errors.price?.message}
                            />
                            <FormInputSelect name='transport' label='TRANSPORT' control={control} error={errors.transport?.message}
                                options={TRIP_SELECT_OPTIONS_TRANSPORT} defaultOptionIndex={1} />

                            <FormInputText name='countPeoples' type="number" label='COUNT OF PEOPLE' control={control} error={errors.countPeoples?.message}
                            />

                            <FormInputSelect name='typeOfPeople' label='TYPE OF THE GROUP' control={control} error={errors.typeOfPeople?.message}
                                options={TRIP_SELECT_OPTIONS_TYPE_GROUPE} defaultOptionIndex={1} />

                            <FormInputText name='destination' label='DESTINATION' control={control} error={errors.destination?.message}
                            />
                            <FileUpload
                                title="Upload images"
                                multiFile={true}
                                onFilesChange={handleFilesChange}
                                onContextReady={(context) => { }}
                                showPlaceholderImage={false}
                                maxFilesContainerHeight={157}
                                buttonLabel='Click here for upload images'
                                rightLabel={''}
                                maxUploadFiles={9}
                                header={'Drag and drop'}
                                allowedExtensions={['jpg', 'jpeg', 'PNG', 'gif', 'JPEG', 'png', 'JPG']}

                                sx={{ '& .MuiPaper-root MuiPaper-outlined MuiPaper-rounded css-ibczwg-MuiPaper-root': { backgroundColor: '#8d868670' } }}
                            />
                            <FormTextArea name="description" label="DESCRIPTION" control={control} error={errors.description?.message} multiline={true} rows={4} />
                            <span>
                                {buttonAdd === true ?
                                    <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }}>EDIT YOUR TRIP</Button>
                                    : <LoadingButton variant="contained" loading={loading}   >
                                        <span>disabled</span>
                                    </LoadingButton>
                                }

                                <Button variant="contained" onClick={goBack} sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>
                            </span>
                        </Box>

                        {(trip.imageFile?.length && trip.imageFile?.length > 0) ?

                            <ImageList sx={{ width: 520, height: 'auto', margin: '30px', '@media(max-width: 600px)': { width: 'auto', height: 'auto', margin: '5px' } }} cols={3} rowHeight={164}>
                                {images ? images.map((item, i) => (
                                    <ImageListItem key={item} sx={{ margin: '10px', padding: '10px', '@media(max-width: 600px)': { width: 'auto', height: 'auto', margin: '1px', padding: '0 8px' } }}>
                                        <HighlightOffSharpIcon sx={{ cursor: 'pointer' }} onClick={deleteImage} id={item} />
                                        <img
                                            src={`https://storage.cloud.google.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format`}
                                            srcSet={`https://storage.cloud.google.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}

                                            alt={item}
                                            loading="lazy"
                                        />
                                    </ImageListItem>
                                )) : ''}
                            </ImageList> :
                            <h4>FOR THIS TRIP DON'T HAVE IMAGES</h4>}
                    </Box>
                </Container>
            </Grid>
        </>
    )
}