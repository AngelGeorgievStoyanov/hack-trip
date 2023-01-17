import { Link, useNavigate } from "react-router-dom";
// import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
// import { LinkProps } from '@mui/material/Link';
import { LoginContext } from "../../App";
import { useContext } from 'react'
import './Header.css'
import { User } from "../../model/users";
import { IdType } from "../../shared/common-types";
import * as userService from '../../services/userService'
import { ApiClient } from "../../services/userService";
import { AppBar, Box, Button,  Toolbar, Typography } from "@mui/material";

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users/logout');

export default function Header() {

    const email = sessionStorage.getItem('email')
    const { userL, setUserL } = useContext(LoginContext)
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
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '20px' }}>
                    {userL !== null || email !== null ?
                        <>

                            <Typography variant="h6" component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                Welcome  {userL !== null ? userL.email : email}
                            </Typography>
                            <Button component={Link} to={'/'} color="inherit"  >HOME</Button>
                            <Button component={Link} to={'/trips'} color="inherit">TRIPS</Button>
                            <Button component={Link} to={'/create-trip'} color="inherit">CREATE TRIPS</Button>
                            <Button component={Link} to={'/my-trips'} color="inherit">MY TRIPS</Button>
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