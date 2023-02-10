import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import React, { BaseSyntheticEvent, useContext, useState } from "react";
import { Link, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { containerStyle, options } from "../settings";
import { IdType } from "../../shared/common-types";
import { Point, PointCreate } from "../../model/point";
import * as pointService from '../../services/pointService';
import { ApiPoint } from "../../services/pointService";
import PointList from "./PointList/PointList";
import { Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import FormInputText from "../FormFields/FormInputText";
import FormTextArea from "../FormFields/FormTextArea";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import FileUpload from "react-mui-fileuploader";
import { LoginContext } from "../../App";


const API_POINT: ApiPoint<IdType, PointCreate> = new pointService.ApiPointImpl<IdType, PointCreate>('data/points');
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


export function TripPoints() {

    const points = useLoaderData() as Point[]
    const { userL, setUserL } = useContext(LoginContext);

    const idTrip = useParams().tripId;
    const [fileSelected, setFileSelected] = React.useState<File[]>([]);
    const [errorMessageSearch, setErrorMessageSearch] = useState('');


    const userId = userL?._id ? userL._id : sessionStorage.getItem('userId') !== null ? sessionStorage.getItem('userId') : ''

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({


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

    const handleFilesChange = (files: any) => {

        if (!files) return;
        setFileSelected([...files]);
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

        } catch (error: any) {

            setErrorMessageSearch('Plece enter exact name location or choose from suggestions');

            console.log(error.message);
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




    if (!isLoaded) return <div>MAP LOADING ...</div>


    const createTripSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {

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
            data._ownerId = userId+''
        }


        const newPoint = { ...data } as PointCreate;


        if (newPoint.name.split(',').length > 1) {
            newPoint.name = newPoint.name.split(',')[0];
        } else if (newPoint.name.split('-').length > 1) {
            newPoint.name = newPoint.name.split('-')[0];
        }


        API_POINT.create(newPoint).then((point) => {
            setClickedPos(undefined);

            reset({ name: '', imageFile: [] });
            center = {
                lat: Number(point.lat),
                lng: Number(point.lng)
            }

            zoom = 8;
            const btnRemoveAll = event?.target.children[4].lastChild.lastChild as HTMLButtonElement;
            btnRemoveAll.click();
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


    return (
        <>
            <Grid container sx={{
                justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh', '@media(max-width: 600px)': {
                    display: 'flex', flexDirection: 'column', maxWidth: '100%'
                }
            }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

                <Container maxWidth={false} sx={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', bgcolor: '#cfe8fc', '@media(max-width: 600px)': {
                        display: 'flex', flexDirection: 'column', maxWidth: '100%'
                    }
                }}>
                    <Box>
                        <PointList points={points} />

                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '100%' }}>
                        <Box sx={{ display: 'flex', maxWidth: '100%' }}>
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
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', margin: '10px' }}>

                            <Autocomplete>
                                <TextField id="outlined-search" label="Search field" type="search" inputRef={searchRef} helperText={errorMessageSearch} />
                            </Autocomplete>
                            <Button variant="contained" onClick={searchInp} sx={{ ':hover': { background: '#4daf30' } }}>Search</Button>
                            <Button variant="contained" onClick={removeMarker} sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >Remove Marker</Button>
                        </Box>
                        <Box component='form'
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                maxWidth: '600px',
                                maxHeight: '850px',
                                padding: '20px',
                                marginTop: '50px',
                                backgroundColor: '#8d868670',
                                boxShadow: '3px 2px 5px black', border: 'solid 2px', borderRadius: '12px',
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
                                <FormInputText name='name' type="search" label='NEME OF CITY,PLACE,LANDMARK OR ANOTHER' control={control} error={errors.name?.message} id='inputAddPointName'
                                />
                            </span>
                            <Button variant="contained" onClick={findInMap} sx={{ ':hover': { background: '#4daf30' } }}>FIND IN MAP</Button>
                            <FormTextArea name="description" label="DESCRIPTION" control={control} error={errors.description?.message} multiline={true} rows={4} />
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
                                header={'Drag to drop'}
                                allowedExtensions={['jpg', 'jpeg', 'PNG', 'gif', 'JPEG', 'png', 'JPG']}
                            />

                            <span>
                                <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }}>ADD POINT</Button>
                                <Button component={Link} to={`/trip/details/${idTrip}`} variant="contained" sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>
                            </span>
                        </Box>
                    </Box>
                </Container>
            </Grid>
        </>
    )
};

export default TripPoints;


