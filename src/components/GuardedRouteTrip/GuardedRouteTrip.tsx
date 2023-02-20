import { useContext } from 'react';
import { Navigate, Outlet, useLoaderData } from 'react-router-dom';
import { LoginContext } from '../../App';
import { Trip } from '../../model/trip';
import jwt_decode from "jwt-decode";
import NotFound from '../NotFound/NotFound';




type decode = {
    _id: string,
    email: string,
    firstName: string,
    lastName: string,
    role: string
}




const GuardedRouteTrip = () => {

    const trip = useLoaderData() as Trip;

    const { userL, setUserL } = useContext(LoginContext);

    const userId = userL?._id ? userL._id : sessionStorage.getItem('userId') ? sessionStorage.getItem('userId') : undefined;
    const accessToken = userL?.accessToken ? userL.accessToken : sessionStorage.getItem('accessToken') ? sessionStorage.getItem('accessToken') : undefined;


    let role = 'user';

    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;
    }


    return (trip._ownerId === userId) || (role === 'admin' || role === 'manager') ? <Outlet /> : <NotFound />

}
export default GuardedRouteTrip