import { FC, useContext } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';
import { LoginContext } from "../../hooks/LoginContext";
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

    const { token } = useContext(LoginContext);
    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined



    let role = 'user';

    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;
        userId = decode._id;

    }

    return (point._ownerId === userId) || (role === 'admin' || role === 'manager') ? <Outlet /> : <NotFound />

}
export default GuardedRoutePoint;