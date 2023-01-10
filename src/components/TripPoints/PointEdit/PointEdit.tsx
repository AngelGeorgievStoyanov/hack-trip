import { Autocomplete, GoogleMap, Marker, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import React from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Point } from "../../../model/point";
import { IdType } from "../../../shared/common-types";
import { containerStyle, options } from "../../settings";
import * as pointService from '../../../services/pointService'
import { ApiPoint } from "../../../services/pointService";

let zoom = 8;
let center = {
    lat: 42.697866831005435,
    lng: 23.321590139866355
}


const API_POINT: ApiPoint<IdType, Point> = new pointService.ApiPointImpl<IdType, Point>('data/points');
const libraries: ("drawing" | "geometry" | "localContext" | "places" | "visualization")[] = ["places"];
const googleKey = process.env.REACT_APP_GOOGLE_KEY

export default function PointEdit() {

    const point = useLoaderData() as Point;
    const [clickedPos, setClickedPos] = React.useState<google.maps.LatLngLiteral | undefined>({} as google.maps.LatLngLiteral)

    const [initialPoint, setInitialPoint] = React.useState<google.maps.LatLngLiteral>({ lat: Number(point.lat), lng: Number(point.lng) } as google.maps.LatLngLiteral)

    const [visible, setVisible] = React.useState(true)

    let positionPoint
    if (point.lng !== 'undefined' && point.lat !== 'undefined' && (clickedPos?.lat === undefined)) {

        positionPoint = { lat: Number(point.lat), lng: Number(point.lng) }
        center = { lat: Number(point.lat), lng: Number(point.lng) }

    }
    let pointNumber = 1


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


        if (e.currentTarget.textContent === 'FIND IN MAP') {
            findAddress = inpName.value

        } else if (searchRef.current?.value === '') {
            return
        } else {
            findAddress = searchRef.current!.value
            inpName.value = searchRef.current!.value
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


    const createTripSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.currentTarget)) as any as Point;
        data.lat = point.lat
        data.lng = point.lng
        if (clickedPos?.lat!==undefined) {
            data.lat = clickedPos.lat + ''
            data.lng = clickedPos.lng + ''
        }




        
        
        
        
        
        const editedPoint = { ...data };

        editedPoint.pointNumber = pointNumber
        pointNumber++

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

    return (
        <section className="section-create">

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
            <div className="div-search-btn">

                <Autocomplete>
                    <input type="text" ref={searchRef} />

                </Autocomplete>
                <button type="button" onClick={searchInp}>Search</button>
                <button type="button" onClick={removeMarker}>Remove Marker</button>
            </div>


            <div className="form-create-div">
                <form className="form-create" method="post" onSubmit={createTripSubmitHandler} >
                    <h2>EDIT POINT</h2>
                    <span>
                        <label className="label-create" htmlFor="name">NEME OF CITY,PLACE,LANDMARK OR ANOTHER :
                            <Autocomplete>
                                <input type="text" name="name" id="inputAddPointName" defaultValue={point.name} />
                            </Autocomplete>
                            <button type="button" onClick={findInMap}>FIND IN MAP</button>

                        </label>
                    </span>

                    <span>
                        <label className="label-create" htmlFor="description" >Description</label>
                        <textarea name="description" defaultValue={point.description}></textarea>
                    </span>
                    <span>
                        <label className="label-create" htmlFor="imageUrl">Image Url : </label>
                        <input type="text" name="imageUrl" defaultValue={point.imageUrl} />
                    </span>


                    <span>
                        <button type="submit" className="btnAdd">EDIT POINT</button>
                    </span>
                </form>
            </div>
        </section>
    )
}