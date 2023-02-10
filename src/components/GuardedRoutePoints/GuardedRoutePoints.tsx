import { useContext } from 'react';
import { Navigate, Outlet, useLoaderData } from 'react-router-dom';
import { LoginContext } from '../../App';
import { Point } from '../../model/point';




const GuardedRoutePoint = () => {

    const point = useLoaderData() as Point;

    
    const { userL, setUserL } = useContext(LoginContext);
    
    const userId = userL?._id ? userL._id : sessionStorage.getItem('userId') ? sessionStorage.getItem('userId') : undefined;
    

    return (point._ownerId === userId) ? <Outlet /> : <Navigate to="/login" />

}
export default GuardedRoutePoint