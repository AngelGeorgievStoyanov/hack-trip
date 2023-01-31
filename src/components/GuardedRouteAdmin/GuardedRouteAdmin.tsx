import { useContext } from 'react'
import { LoginContext } from '../../App';
import { Outlet } from 'react-router-dom';
import jwt_decode from "jwt-decode";
import NotFound from '../NotFound/NotFound';



type decode = {
    _id: string,
    email: string,
    firstName: string,
    lastName: string,
    role: string
}



const GuardedRouteAdmin = () => {


    const { userL, setUserL } = useContext(LoginContext)

    const userId = userL?._id ? userL._id : sessionStorage.getItem('userId') ? sessionStorage.getItem('userId') : undefined
    const accessToken = userL?.accessToken ? userL.accessToken : sessionStorage.getItem('accessToken') ? sessionStorage.getItem('accessToken') : undefined

    let role = 'user'
    if (accessToken) {
        const decode: decode = jwt_decode(accessToken)
        role = decode.role

        console.log(role)

    }

    return ((role === 'admin') || (role === 'manager')) ? <Outlet /> : <NotFound />

}
export default GuardedRouteAdmin