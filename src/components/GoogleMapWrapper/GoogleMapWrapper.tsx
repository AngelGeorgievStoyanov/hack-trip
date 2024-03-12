import { Box } from "@mui/material";
import { GoogleMap, MarkerF, PolylineF } from "@react-google-maps/api";
import { FC } from "react";
import { containerStyle, options } from "../settings";
import { Point } from "../../model/point";
import { Trip } from "../../model/trip";

interface GoogleMapWrapperProps {
    center: google.maps.LatLngLiteral;
    zoom: number;
    onLoad: (map: google.maps.Map) => void;
    onUnmount: () => void;
    onMapClick?: (event: google.maps.MapMouseEvent) => void;
    onMarkerClick?: (markerId: string, markerIndex: number) => void;
    dragMarker?: (event: google.maps.MapMouseEvent) => void;
    clickedPos?: google.maps.LatLngLiteral;
    pathPoints?: google.maps.LatLngLiteral[];
    points?: Point[];
    trip?: Trip;
    visible?: boolean;
    positionPoint?: google.maps.LatLngLiteral;
    initialPoint?: google.maps.LatLngLiteral;
}



const GoogleMapWrapper: FC<GoogleMapWrapperProps> = ({ center, zoom, onLoad, onUnmount, onMapClick, onMarkerClick, dragMarker, clickedPos, pathPoints, points, trip, positionPoint, initialPoint, visible }) => {

    return (
        <>
            <Box sx={{ display: 'flex', maxWidth: '600px' }} >
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    options={options as google.maps.MapOptions}
                    center={center}
                    zoom={zoom}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={onMapClick}
                >
                    {pathPoints ? <PolylineF path={pathPoints} /> : null}
                    {points && points?.length > 0 ? points.map((x: any, i: any) => { return <MarkerF key={x._id} title={x.name} position={{ lat: Number(x.lat), lng: Number(x.lng) }} label={x.pointNumber + ''} animation={google.maps.Animation.DROP} onClick={() => onMarkerClick?.(x._id + '', i + 1)} /> }) : ((trip && trip.lat !== undefined && trip.lat !== null) && (trip.lng !== undefined && trip.lng !== null)) ? <MarkerF position={{ lat: Number(trip.lat), lng: Number(trip.lng) }} /> : ''}
                    {initialPoint && positionPoint?.lat ? <MarkerF visible={visible} animation={google.maps.Animation.DROP} position={initialPoint} draggable onDragEnd={dragMarker} /> :
                        clickedPos?.lat ? <MarkerF animation={google.maps.Animation.DROP} visible={visible} position={clickedPos} draggable onDragEnd={dragMarker} /> : null}

                </GoogleMap>
            </Box>
        </>
    )
}
export default GoogleMapWrapper;
