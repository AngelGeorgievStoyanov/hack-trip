import { Link, useNavigate } from "react-router-dom";
import { LoginContext } from "../../App";
import { useContext } from 'react'
import './Header.css'
import { User } from "../../model/users";
import { IdType } from "../../shared/common-types";
import * as userService from '../../services/userService'
import { ApiClient } from "../../services/userService";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import jwt_decode from "jwt-decode";



const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users/logout');


type decode = {
    _id: string,
    email: string,
    firstName: string,
    lastName: string,
    role: string
}




export default function Header() {

    const email = sessionStorage.getItem('email')
    const { userL, setUserL } = useContext(LoginContext)




    const accessToken = userL?.accessToken ? userL.accessToken : sessionStorage.getItem('accessToken') ? sessionStorage.getItem('accessToken') : undefined

    let role = 'user'
    if (accessToken) {
        const decode: decode = jwt_decode(accessToken)
        role = decode.role

    }


    const navigate = useNavigate();

    const loginContext = useContext(LoginContext)

    const logout = () => {
        const accessToken = sessionStorage.getItem('accessToken')

        if (accessToken) {

            API_CLIENT.logout(accessToken)
                .then((data) => {

                    sessionStorage.clear()


                    loginContext?.setUserL(null)

                    navigate('/')
                }).catch((err) => {
                    console.log(err)
                })

        }
    }

    return (




        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar sx={{
                    display: 'flex', justifyContent: 'space-between', paddingBottom: '20px', '@media(max-width: 600px)': {
                        display: 'flex', flexDirection: 'column'
                    }
                }}>
                    {userL !== null || email !== null ?
                        <>

                            <Typography variant="h6" component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                {userL !== null || email !== null ?
                                    <Button component={Link} to={'/profile'} color="inherit"  >Welcome  {email}</Button> : 'Welcome'

                                }
                            </Typography>
                            <Button component={Link} to={'/'} color="inherit"  >HOME</Button>
                            <Button component={Link} to={'/trips'} color="inherit">TRIPS</Button>
                            <Button component={Link} to={'/create-trip'} color="inherit">CREATE TRIPS</Button>
                            <Button component={Link} to={'/my-trips'} color="inherit">MY TRIPS</Button>
                            <Button component={Link} to={'/favorites'} color="inherit">MY FAVOTITES</Button>
                            {((role === 'admin') || (role === 'manager')) ? <Button component={Link} to={'/admin'} color="inherit">ADMIN</Button> : ''}
                            <Button onClick={logout} color="inherit">LOGOUT</Button>
                        </>
                        :
                        <>
                            <Button component={Link} to={'/'} color="inherit">HOME</Button>
                            <Button component={Link} to={'/trips'} color="inherit">TRIPS</Button>
                            <Button component={Link} to={'/login'} color="inherit">LOGIN</Button>
                            <Button component={Link} to={'/register'} color="inherit">REGISTER</Button>

                        </>



                    }
                </Toolbar>
            </AppBar>
        </Box>




    )
}