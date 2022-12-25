import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { env } from "process";
import React from "react";
import {  useNavigate } from "react-router-dom";
import { ApiTrip } from "../../services/tripService";
import { containerStyle, options } from "../settings";
import './CreateTrip.css';

import * as tripService from '../../services/tripService'
import { TripCreate } from "../../model/trip";
import { IdType } from "../../shared/common-types";




const API_TRIP: ApiTrip<IdType,TripCreate> = new tripService.ApiTripImpl<IdType,TripCreate>('data/trips');

let zoom = 8;

let center = {
    lat: 42.697866831005435,
    lng: 23.321590139866355
}

export const CreateTrip: React.FC = () => {

    const _ownerId = localStorage.getItem('userId')

    const [clickedPos, setClickedPos] = React.useState<google.maps.LatLngLiteral | undefined>({} as google.maps.LatLngLiteral)

    const navigate = useNavigate()
    const searchRef = React.useRef<HTMLInputElement | null>(null)

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',

        googleMapsApiKey: ''!,
        libraries: ['places']
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

        if (searchRef.current?.value === '') {
            return
        }
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

    console.log(clickedPos, 'state position')

    const createTrip = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.currentTarget))
        if (clickedPos) {
            data.lat = clickedPos.lat + ''
            data.lng = clickedPos.lng + ''
        }
        console.log(_ownerId)

        if (_ownerId) {
            data._ownerId = _ownerId
        }

        const newTrip = { ...data } as any as TripCreate
        console.log(newTrip)

        API_TRIP.create(newTrip).then((trip) => {
            console.log(trip)

             navigate('/')
        }).catch((err) => {
            console.log(err)
        })

    }

    return (
        <>
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
                    {clickedPos?.lat ? <Marker position={clickedPos} /> : null}
                </GoogleMap>
                <div className="div-search-btn">
                    <Autocomplete>
                        <input type="text" ref={searchRef} />

                    </Autocomplete>
                    <button type="button" onClick={searchInp}>Search</button>
                    <button type="button" onClick={removeMarker}>Remove Marker</button>
                </div>

                <div className="form-create-div">
                    <form className="form-create" method="post" onSubmit={createTrip} >
                        <h2>ADD NEW TRIP</h2>
                        <span>
                            <label className="label-create" htmlFor="title">TITLE :</label>
                            <input type="text" name="title" />
                        </span>
                        <span>
                            <label className="label-create" htmlFor="price">PRICE :</label>
                            <input type="number" name="price" />
                        </span>
                        <span>
                            <label className="label-create" htmlFor="transport">TRANSPORT WITH :</label>
                            <select name="transport" id="" >
                                <option value="Car">Car</option>
                                <option value="Bus">Bus</option>
                                <option value="Aircraft">Aircraft</option>
                                <option value="Another type">Another type</option>
                            </select>
                        </span>

                        <span>
                            <label className="label-create" htmlFor="countPeoples">COUNT OF PEOPLE :</label>
                            <input type="number" name="countPeoples" />
                        </span>

                        <span>
                            <label className="label-create" htmlFor="typeOfPeople"> TYPE OF THE GROUP : </label>
                            <select name="typeOfPeople" >
                                <option value="Family">Family</option>
                                <option value="Family with children">Family with children</option>
                                <option value="Friends">Friends</option>
                                <option value="Another type">Another type</option>
                            </select>
                        </span>
                        <span>
                            <label className="label-create" htmlFor="destination">DESTINATION :</label>
                            <input type="text" name="destination" />
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
                            <button type="submit" className="btnAdd">ADD TRIP</button>

                        </span>
                    </form>
                </div>
            </section>
        </>
    )
};

export default CreateTrip;


