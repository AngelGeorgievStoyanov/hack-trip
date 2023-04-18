import { FC, useContext } from 'react';
import {  Outlet, useLoaderData } from 'react-router-dom';
import { LoginContext } from '../../App';
import { Comment } from '../../model/comment';
import NotFound from '../NotFound/NotFound';

import jwt_decode from "jwt-decode";

type decode = {
    _id: string
}

let userId: string | undefined;





const GuardedRouteComment: FC = () => {


    const comment = useLoaderData() as Comment;


    const { userL } = useContext(LoginContext);
    const accessToken = userL?.accessToken ? userL.accessToken : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined


    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id !== undefined ? decode._id : undefined;
    }

    return (comment._ownerId === userId) ? <Outlet /> :  <NotFound />

}
export default GuardedRouteComment