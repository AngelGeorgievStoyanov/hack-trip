import { FC, useContext } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';
import { LoginContext } from '../../App';
import { Point } from '../../model/point';
import jwt_decode from "jwt-decode";
import NotFound from '../NotFound/NotFound';




type decode = {
    _id: string,
    role: string
}
let userId: string | undefined;


const GuardedRoutePoint: FC = () => {


    const point = useLoaderData() as Point;

    const { userL } = useContext(LoginContext);
    const accessToken = userL?.accessToken ? userL.accessToken : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined



    let role = 'user';

    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;
        userId = decode._id;

    }

    return (point._ownerId === userId) || (role === 'admin' || role === 'manager') ? <Outlet /> : <NotFound />

}
export default GuardedRoutePoint;