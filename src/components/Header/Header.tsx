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

    const navigate = useNavigate();
    const loginContext = useContext(LoginContext);

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






    const logout = () => {
        const accessToken = sessionStorage.getItem('accessToken');

        if (accessToken) {


            API_CLIENT.logout(accessToken)
                .then((data) => {

                    sessionStorage.clear();

                    loginContext?.setUserL(null);
                    email = undefined;
                    userId = undefined;

                    navigate('/login');
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
                        display: 'flex', flexDirection: 'row', flexWrap: 'wrap'
                    }
                }}>
                    {accessToken !== undefined && userVerId === true ?
                        <>

                            <Typography variant="h6" component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                {accessToken !== undefined ?
                                    <Button component={Link} to={'/profile'} color="inherit"  sx={{ ':hover': { fontFamily: 'cursive' } }} >Welcome   {email}</Button> : 'Welcome'

                                }
                            </Typography>
                            <Button component={Link} to={'/'} color="inherit" sx={{ ':hover': { fontFamily: 'cursive' } }} >HOME</Button>
                            <Button component={Link} to={'/trips'} color="inherit" sx={{ ':hover': { fontFamily: 'cursive' } }}>TRIPS</Button>
                            <Button component={Link} to={'/create-trip'} color="inherit" sx={{ ':hover': { fontFamily: 'cursive' } }}>CREATE TRIPS</Button>
                            <Button component={Link} to={'/my-trips'} color="inherit" sx={{ ':hover': { fontFamily: 'cursive' } }}>MY TRIPS</Button>
                            <Button component={Link} to={'/favorites'} color="inherit" sx={{ ':hover': { fontFamily: 'cursive' } }}>MY FAVORITES</Button>
                            <Button component={Link} to={'/about'} color="inherit" sx={{ ':hover': { fontFamily: 'cursive' } }}>ABOUT US</Button>
                            {((role === 'admin') || (role === 'manager')) ? <Button component={Link} to={'/admin'} color="inherit" sx={{ ':hover': { fontFamily: 'cursive' } }}>ADMIN</Button> : ''}
                            <Button onClick={logout} color="inherit" sx={{ ':hover': { fontFamily: 'cursive' } }}>LOGOUT</Button>
                        </>
                        :
                        <>
                            <Button component={Link} to={'/'} color="inherit" sx={{ ':hover': { fontFamily: 'cursive' } }}>HOME</Button>
                            <Button component={Link} to={'/trips'} color="inherit" sx={{ ':hover': { fontFamily: 'cursive' } }}>TRIPS</Button>
                            <Button component={Link} to={'/login'} color="inherit" sx={{ ':hover': { fontFamily: 'cursive' } }}>LOGIN</Button>
                            <Button component={Link} to={'/register'} color="inherit" sx={{ ':hover': { fontFamily: 'cursive' } }}>REGISTER</Button>
                            <Button component={Link} to={'/about'} color="inherit" sx={{ ':hover': { fontFamily: 'cursive' } }}>ABOUT US</Button>
                        </>
                    }
                </Toolbar>
            </AppBar>
        </Box>




    )
}