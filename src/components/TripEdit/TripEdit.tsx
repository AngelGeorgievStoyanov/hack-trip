import { Form, useLoaderData, useNavigate } from "react-router-dom"
import { Trip, TripCreate } from "../../model/trip"
import { IdType } from "../../shared/common-types";
import * as tripService from '../../services/tripService'

import './TripEdit.css'
import { ApiTrip } from "../../services/tripService";


export default function TripEdit() {



    const trip = useLoaderData() as Trip;

    const navigate = useNavigate()

    const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data/trips');




    const editTripSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault()

        const data = Object.fromEntries(new FormData(e.currentTarget))
        
        const editTrip = { ...data } as any 
        editTrip.id=trip._id as any as Trip

        API_TRIP.update(trip._id, editTrip).then((data) => {
            console.log(data)
            navigate(`/trip/details/${trip._id}`)
        }).catch((err) => {
            console.log(err)
        })




    }



    return (
        <>
            <section className="sectiom-edit-trip">
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
            </section >
        </>
    )
}