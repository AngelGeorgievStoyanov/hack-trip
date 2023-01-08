import { Link } from "react-router-dom";

import './Header.css'


export default function Header() {

    const userId = localStorage.getItem('userId')

    return (

        <header className="header">
            <nav className="nav">
                {userId ?
                    <>
                        <li className="nav-li"><Link to={'/'}>Home</Link></li>
                        <li className="nav-li"><Link to={'/trips'}>Trips</Link></li>
                        <li className="nav-li"><Link to={'/create-trip'}>Create Trip</Link></li>
                        <li className="nav-li"><Link to={'/logout'}>Logout</Link></li>
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