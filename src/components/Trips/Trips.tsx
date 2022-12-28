import { useLoaderData } from "react-router-dom";
import { Trip } from "../../model/trip";
import TripList from "./TripsList/TripsList";

import './Trips.css'


export default function Trips() {


    const trips = useLoaderData() as Trip[]

    return (

        <article className="article-all-trips">

        <TripList trips={trips} />
        </article>
    )
}