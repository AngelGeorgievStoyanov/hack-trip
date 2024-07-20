import { FC, useContext } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';
import { LoginContext } from "../../hooks/LoginContext";
import { Trip } from '../../model/trip';
import jwt_decode from "jwt-decode";
import NotFound from '../NotFound/NotFound';




type decode = {
    _id: string,
    role: string
}

let userId: string | undefined;


const GuardedRouteTrip: FC = () => {

    const trip = useLoaderData() as Trip;


    const { token } = useContext(LoginContext);


    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    let role = 'user';

    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;
        userId = decode._id !== undefined ? decode._id : undefined;
    }


    return (trip._ownerId === userId) || (role === 'admin' || role === 'manager') ? <Outlet /> : <NotFound />

}
export default GuardedRouteTrip;