import { GoogleMap,  MarkerF, useJsApiLoader } from "@react-google-maps/api";
import React from "react";
import { Point } from "../../../../model/point";
import { ApiPoint } from "../../../../services/pointService";
import { IdType } from "../../../../shared/common-types";
import {  containerStylePoint, optionsPoint } from "../../../settings";
import * as pointService from '../../../../services/pointService'
import { Link, useNavigate, useParams } from "react-router-dom";

interface PointCardProps {
    point: Point;

}


const API_POINT: ApiPoint<IdType, Point> = new pointService.ApiPointImpl<IdType, Point>('data/points');


export default function PointCard({ point }: PointCardProps) {

    const idTrip = useParams().tripId

const navigate= useNavigate()
    let center = {
        lat: Number(point.lat),
        lng: Number(point.lng)
    }


    const mapRef = React.useRef<google.maps.Map | null>(null)


    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',

        googleMapsApiKey: ''!,
        libraries: ['places']
    })

    const onLoad = (map: google.maps.Map): void => {
        mapRef.current = map
    }

    const onUnmount = (): void => {
        mapRef.current = null
    }

    if (!isLoaded) return <div>MAP LOADING ...</div>

    const deleteClickHandler = () => {


        API_POINT.deleteById(point._id).then((data)=>{
           
            navigate(`/trip/points/${idTrip}`)
        }).catch((err)=>{
            console.log(err)
        })

    }

    const editClickHandler =()=>{

    }

    return (
        <>
            <h1>Name: {point.name}</h1>
            <p>Description : {point.description}</p>
            {center.lng ? <div className="div-map-point" >
                <GoogleMap
                    mapContainerStyle={containerStylePoint}
                    options={optionsPoint}
                    center={center}
                    zoom={12}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                >
                    <MarkerF position={center} />
                </GoogleMap></div> : <p>NO MAP MARKER ADDED</p>}
            <button onClick={deleteClickHandler} >DELETE POINT</button>
            <button className="Btn"><Link to={`/points/edit/${point._id}`} className="Btn">EDIT POINT</Link></button>

        </>
    )
}