import { useContext } from 'react'

import { Navigate, Outlet } from 'react-router-dom';



import { LoginContext } from '../../App';




const GuardedRoute = () => {


    const { userL, setUserL } = useContext(LoginContext)
    
    const userId = userL?._id ? userL._id : sessionStorage.getItem('userId') ? sessionStorage.getItem('userId') : undefined
    
  
    return userId ? <Outlet /> : <Navigate to="/login" />

}
export default GuardedRoute