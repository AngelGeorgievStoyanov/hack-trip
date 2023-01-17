import { GoogleMap, Marker, useJsApiLoader, Autocomplete, } from "@react-google-maps/api";
import React, { BaseSyntheticEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiTrip } from "../../services/tripService";
import { containerStyle, options } from "../settings";

import * as tripService from '../../services/tripService'
import { TripCreate, TripTipeOfGroup, TripTransport } from "../../model/trip";
import { IdType, toIsoDate } from "../../shared/common-types";
import { Box, Button, Container, Grid,TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import FormInputText from "../FormFields/FormInputText";
import FormInputSelect, { SelectOption } from "../FormFields/FormInputSelect";

import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import FormTextArea from "../FormFields/FormTextArea";
import FileUpload from "react-mui-fileuploader";

import './TripCreate.css';


const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data/trips');



const googleKey = process.env.REACT_APP_GOOGLE_KEY
const libraries: ("drawing" | "geometry" | "localContext" | "places" | "visualization")[] = ["places"];



type FormData = {
    _ownerId: string;
    title: string;
    price: number;
    transport: string;
    countPeoples: number;
    typeOfPeople: string;
    destination: string;
    description: string;
    imageUrl?: string | undefined;
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
    title: yup.string().required().min(2).max(60),
    price: yup.number().min(0.1, 'Price must be positive').max(1000000),
    countPeoples: yup.number().required().min(1, 'Count of people cannot be 0.').integer('Count of peoples must be intiger.').max(1000),
    destination: yup.string().required().min(3, 'Destination is required min length 3 chars.').max(60, 'Max length is 60 chars.'),
    description: yup.string().max(1050, 'Description max length is 1050 chars'),
    imageUrl: yup.string(),



}).required();


let center = {
    lat: 42.697866831005435,
    lng: 23.321590139866355
}


let zoom = 8;

export function CreateTrip() {


    const [errorMessageSearch, setErrorMessageSearch] = useState('')

    const [clickedPos, setClickedPos] = React.useState<google.maps.LatLngLiteral | undefined>({} as google.maps.LatLngLiteral)

    const [fileSelected, setFileSelected] = React.useState<File[]>([])





    const _ownerId = sessionStorage.getItem('userId')
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({




        defaultValues: {
            title: '', _ownerId: '', countPeoples: undefined, timeCreated: '', lat: undefined, lng: undefined,
            timeEdited: '', typeOfPeople: '', description: '', destination: '', imageUrl: '', price: undefined, transport: ''
        },
        mode: 'onChange',
        resolver: yupResolver(schema),
    });


    const navigate = useNavigate()
    const searchRef = React.useRef<HTMLInputElement | null>(null)




    const handleFilesChange = (files: any) => {

        if (!files) return;

        setFileSelected([...files]);

    };
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

    const onMapClick = (e: google.maps.MapMouseEvent) => {


        if (e.latLng?.lat() !== undefined && (typeof (e.latLng?.lat()) === 'number')) {

            setClickedPos({ lat: e.latLng.lat(), lng: e.latLng.lng() })
        }


    }



    const searchInp = async () => {



        if (!searchRef.current?.value) {

            setErrorMessageSearch('Plece enter location')
            return
        }
        setErrorMessageSearch('')

        const geocode = new google.maps.Geocoder()
        const result = await geocode.geocode({
            address: searchRef.current!.value
        })


        if (result) {
            zoom = 16
            center = { lat: result.results[0].geometry.location.lat(), lng: result.results[0].geometry.location.lng() }
            setClickedPos({ lat: result.results[0].geometry.location.lat(), lng: result.results[0].geometry.location.lng() })

        }


        if (searchRef.current?.value !== '' && searchRef.current?.value !== null) {
            searchRef.current!.value = ''
        }
    }


    const removeMarker = () => {
        setClickedPos(undefined)
        center = {
            lat: 42.697866831005435,
            lng: 23.321590139866355
        }
        zoom = 8
    }




    if (!isLoaded) return <div>MAP LOADING ...</div>





    const createTripSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined, addPoints?: boolean) => {
        event?.preventDefault()

        let formData = new FormData();


        if (fileSelected) {
            fileSelected.forEach((file) => {
                formData.append('file', file)
            }
            )
        }


        const imagesNames = await API_TRIP.sendFile(formData).then((data) => {
            let imageName = data as unknown as any as any[]
            return imageName.map((x) => { return x.filename })
        }).catch((err) => {
            console.log(err)
        })

        if (imagesNames) {


            data.imageFile = imagesNames
        }




        if (clickedPos) {
            data.lat = clickedPos.lat
            data.lng = clickedPos.lng
        }


        if (_ownerId) {
            data._ownerId = _ownerId
        }



        data.timeCreated = toIsoDate(new Date())
        data.typeOfPeople = TripTipeOfGroup[parseInt(data.typeOfPeople)]
        data.transport = TripTransport[parseInt(data.transport)]
        const newTrip = { ...data } as any as TripCreate


        API_TRIP.create(newTrip).then((trip) => {

            if (addPoints === true) {
                navigate(`/trip/points/${trip._id}`)

            } else {

                navigate(`/trip/details/${trip._id}`)
            }



        }).catch((err) => {
            console.log(err)
        })





    }


    const addPoints = (e: React.MouseEvent) => {
        e.preventDefault()


        const target = e.currentTarget.parentElement?.parentElement as HTMLFormElement
        const data = Object.fromEntries(new FormData(target)) as any as FormData

        e as any as BaseSyntheticEvent<HTMLFormElement>




        createTripSubmitHandler(data, e, true)

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

                        {clickedPos?.lat ? <Marker position={clickedPos} /> : null}
                    </GoogleMap>

                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', margin: '10px', minWidth: '500px' }}>



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
                            maxHeight: '1050px',
                            padding: '30px',
                            backgroundColor: '#8d868670',
                            boxShadow: '3px 2px 5px black', border: 'solid 2px', borderRadius: '12px',
                            '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },
                            '& .MuiButton-root': { m: 1, width: '32ch' },
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
                            sx={{backgroundColor:'#8d868670'}}
                        />

                        <FormInputText name='imageUrl' label='IMAGE URL' control={control} type='text' error={errors.imageUrl?.message}
                        />
                        <FormTextArea name="description" label="DESCRIPTION" control={control} error={errors.description?.message} multiline={true} rows={4} />


                        <span>

                            <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }}>ADD TRIP</Button>
                            <Button variant="contained" onClick={addPoints} sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >ADD POINT`S FOR THE TRIP</Button>

                        </span>






                    </Box>


                </Container>
            </Grid>
        </>
    )
};

export default CreateTrip;


