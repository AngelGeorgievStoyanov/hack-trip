import { Form, useLoaderData, useNavigate } from "react-router-dom"
import { Trip, TripCreate, TripTipeOfGroup, TripTransport } from "../../model/trip"
import { IdType, toIsoDate } from "../../shared/common-types";
import * as tripService from '../../services/tripService'

import './TripEdit.css'
import { ApiTrip } from "../../services/tripService";
import { Autocomplete, GoogleMap, Marker, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import React, { BaseSyntheticEvent } from "react";
import { containerStyle, options } from "../settings";
import { useEffect } from 'react'
import { Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import FormInputText from "../FormFields/FormInputText";
import FormInputSelect, { SelectOption } from "../FormFields/FormInputSelect";
import FormTextArea from "../FormFields/FormTextArea";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from "react-hook-form";

const googleKey = process.env.REACT_APP_GOOGLE_KEY
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
    imageUrl?: string;
    timeCreated: string | undefined;
    timeEdited?: string | undefined;
    lat: number | undefined;
    lng: number | undefined;

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
    title: yup.string().required().min(2).max(50),
    price: yup.number().min(0.1, 'Price must be positive'),
    countPeoples: yup.number().min(1, 'Count of people cannot be 0.').integer('Count of peoples must be intiger.'),
    destination: yup.string().required().min(3, 'Destination is required min length 3 chars.').max(60, 'Max length is 60 chars.'),
    description: yup.string().max(1050, 'Description max length is 1050 chars'),
    imageUrl: yup.string(),



}).required();






export default function TripEdit() {



    const trip = useLoaderData() as Trip;



    const [clickedPos, setClickedPos] = React.useState<google.maps.LatLngLiteral | undefined>({} as google.maps.LatLngLiteral)
    const [initialPoint, setInitialPoint] = React.useState<google.maps.LatLngLiteral>({ lat: Number(trip.lat), lng: Number(trip.lng) } as google.maps.LatLngLiteral)

    const [visible, setVisible] = React.useState(true)
    let positionPoint

    const { control, handleSubmit, setError, formState: { errors } } = useForm<FormData>({




        defaultValues: {
            title: trip.title, _ownerId: trip._ownerId, countPeoples: +trip.countPeoples,
            timeCreated: trip.timeCreated, lat: Number(trip.lat), lng: Number(trip.lng),
            timeEdited: trip.timeEdited, typeOfPeople: TripTipeOfGroup[trip.typeOfPeople],
            description: trip.description, destination: trip.destination, imageUrl: trip.imageUrl, price: +trip.price, transport: TripTransport[trip.transport]
        },
        mode: 'onChange',
        resolver: yupResolver(schema),
    });




    if (trip.lng !== undefined && trip.lat !== undefined && (clickedPos?.lat === undefined)) {

        positionPoint = { lat: Number(trip.lat), lng: Number(trip.lng) }
        center = { lat: Number(trip.lat), lng: Number(trip.lng) }

    }


    const searchRef = React.useRef<HTMLInputElement | null>(null)

    const navigate = useNavigate()

    const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data/trips');

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',

        googleMapsApiKey: googleKey!,
        libraries,
    })


    const mapRef = React.useRef<google.maps.Map | null>(null)

    const onLoad = (map: google.maps.Map): void => {
        mapRef.current = map
    }

    const onUnmount = (): void => {
        mapRef.current = null
    }



    const onMapClick = async (e: google.maps.MapMouseEvent) => {



        if (e.latLng?.lat() !== undefined && (typeof (e.latLng?.lat()) === 'number') && (e.latLng?.lat() !== null)) {
            setClickedPos({ lat: e.latLng.lat(), lng: e.latLng.lng() })
            setVisible(true)

            setInitialPoint({ lat: e.latLng.lat(), lng: e.latLng.lng() })


        }



    }


    const searchInp = async () => {

        if (searchRef.current?.value === '') {
            return
        }
        const geocode = new google.maps.Geocoder()
        const result = await geocode.geocode({
            address: searchRef.current!.value
        })


        if (result) {
            let searchPosition = { lat: result.results[0].geometry.location.lat(), lng: result.results[0].geometry.location.lng() }


            zoom = 16
            center = searchPosition
            setClickedPos(searchPosition)
            setVisible(true)
            setInitialPoint(searchPosition)




        }


        if (searchRef.current?.value !== '' && searchRef.current?.value !== null) {
            searchRef.current!.value = ''
        }
    }


    const removeMarker = () => {

        setClickedPos(undefined)
        setVisible(false)


        center = {
            lat: 42.697866831005435,
            lng: 23.321590139866355
        }
        zoom = 8
        // setClickedPos(center)

    }





    if (!isLoaded) return <div>MAP LOADING ...</div>


    const editTripSubmitHandler = (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {




        if (clickedPos) {
            data.lat = clickedPos.lat
            data.lng = clickedPos.lng
        }
        data.timeEdited = toIsoDate(new Date())

        data.typeOfPeople = TripTipeOfGroup[parseInt(data.typeOfPeople)]
        data.transport = TripTransport[parseInt(data.transport)]
        const editTrip = { ...data } as any

        editTrip.id = trip._id as any as Trip
        console.log(editTrip)
        API_TRIP.update(trip._id, editTrip).then((data) => {
            navigate(`/trip/details/${trip._id}`)
        }).catch((err) => {
            console.log(err)
        })




    }

    const goBack = () => {
        navigate(-1);
    }

    return (
        <>


            <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        options={options as google.maps.MapOptions}
                        center={center}
                        zoom={zoom}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        onClick={onMapClick}

                    >

                        {positionPoint?.lat ? <MarkerF visible={visible} animation={google.maps.Animation.DROP} position={initialPoint} /> : clickedPos?.lat ? <MarkerF animation={google.maps.Animation.DROP} visible={visible} position={clickedPos} /> : null}

                    </GoogleMap>


                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', margin: '10px', minWidth: '500px' }}>



                        <Autocomplete>
                            <TextField id="outlined-search" label="Search field" type="search" inputRef={searchRef} />

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
                            maxHeight: '750px',
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


                        <FormInputText name='imageUrl' label='IMAGE URL' control={control} error={errors.imageUrl?.message}
                        />

                        <FormTextArea name="description" label="DESCRIPTION" control={control} error={errors.description?.message} multiline={true} rows={4} />

                        <span>

                            <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }}>EDIT YOUR TRIP</Button>
                            <Button variant="contained" onClick={goBack} sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>

                        </span>






                    </Box>


                </Container>
            </Grid>
        </>
    )
}