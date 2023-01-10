import { useLoaderData } from "react-router-dom"
import { Trip } from "../../model/trip"
import TripList from "../Trips/TripsList/TripsList"


import './MyTrips.css'

export default function MyTrips() {

    const trips = useLoaderData() as Trip[]

    console.log(trips)
    return (
        <>
            <div className="div-my-trips">
                {trips.length === 0 ?
                    <div className="div-no-trips" >
                        <h1>You dont't have a published trip yet.</h1>
                        <button className="btnAdd">CLICK HERE AN ADD YOUR FIRST TRIP</button>
                    </div> :
                    <>
                        <div className="div-h1">
                            <h1>These are your trips</h1>
                        </div>
                        <div className="my-trips">
                            <TripList trips={trips} />


                        </div>
                    </>
                }
            </div >
        </>
    )
}