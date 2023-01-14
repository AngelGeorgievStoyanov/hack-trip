import { Autocomplete, GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import React, { BaseSyntheticEvent, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Point } from "../../../model/point";
import { IdType } from "../../../shared/common-types";
import { containerStyle, options } from "../../settings";
import * as pointService from '../../../services/pointService'
import { ApiPoint } from "../../../services/pointService";
import { Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import FormInputText from "../../FormFields/FormInputText";
import { useForm } from "react-hook-form";
import FormTextArea from "../../FormFields/FormTextArea";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
let zoom = 8;
let center = {
    lat: 42.697866831005435,
    lng: 23.321590139866355
}


const API_POINT: ApiPoint<IdType, Point> = new pointService.ApiPointImpl<IdType, Point>('data/points');
const libraries: ("drawing" | "geometry" | "localContext" | "places" | "visualization")[] = ["places"];
const googleKey = process.env.REACT_APP_GOOGLE_KEY
const span = document.getElementById('edit-point-span')
span?.addEventListener('click', (e) => { console.log(e) })

type FormData = {
    name: string;
    description: string;
    imageUrl?: string;
    lat: string;
    lng: string;

};

const schema = yup.object({
    name: yup.string().required().min(1).max(50),
    description: yup.string().max(1050, 'Description max length is 1050 chars'),
    imageUrl: yup.string(),



}).required();


export default function PointEdit() {

    const point = useLoaderData() as Point;


    const [clickedPos, setClickedPos] = React.useState<google.maps.LatLngLiteral | undefined>({} as google.maps.LatLngLiteral)

    const [initialPoint, setInitialPoint] = React.useState<google.maps.LatLngLiteral>({ lat: Number(point.lat), lng: Number(point.lng) } as google.maps.LatLngLiteral)

    const [visible, setVisible] = React.useState(true)
    const [errorMessageSearch, setErrorMessageSearch] = useState('')



    const { control, handleSubmit,  reset, setValue, formState: { errors } } = useForm<FormData>({




        defaultValues: {
            name: point.name, description: point.description, imageUrl: point.imageUrl
        },
        mode: 'onChange',
        resolver: yupResolver(schema),
    });

    let positionPoint
    if (point.lng !== 'undefined' && point.lat !== 'undefined' && (clickedPos?.lat === undefined)) {

        positionPoint = { lat: Number(point.lat), lng: Number(point.lng) }
        center = { lat: Number(point.lat), lng: Number(point.lng) }

    }
  


    const navigate = useNavigate()



    const searchRef = React.useRef<HTMLInputElement | null>(null)

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
            setVisible(true)

            setInitialPoint({ lat: e.latLng.lat(), lng: e.latLng.lng() })

        }


    }




    const searchInp = async (e: React.MouseEvent) => {

      

        let findAddress = ''
        const inpName = document.getElementById('inputAddPointName') as HTMLInputElement
        const btnFind = e.target as HTMLElement
        if (btnFind.textContent === 'FIND IN MAP') {
            findAddress = inpName.value

        } else if (searchRef.current?.value === '') {
            return
        } else {
            reset({ name: '' })

            findAddress = searchRef.current!.value
            inpName.value = searchRef.current!.value


            setValue('name', searchRef.current!.value, { shouldValidate: true })

        }

        const geocode = new google.maps.Geocoder()
        const result = await geocode.geocode({
            address: findAddress
        })


        if (result) {
            let searchPosition = { lat: result.results[0].geometry.location.lat(), lng: result.results[0].geometry.location.lng() }
            zoom = 12
            center = searchPosition
            setClickedPos(searchPosition)
            setVisible(true)
            setInitialPoint(searchPosition)


        }


        if (searchRef.current?.value !== '' && searchRef.current?.value !== null) {
            searchRef.current!.value = ''
        }
    }

    const findInMap = (e: React.MouseEvent) => {


        searchInp(e)
    }






    const removeMarker = () => {
        setClickedPos(undefined)
        setVisible(false)

        let inpName = document.getElementById('inputAddPointName') as HTMLInputElement
        inpName.value = ''
        center = {
            lat: 42.697866831005435,
            lng: 23.321590139866355
        }
        zoom = 8


    }




    if (!isLoaded) return <div>MAP LOADING ...</div>


    const createTripSubmitHandler = (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {


        console.log(data)


        data.lat = point.lat
        data.lng = point.lng
        if (clickedPos?.lat !== undefined) {
            data.lat = clickedPos.lat + ''
            data.lng = clickedPos.lng + ''
        }



        const editedPoint = { ...data } as Point;


        if (editedPoint.name.split(',').length > 1) {
            editedPoint.name = editedPoint.name.split(',')[0]

        } else if (editedPoint.name.split(' - ').length > 1) {
            editedPoint.name = editedPoint.name.split(' - ')[0]

        }

        console.log(editedPoint)


        API_POINT.update(point._id, editedPoint).then((point) => {

            navigate(`/trip/points/${point._ownerTripId}`)

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
                            maxHeight: '450px',
                            padding: '30px',
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

                        <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h4">
                            EDIT POINT
                        </Typography>
                        <span >


                            <FormInputText name='name' type="search" label='NEME OF CITY,PLACE,LANDMARK OR ANOTHER' control={control} error={errors.name?.message} id='inputAddPointName'
                            />

                        </span>

                        <Button variant="contained" onClick={findInMap} sx={{ ':hover': { background: '#4daf30' } }}>FIND IN MAP</Button>
                        <FormTextArea name="description" label="DESCRIPTION" control={control} error={errors.description?.message} multiline={true} rows={4} />

                        <FormInputText name='imageUrl' label='IMAGE URL' control={control} error={errors.imageUrl?.message} />
                        <span>

                            <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }}>EDIT POINT</Button>
                            <Button onClick={goBack} variant="contained" sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>


                        </span>

                    </Box>
                </Container>

            </Grid>



        </>
    )
}