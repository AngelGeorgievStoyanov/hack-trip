import { FC, useContext, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { LoginContext } from "../../hooks/LoginContext";
import { Trip, TripCreate } from '../../model/trip';
import jwt_decode from "jwt-decode";
import NotFound from '../NotFound/NotFound';
import { ApiTrip } from '../../services/tripService';
import { IdType } from '../../shared/common-types';
import * as tripService from "../../services/tripService";




type decode = {
    _id: string,
    role: string
}

let userId: string | undefined;

const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data');

const GuardedRouteTrip: FC = () => {

    const idTrip = useParams().tripId;

    const { token } = useContext(LoginContext);

    const [trip, setTrip] = useState<Trip>()

    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    let role = 'user';

    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;
        userId = decode._id !== undefined ? decode._id : undefined;
    }

    useEffect(() => {
        if (idTrip && userId && accessToken) {

            API_TRIP.findById(idTrip, userId, accessToken).then((data) => {
                setTrip(data)

            }).catch((err) => {
                console.log(err)
            });
        }
    }, [])


    return (trip && trip._ownerId === userId) || (role === 'admin' || role === 'manager') ? <Outlet /> : <NotFound />

}
export default GuardedRouteTrip;