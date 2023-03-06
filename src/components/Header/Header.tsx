import { Link, useNavigate } from "react-router-dom";
import { LoginContext } from "../../App";
import { useContext, useState } from 'react';
import { User } from "../../model/users";
import { IdType } from "../../shared/common-types";
import * as userService from '../../services/userService';
import { ApiClient } from "../../services/userService";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import jwt_decode from "jwt-decode";



const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');


type decode = {
    email: string,
    role: string,
    _id: string
}



let email: string | undefined;
let userId: string | undefined;

export default function Header() {

    const { userL } = useContext(LoginContext);
    const [userVerId, setUserVerId] = useState<boolean>(false)

    const accessToken = userL?.accessToken ? userL.accessToken : sessionStorage.getItem('accessToken') ? sessionStorage.getItem('accessToken') : undefined;

    let role = 'user'
    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;
        email = decode.email;
        userId = decode._id
    }


    if (userId !== undefined && userId !== null) {
        API_CLIENT.findUserId(userId).then((data) => {
            setUserVerId(data)
        }).catch((err) => {
            console.log(err)
        })
    }


    const navigate = useNavigate();

    const loginContext = useContext(LoginContext);



    const logout = () => {
        const accessToken = sessionStorage.getItem('accessToken');

        if (accessToken) {


            API_CLIENT.logout(accessToken)
                .then((data) => {

                    sessionStorage.clear();


                    loginContext?.setUserL(null);
                    email = undefined;


                    navigate('/');
                }).catch((err) => {
                    console.log(err);
                });

        }
    }

    return (

        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar sx={{
                    display: 'flex', justifyContent: 'space-between', paddingBottom: '20px', '@media(max-width: 760px)': {
                        display: 'flex', flexDirection: 'column'
                    }
                }}>
                    {accessToken !== undefined && userVerId === true ?
                        <>

                            <Typography variant="h6" component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                {accessToken !== undefined ?
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