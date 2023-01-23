import { Autocomplete, GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import React, { BaseSyntheticEvent, useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Point } from "../../../model/point";
import { IdType } from "../../../shared/common-types";
import { containerStyle, options } from "../../settings";
import * as pointService from '../../../services/pointService'
import { ApiPoint } from "../../../services/pointService";
import { Box, Button, CardMedia, Container, Grid, ImageList, ImageListItem, TextField, Typography } from "@mui/material";
import FormInputText from "../../FormFields/FormInputText";
import { useForm } from "react-hook-form";
import FormTextArea from "../../FormFields/FormTextArea";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';
import FileUpload from "react-mui-fileuploader";




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
    pointNumber: IdType;
    imageFile: string[] | undefined;


};

const schema = yup.object({
    name: yup.string().required().min(1).max(50),
    description: yup.string().max(1050, 'Description max length is 1050 chars'),
    imageUrl: yup.string(),



}).required();


export default function PointEdit() {

    const point = useLoaderData() as Point;
    console.log(point)

    const [clickedPos, setClickedPos] = React.useState<google.maps.LatLngLiteral | undefined>({} as google.maps.LatLngLiteral)

    const [initialPoint, setInitialPoint] = React.useState<google.maps.LatLngLiteral>({ lat: Number(point.lat), lng: Number(point.lng) } as google.maps.LatLngLiteral)

    const [visible, setVisible] = React.useState(true)
    const [errorMessageSearch, setErrorMessageSearch] = useState('')
    const [images, setImages] = useState<string[]>()
    const [fileSelected, setFileSelected] = React.useState<File[]>([])


    useEffect(() => {
        API_POINT.findByPointId(point._id).then((data) => {
            setImages(data.imageFile)
        }).catch((err) => console.log(err))
    }, [])





    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({




        defaultValues: {

            name: point.name, description: point.description, imageUrl: point.imageUrl, pointNumber: Number(point.pointNumber)
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

            setErrorMessageSearch('Plece enter location')

            return
        } else {
            reset({ name: '' })

            findAddress = searchRef.current!.value
            inpName.value = searchRef.current!.value


            setValue('name', searchRef.current!.value, { shouldValidate: true })

            setErrorMessageSearch('')

        }

        const geocode = new google.maps.Geocoder()

        try {


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

        } catch (error: any) {

            setErrorMessageSearch('Plece enter exact name location or choose from suggestions')

            console.log(error.message)
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
    const handleFilesChange = (files: any) => {

        if (!files) return;

        setFileSelected([...files]);

    };

    const createTripSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {

        let formData = new FormData();


        if (fileSelected) {
            fileSelected.forEach((file) => {
                formData.append('file', file)
            })
        }


        let imagesNames = await API_POINT.sendFile(formData).then((data) => {
            let imageName = data as unknown as any as any[] | []
            return imageName.map((x) => { return x.filename })
        }).catch((err) => {
            console.log(err)
        })



        let imagesNew = imagesNames as unknown as any as string[]



        if (imagesNew.length > 0) {


            data.imageFile = images?.concat(imagesNew)
        } else {
            data.imageFile = images

        }


        data.lat = point.lat
        data.lng = point.lng
        if (clickedPos?.lat !== undefined) {
            data.lat = clickedPos.lat + ''
            data.lng = clickedPos.lng + ''
        }
        data.pointNumber = point.pointNumber



        const editedPoint = { ...data } as Point;


        if (editedPoint.name.split(',').length > 1) {
            editedPoint.name = editedPoint.name.split(',')[0]

        } else if (editedPoint.name.split(' - ').length > 1) {
            editedPoint.name = editedPoint.name.split(' - ')[0]

        }



        API_POINT.update(point._id, editedPoint).then((point) => {

            navigate(`/trip/points/${point._ownerTripId}`)

        }).catch((err) => {
            console.log(err)
        })

    }


    const goBack = () => {
        navigate(-1);
    }



    const deleteImage = (e: React.MouseEvent) => {



        const index = images?.indexOf(e.currentTarget.id)
        if (index !== undefined) {
            const deletedImage = images?.slice(index, index + 1)

            if (deletedImage) {


                API_POINT.editImages(point._id, deletedImage).then((data) => {
                    setImages(data.imageFile)
                }).catch((err) => {
                    console.log(err)
                })
            }


        }



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
                    <Box component='div' sx={{
                        display: 'flex', flexDirection: 'row', justifyContent: 'space-around', minHeight: '100vh', '@media(max-width: 600px)': {
                            display: 'flex', flexDirection: 'column-reverse', width: '100vw'
                        }
                    }}>



                        <Box component='form'
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                maxWidth: '600px',
                                maxHeight: '850px',
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
                            <FileUpload
                                title="Upload images"
                                multiFile={true}
                                onFilesChange={handleFilesChange}
                                onContextReady={(context) => { }}
                                showPlaceholderImage={false}
                                maxFilesContainerHeight={157}
                                sx={{ '& .MuiPaper-root MuiPaper-outlined MuiPaper-rounded css-ibczwg-MuiPaper-root': { backgroundColor: '#8d868670' } }}
                            />
                            <FormInputText name='imageUrl' label='IMAGE URL' control={control} error={errors.imageUrl?.message} />
                            <span>

                                <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }}>EDIT POINT</Button>
                                <Button onClick={goBack} variant="contained" sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>


                            </span>

                        </Box>



                        {(point.imageFile?.length && point.imageFile?.length > 0) ?

                            <ImageList sx={{ width: 520, height: 550, margin: '30px', '@media(max-width: 600px)': { width: 'auto', height: 'auto', margin: '5px' } }} cols={3} rowHeight={164}>
                                {images ? images.map((item, i) => (
                                    <ImageListItem key={item} sx={{ margin: '10px', padding: '10px', '@media(max-width: 600px)': { width: 'auto', height: 'auto', margin: '1px', padding: '0 8px' } }}>
                                        <HighlightOffSharpIcon sx={{ cursor: 'pointer' }} onClick={deleteImage} id={item} />
                                        <img
                                            src={`http://localhost:8001/uploads/${item}?w=164&h=164&fit=crop&auto=format`}
                                            srcSet={`http://localhost:8001/uploads/${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                            alt={item}
                                            loading="lazy"
                                        />
                                    </ImageListItem>
                                )) : ''}
                            </ImageList> : point.imageUrl.length > 0 ?
                                < CardMedia
                                    component="img"

                                    height="500px"
                                    width="800"
                                    image={point.imageUrl}
                                    alt="TRIP"

                                /> : <h4>FOR THIS POINT DON'T HAVE IMAGES</h4>}

                    </Box>

                </Container>

            </Grid>



        </>
    )
}