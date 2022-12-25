

import { Link } from 'react-router-dom';
import { Trip } from '../../../../model/trip';
import './TripCard.css'


interface TripCardProps {
    trip: Trip;

}


export default function TripCard({ trip }: TripCardProps) {
    return (
        <>
            <section className="section-trip" id={trip._id + ''}>
                <div className="trip-div">
                    <li className="trip-item">
                        <h2>Title of the trip :{trip.title} </h2>
                        <h3>Destination of the trip :{trip.destination}</h3>
                        <p>Short description : {trip.description}</p>
                        <img className="trip-item-image" src={trip.imageUrl} alt="Trip" />

                        <p>LIKES :</p>
                        <Link to={`/trip/details/${trip._id}`} className="btnDetails">Details</Link>
                    </li>
                </div>
            </section>
        </>


    )
}