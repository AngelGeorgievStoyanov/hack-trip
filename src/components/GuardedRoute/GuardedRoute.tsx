import{useContext} from 'react'

import { Navigate, Outlet } from 'react-router-dom';



import { LoginContext } from '../../App';




const GuardedRoute = () => {

    const loginContext = useContext(LoginContext)

    console.log(loginContext)


    const userId = sessionStorage.getItem('userId')
    console.log(userId)


    return userId ? <Outlet /> : <Navigate to="/login" />

}
export default GuardedRoute