import { Autocomplete, GoogleMap, Marker, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import React from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Point } from "../../../model/point";
import { containerStyle, options } from "../../settings";

let zoom = 8;
let center = {
    lat: 42.697866831005435,
    lng: 23.321590139866355
}


export default function PointEdit() {

    const point = useLoaderData() as Point;
    const [clickedPos, setClickedPos] = React.useState<google.maps.LatLngLiteral | undefined>({} as google.maps.LatLngLiteral)
    console.log(point)

    const [initialPoint, setInitialPoint] = React.useState<google.maps.LatLngLiteral>({ lat: Number(point.lat), lng: Number(point.lng) } as google.maps.LatLngLiteral)

    const [visible, setVisible] = React.useState(true)

    let positionPoint

    if (point.lng !== undefined && point.lat !== undefined) {

        positionPoint = { lat: Number(point.lat), lng: Number(point.lng) }
        center = { lat: Number(point.lat), lng: Number(point.lng) }
        console.log(center, '-----center')

    }
    let pointNumber = 1


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
            setVisible(true)

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
            setVisible(true)
            console.log(visible, '----visible---')
        }


        if (searchRef.current?.value !== '' && searchRef.current?.value !== null) {
            searchRef.current!.value = ''
        }
    }

    const findInMap = (e: React.MouseEvent) => {
        let inpName = document.getElementById('inputAddPointName') as HTMLInputElement
        console.log(inpName.value)

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
        if (clickedPos) {
            data.lat = clickedPos.lat + ''
            data.lng = clickedPos.lng + ''
        }


        // if (idTrip) {
        //     data._ownerTripId = idTrip
        // }





        const newPoint = { ...data };

        newPoint.pointNumber = pointNumber
        pointNumber++

        if (newPoint.name.split(',').length > 0) {
            newPoint.name = newPoint.name.split(',')[0]

        }

        const form = e.currentTarget as HTMLFormElement


        // API_POINT.create(newPoint).then((point) => {
        //     setClickedPos(undefined)
        //     form.reset()

        //     navigate(`/trip/points/${idTrip}`)
        // }).catch((err) => {
        //     console.log(err)
        // })
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
                {positionPoint?.lat ? <MarkerF visible={visible} draggable={true} position={initialPoint} /> : clickedPos?.lat ? <MarkerF visible={visible} position={clickedPos} /> : null}
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