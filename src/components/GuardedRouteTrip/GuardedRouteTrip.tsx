import { useContext } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';
import { LoginContext } from '../../App';
import { Trip } from '../../model/trip';
import jwt_decode from "jwt-decode";
import NotFound from '../NotFound/NotFound';




type decode = {
    _id: string,
    role: string
}

let userId: string | undefined;


const GuardedRouteTrip = () => {

    const trip = useLoaderData() as Trip;


    const { userL } = useContext(LoginContext);


    const accessToken = userL?.accessToken ? userL.accessToken : sessionStorage.getItem('accessToken') ? sessionStorage.getItem('accessToken') : undefined;

    let role = 'user';
    
    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;
        userId = decode._id !== undefined ? decode._id : undefined;
    }
   

    return (trip._ownerId === userId) || (role === 'admin' || role === 'manager') ? <Outlet /> : <NotFound />

}
export default GuardedRouteTrip;