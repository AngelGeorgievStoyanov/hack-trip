import { Link, useNavigate } from "react-router-dom";
import { LoginContext } from "../../App";
import { useContext } from 'react'
import './Header.css'
import { User } from "../../model/users";
import { IdType } from "../../shared/common-types";
import * as userService from '../../services/userService'
import { ApiClient } from "../../services/userService";

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users/logout');

export default function Header() {

    const email = sessionStorage.getItem('email')
    const { userL, setUserL } = useContext(LoginContext)
    const navigate = useNavigate();

    const loginContext = useContext(LoginContext)

    const logout = () => {
        const accessToken = sessionStorage.getItem('accessToken')

        if (accessToken) {
            console.log(accessToken)

            API_CLIENT.logout(accessToken)
                .then((data) => {
                    console.log(data)
                    sessionStorage.clear()
                    loginContext?.setUserL(null)

                    navigate('/')
                }).catch((err) => {
                    console.log(err)
                })

        }
    }

    return (

        <header className="header">
            <nav className="nav">
                {
                    userL !== null || email !== null ?
                        <>
                            <li className="nav-li">Welcome  {userL !== null ? userL.email : email}</li>
                            <li className="nav-li"><Link to={'/'}>Home</Link></li>
                            <li className="nav-li"><Link to={'/trips'}>Trips</Link></li>
                            <li className="nav-li"><Link to={'/create-trip'}>Create Trip</Link></li>
                            <li className="nav-li"><Link to={'/my-trips'}>My Trips</Link></li>
                            <li className="nav-li"><button className="btn-logout" onClick={logout}>Logout</button></li>
                        </>
                        :
                        <>
                            <li className="nav-li"><Link to={'/'}>Home</Link></li>
                            <li className="nav-li"><Link to={'/trips'}>Trips</Link></li>
                            <li className="nav-li"><Link to={'/login'}>Login</Link></li>
                            <li className="nav-li"><Link to={'/register'}>Register</Link></li>
                        </>}
            </nav>
        </header>

    )
}