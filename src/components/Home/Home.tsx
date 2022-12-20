import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'


export default function Home() {
let marker 





    console.log()
    return (
        <>

            <h1>HOME PAGE</h1>
            <MapContainer style={{ width: "60%", height: "60vh" }} center={[42.6979638, 23.3214610]} zoom={15} scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[42.6979638, 23.3214610]}>
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
            </MapContainer>
        </>
    )
}