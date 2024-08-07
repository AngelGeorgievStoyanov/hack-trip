import { FC, useContext, useEffect, useState } from 'react';
import { LoginContext } from "../../hooks/LoginContext";
import { Outlet } from 'react-router-dom';
import jwt_decode from "jwt-decode";
import NotFound from '../NotFound/NotFound';
import * as userService from '../../services/userService';
import { User } from '../../model/users';
import { IdType } from '../../shared/common-types';
import { ApiClient } from '../../services/userService';


type decode = {
    _id: string,
    role: string
}

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');

let userId: IdType;

const GuardedRouteAdmin: FC = () => {

    const [guard, setGuard] = useState<boolean>(false);
    const { token } = useContext(LoginContext);
    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined
    let role = 'user';

    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;
        userId = decode._id;
    }

    useEffect(() => {
        if ((role === 'admin' || role === 'manager') && token) {
            API_CLIENT.guardedRoute(userId, role, token).then((data) => {
                setGuard(data);
            })
        } else {
            setGuard(false)
        }


    }, [token, guard])



    return (((role === 'admin') || (role === 'manager')) && (guard === true)) ? <Outlet /> : <NotFound />

}
export default GuardedRouteAdmin;