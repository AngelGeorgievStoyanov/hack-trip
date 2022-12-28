import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { Trip, TripCreate } from "../../model/trip";
import { ApiTrip } from "../../services/tripService";
import { IdType } from "../../shared/common-types";
import * as tripService from '../../services/tripService'

import './TripDetails.css'

export default function TripDetails() {
    let pointOfTrip = 1;

    const navigate = useNavigate()

    const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data/trips');



    const trip = useLoaderData() as Trip;



    const deleteClickHandler = () => {


        API_TRIP.deleteById(trip._id).then((data) => {
            console.log(data)
            navigate('/trips')
        }).catch((err) => {
            console.log(err)
        })


    }


    return (
        <section className="section-details">

            <article className="article-details">

                <h2 className="info">Trip name : {trip.title}</h2>
                <h4 className="info">Price of the Trip: {trip.price} euro </h4>
                <h4 className="info">Transport with: {trip.transport}</h4>
                <h4 className="info">Coun of people: {trip.countPeoples}</h4>
                <h4 className="info">Type of the group: {trip.typeOfPeople}</h4>
                <h4 className="info">Destination: {trip.destination}</h4>
                <p>Description : {trip.description}</p>

                <button type="button">
                    <Link to={`/trip/points/${trip._id}`} className="Btn">ADD POINTS FOR YOUR TRIP</Link>
                </button>


                <button className="Btn">ADD COMMENT</button>
                <button className="Btn"><Link to={`/trip/edit/${trip._id}`} className="Btn">EDIT TRIP</Link></button>
                <button className="Btn" onClick={deleteClickHandler}>DELETE TRIP</button>
                <button className="Btn">BACK</button>




            </article>

            <article>
                <img className="section-details-img" src={trip.imageUrl} alt="Trip" />

            </article>


        </section>
    )
}