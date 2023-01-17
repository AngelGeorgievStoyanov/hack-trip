import{useContext} from 'react'

import { Navigate, Outlet } from 'react-router-dom';



import { LoginContext } from '../../App';




const GuardedRoute = () => {

    const loginContext = useContext(LoginContext)



    const userId = sessionStorage.getItem('userId')


    return userId ? <Outlet /> : <Navigate to="/login" />

}
export default GuardedRoute