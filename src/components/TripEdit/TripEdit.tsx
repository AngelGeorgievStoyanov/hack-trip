import { Form, useLoaderData, useNavigate } from "react-router-dom"
import { Trip, TripCreate } from "../../model/trip"
import { IdType } from "../../shared/common-types";
import * as tripService from '../../services/tripService'

import './TripEdit.css'
import { ApiTrip } from "../../services/tripService";
import { Autocomplete, GoogleMap, Marker, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import React from "react";
import { containerStyle, options } from "../settings";
import { useEffect } from 'react'


const googleKey = process.env.REACT_APP_GOOGLE_KEY
const libraries: ("drawing" | "geometry" | "localContext" | "places" | "visualization")[] = ["places"];

let zoom = 8;

let center = {
    lat: 42.697866831005435,
    lng: 23.321590139866355
}
export default function TripEdit() {



    const trip = useLoaderData() as Trip;



    const [clickedPos, setClickedPos] = React.useState<google.maps.LatLngLiteral | undefined>({} as google.maps.LatLngLiteral)
    const [initialPoint, setInitialPoint] = React.useState<google.maps.LatLngLiteral>({ lat: Number(trip.lat), lng: Number(trip.lng) } as google.maps.LatLngLiteral)

    const [visible, setVisible] = React.useState(true)
    let positionPoint
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

        let inpName = document.getElementById('inputAddPointName') as HTMLInputElement
        inpName.value = ''
        center = {
            lat: 42.697866831005435,
            lng: 23.321590139866355
        }
        zoom = 8


    }





    if (!isLoaded) return <div>MAP LOADING ...</div>


    const editTripSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault()

        const data = Object.fromEntries(new FormData(e.currentTarget))

        const editTrip = { ...data } as any


        if (clickedPos) {
            editTrip.lat = clickedPos.lat + ''
            editTrip.lng = clickedPos.lng + ''
        }
        editTrip.id = trip._id as any as Trip
        console.log(editTrip)
        API_TRIP.update(trip._id, editTrip).then((data) => {
            navigate(`/trip/details/${trip._id}`)
        }).catch((err) => {
            console.log(err)
        })




    }



    return (
        <>
            <section className="sectiom-edit-trip">

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

                <div className="form-edit-div">
                    <form className="form-edit-trip" method="PUT" onSubmit={editTripSubmitHandler}>

                        <h2>EDIT YOUR TRIP</h2>
                        <label htmlFor="title">TITLE :
                            <input type="text" name="title" defaultValue={trip.title} />
                        </label>

                        <label htmlFor="price">PRICE :
                            <input type="number" name="price" defaultValue={trip.price} />
                        </label>


                        <label htmlFor="transport">TRANSPORT WITH :
                            <select name="transport" id="" defaultValue={trip.transport}>
                                <option value="Car">Car</option>
                                <option value="Bus">Bus</option>
                                <option value="Aircraft">Aircraft</option>
                                <option value="Another type">Another type</option>
                            </select>
                        </label>

                        <label htmlFor="countPeoples">COUNT OF PEOPLE :
                            <input type="number" name="countPeoples" defaultValue={trip.countPeoples} />
                        </label>



                        <label htmlFor="typeOfPeople"> TYPE OF THE GROUP :
                            <select name="typeOfPeople" id="" defaultValue={trip.typeOfPeople}>
                                <option value="Family">Family</option>
                                <option value="Family with children">Family with children</option>
                                <option value="Friends">Friends</option>
                                <option value="Another type">Another type</option>
                            </select>

                        </label>
                        <label htmlFor="destination">DESTINATION :
                            <input type="text" name="destination" defaultValue={trip.destination} />
                        </label>

                        <label htmlFor="description">Description</label>
                        <textarea name="description" id="" cols={38} rows={4} defaultValue={trip.description}></textarea>


                        <label htmlFor="imageUrl">imageUrl :
                            <input type="text" name="imageUrl" defaultValue={trip.imageUrl} />
                        </label>

                        <span>
                            <button className="edit-trip">EDIT YOUR TRIP</button>
                            <button className="edit-trip" >BACK</button>
                        </span>
                    </form >
                </div>
            </section >
        </>
    )
}