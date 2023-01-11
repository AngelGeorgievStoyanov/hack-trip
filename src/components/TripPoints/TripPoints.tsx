import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import React from "react";
import { Link, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { containerStyle, options } from "../settings";
import './TripPoints.css';

import { IdType } from "../../shared/common-types";
import { Point, PointCreate } from "../../model/point";
import * as pointService from '../../services/pointService'
import { ApiPoint } from "../../services/pointService";
import PointList from "./PointList/PointList";





const API_POINT: ApiPoint<IdType, PointCreate> = new pointService.ApiPointImpl<IdType, PointCreate>('data/points');
const googleKey = process.env.REACT_APP_GOOGLE_KEY
let zoom = 8;

let center = {
    lat: 42.697866831005435,
    lng: 23.321590139866355
}

const libraries: ("drawing" | "geometry" | "localContext" | "places" | "visualization")[] = ["places"];

export function TripPoints() {

    const points = useLoaderData() as Point[]

    const idTrip = useParams().tripId

    let pointNumber = 1


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


    const createTripSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.currentTarget)) as any as PointCreate;
        if (clickedPos) {
            data.lat = clickedPos.lat + ''
            data.lng = clickedPos.lng + ''
        }

        if (idTrip) {
            data._ownerTripId = idTrip
        }





        const newPoint = { ...data };

        newPoint.pointNumber = pointNumber
        pointNumber++

        if (newPoint.name.split(',').length > 0) {
            newPoint.name = newPoint.name.split(',')[0]

        }
console.log(newPoint)
        const form = e.currentTarget as HTMLFormElement


        API_POINT.create(newPoint).then((point) => {
            setClickedPos(undefined)
            console.log(point)
            form.reset()
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
            <section className="section-points">
                <div className="div-points">

                    <PointList points={points} />
                </div>

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
                        {clickedPos?.lat ? <Marker position={clickedPos} animation={google.maps.Animation.DROP} /> : null}
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
                            <h2>ADD POINT</h2>
                            <span>
                                <label className="label-create" htmlFor="name">NEME OF CITY,PLACE,LANDMARK OR ANOTHER :
                                    <Autocomplete>
                                        <input type="text" name="name" id="inputAddPointName" />
                                    </Autocomplete>
                                    <button type="button" onClick={findInMap}>FIND IN MAP</button>

                                </label>
                            </span>

                            <span>
                                <label className="label-create" htmlFor="description">Description</label>
                                <textarea name="description"></textarea>
                            </span>
                            <span>
                                <label className="label-create" htmlFor="imageUrl">Image Url : </label>
                                <input type="text" name="imageUrl" />
                            </span>


                            <span>
                                <button type="submit" className="btnAdd">ADD POINT</button>
                                <button type="button" className="btnAdd"><Link to={`/trip/details/${idTrip}`} className="Btn">FINISH</Link></button>
                            </span>
                        </form>
                    </div>
                </section>
            </section>


        </>
    )
};

export default TripPoints;


