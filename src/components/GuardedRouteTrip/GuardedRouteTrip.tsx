import { useContext } from 'react';
import { Navigate, Outlet, useLoaderData } from 'react-router-dom';
import { LoginContext } from '../../App';
import { Trip } from '../../model/trip';




const GuardedRouteTrip = () => {

    const trip = useLoaderData() as Trip;

    const { userL, setUserL } = useContext(LoginContext);

    const userId = userL?._id ? userL._id : sessionStorage.getItem('userId') ? sessionStorage.getItem('userId') : undefined;


    return (trip._ownerId === userId) ? <Outlet /> : <Navigate to="/login" />

}
export default GuardedRouteTrip