import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import React, { BaseSyntheticEvent } from "react";
import { Link, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { containerStyle, options } from "../settings";
import './TripPoints.css';

import { IdType } from "../../shared/common-types";
import { Point, PointCreate } from "../../model/point";
import * as pointService from '../../services/pointService'
import { ApiPoint } from "../../services/pointService";
import PointList from "./PointList/PointList";
import { Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import FormInputText from "../FormFields/FormInputText";
import FormTextArea from "../FormFields/FormTextArea";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';




const API_POINT: ApiPoint<IdType, PointCreate> = new pointService.ApiPointImpl<IdType, PointCreate>('data/points');
const googleKey = process.env.REACT_APP_GOOGLE_KEY
let zoom = 8;

let center = {
    lat: 42.697866831005435,
    lng: 23.321590139866355
}


type FormData = {
    name: string;
    description: string;
    imageUrl?: string;
    lat: string;
    lng: string;
    _ownerTripId:string

};


const libraries: ("drawing" | "geometry" | "localContext" | "places" | "visualization")[] = ["places"];


const schema = yup.object({
    name: yup.string().required().min(1).max(50),
    description: yup.string().max(1050, 'Description max length is 1050 chars'),
    imageUrl: yup.string(),



}).required();


export function TripPoints() {

    const points = useLoaderData() as Point[]

    const idTrip = useParams().tripId

    let pointNumber = 1

    const { control, handleSubmit, setError, reset, setValue, formState: { errors } } = useForm<FormData>({




        defaultValues: {
            name: '', description: '', imageUrl: ''
        },
        mode: 'onChange',
        resolver: yupResolver(schema),
    });
    const _ownerId = sessionStorage.getItem('userId')

    const [clickedPos, setClickedPos] = React.useState<google.maps.LatLngLiteral | undefined>({} as google.maps.LatLngLiteral)

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
            console.log(clickedPos)
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
            reset({ name: '',description:'',imageUrl:'',lat:'',lng:'',_ownerTripId:'' })
           
            findAddress = searchRef.current!.value
            inpName.value = searchRef.current!.value


            setValue('name', searchRef.current!.value, { shouldValidate: true })

        }


        const geocode = new google.maps.Geocoder()
        const result = await geocode.geocode({
            address: findAddress
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

    const findInMap = (e: React.MouseEvent) => {

        searchInp(e)
    }



    const removeMarker = () => {
        setClickedPos(undefined)
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
      
      
      
        

        if (clickedPos?.lat !== undefined) {
            data.lat = clickedPos.lat + ''
            data.lng = clickedPos.lng + ''
        }

        if (idTrip) {
            data._ownerTripId = idTrip
        }



         const newPoint = { ...data } as PointCreate

       

        if (newPoint.name.split(',').length > 0) {
            newPoint.name = newPoint.name.split(',')[0]

        }
        console.log(newPoint)
    


        API_POINT.create(newPoint).then((point) => {
            setClickedPos(undefined)
            console.log(point)
            reset({ name: '' })
            center = {
                lat: Number(point.lat),
                lng: Number(point.lng)
            }

            zoom = 8
            navigate(`/trip/points/${idTrip}`)
        }).catch((err) => {
            console.log(err)
        })

    }




    return (
        <>
          

            <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>


                <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', bgcolor: '#cfe8fc' }}>
                    <Box>
                        <PointList points={points} />


                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            options={options as google.maps.MapOptions}
                            center={center}
                            zoom={zoom}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                            onClick={onMapClick}
                        >
                            {clickedPos?.lat ? <Marker position={clickedPos} animation={google.maps.Animation.DROP} /> : null}
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

                            <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h5">
                                ADD POINT
                            </Typography>

                            <span >


                                <FormInputText name='name' type="search" label='NEME OF CITY,PLACE,LANDMARK OR ANOTHER' control={control} error={errors.name?.message} id='inputAddPointName'
                                />

                            </span>

                            <Button variant="contained" onClick={findInMap} sx={{ ':hover': { background: '#4daf30' } }}>FIND IN MAP</Button>
                            <FormTextArea name="description" label="DESCRIPTION" control={control} error={errors.description?.message} multiline={true} rows={4} />

                            <FormInputText name='imageUrl' label='IMAGE URL' control={control} error={errors.imageUrl?.message} />
                            <span>

                                <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }}>ADD TRIP</Button>
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


