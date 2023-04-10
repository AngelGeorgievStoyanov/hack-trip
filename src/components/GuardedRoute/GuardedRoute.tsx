import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { LoginContext } from '../../App';
import jwt_decode from "jwt-decode";

type decode = {
    _id: string;
}

let userId: string | undefined;


const GuardedRoute = () => {

    const { userL } = useContext(LoginContext);

    const accessToken = userL?.accessToken ? userL.accessToken : sessionStorage.getItem('accessToken') ? sessionStorage.getItem('accessToken') : undefined


    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id !== undefined ? decode._id : undefined;
    }



    return userId !==undefined ? <Outlet /> : <Navigate to="/login" />

}
export default GuardedRoute