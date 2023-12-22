import { Link, useNavigate } from "react-router-dom";
import { LoginContext } from "../../App";
import { FC, useContext, useState } from 'react';
import { User } from "../../model/users";
import { IdType } from "../../shared/common-types";
import * as userService from '../../services/userService';
import { ApiClient } from "../../services/userService";
import { AppBar, Box, Button, Divider, Drawer, Toolbar, Typography, useMediaQuery } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import jwt_decode from "jwt-decode";
import React from "react";



const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');


type decode = {
    email: string,
    role: string,
    _id: string
}



let email: string | undefined;
let userId: string | undefined;


type Anchor = 'left';

const Header: FC = () => {


    const { token } = useContext(LoginContext);
    const [userVerId, setUserVerId] = useState<boolean>(false)
    const [side, setSide] = useState({ left: false })

    const navigate = useNavigate();
    const loginContext = useContext(LoginContext);

    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    let role = 'user';

    const iconMenu = useMediaQuery('(max-width:900px)');


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

        const accessToken = localStorage.getItem('accessToken');

        if (accessToken) {


            API_CLIENT.logout(accessToken)
                .then((data) => {
                    loginContext?.logoutUser();
                    navigate('/login');
                }).catch((err) => {
                    console.log(err);
                });

        }
    }

    const onSideBar =
        (anchor: Anchor, open: boolean) =>
            (event: React.KeyboardEvent | React.MouseEvent) => {
                if (
                    event.type === 'keydown' &&
                    ((event as React.KeyboardEvent).key === 'Tab' ||
                        (event as React.KeyboardEvent).key === 'Shift')
                ) {
                    return;
                }

                setSide({ ...side, [anchor]: open });
            };




    const list = (anchor: Anchor) => (
        <Box
            sx={{ display: 'flex', flexDirection: 'column', width: 220 }}
            role="presentation"
            onClick={onSideBar(anchor, false)}
            onKeyDown={onSideBar(anchor, false)}
        >

            <Button component={Link} to={'/'} color="inherit"  >HOME</Button>
            <Divider />
            <Button component={Link} to={'/trips'} color="inherit" >TRIPS</Button>
            <Divider />
            <Button component={Link} to={'/create-trip'} color="inherit" >CREATE TRIP</Button>
            <Divider />
            <Button component={Link} to={'/my-trips'} color="inherit" >MY TRIPS</Button>
            <Divider />
            <Button component={Link} to={'/create-live-trip'} color="inherit" >LIVE TRIP TRACKING</Button>
            <Divider />
            <Button component={Link} to={'/favorites'} color="inherit" >MY FAVORITES</Button>
            <Divider />
            <Button component={Link} to={'/about'} color="inherit" >ABOUT US</Button>
            <Divider />
            {((role === 'admin') || (role === 'manager')) ? <> <Button component={Link} to={'/admin'} color="inherit" >ADMIN</Button> <Divider /></> : ''}
            <Button onClick={logout} color="inherit" >LOGOUT</Button>
        </Box>
    )


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
                            {iconMenu ?
                                <>
                                    <Typography variant="h6" component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        {accessToken !== undefined ?
                                            <Button component={Link} to={'/profile'} color="inherit"  >Welcome   {email}</Button> : 'Welcome'

                                        }
                                    </Typography>

                                    {(['left'] as const).map((anchor) => (
                                        <React.Fragment key={anchor}  >
                                            {!side.left ?
                                                <MenuIcon fontSize="large" onClick={onSideBar(anchor, true)} />
                                                : <CloseIcon fontSize="large" onClick={onSideBar(anchor, true)} />
                                            }

                                            <Drawer
                                                anchor={anchor}
                                                open={side[anchor]}
                                                onClose={onSideBar(anchor, false)}

                                                PaperProps={{
                                                    elevation: 12,
                                                    sx: { height: 'auto' }
                                                }}
                                            >

                                                {list(anchor)}

                                            </Drawer>

                                        </React.Fragment>
                                    ))}

                                </>
                                :
                                <>
                                    <Typography variant="h6" component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        {accessToken !== undefined ?
                                            <Button component={Link} to={'/profile'} color="inherit"  >Welcome   {email}</Button> : 'Welcome'

                                        }
                                    </Typography>
                                    <Button component={Link} sx={{ margin: '2px', padding: '2px', boxSizing: 'content-box' }} to={'/'} color="inherit"  >HOME</Button>
                                    <Button component={Link} sx={{ margin: '2px', padding: '2px', boxSizing: 'content-box' }} to={'/trips'} color="inherit" >TRIPS</Button>
                                    <Button component={Link} sx={{ margin: '2px', padding: '2px', boxSizing: 'content-box' }} to={'/create-trip'} color="inherit" >CREATE TRIP</Button>
                                    <Button component={Link} sx={{ margin: '2px', padding: '2px', boxSizing: 'content-box' }} to={'/my-trips'} color="inherit" >MY TRIPS</Button>
                                    <Button component={Link} sx={{ margin: '2px', padding: '2px', boxSizing: 'content-box' }} to={'/create-live-trip'} color="inherit" >LIVE TRIP TRACKING</Button>
                                    <Button component={Link} sx={{ margin: '2px', padding: '2px', boxSizing: 'content-box' }} to={'/favorites'} color="inherit" >MY FAVORITES</Button>
                                    <Button component={Link} sx={{ margin: '2px', padding: '2px', boxSizing: 'content-box' }} to={'/about'} color="inherit" >ABOUT US</Button>
                                    {((role === 'admin') || (role === 'manager')) ? <Button component={Link} sx={{ margin: '2px', padding: '2px', boxSizing: 'content-box' }} to={'/admin'} color="inherit" >ADMIN</Button> : ''}
                                    <Button onClick={logout} sx={{ margin: '2px', padding: '2px', boxSizing: 'content-box' }} color="inherit" >LOGOUT</Button>
                                </>
                            }
                        </>
                        :
                        <>
                            <Button component={Link} sx={{ margin: '2px', padding: '2px', boxSizing: 'content-box' }} to={'/'} color="inherit" >HOME</Button>
                            <Button component={Link} sx={{ margin: '2px', padding: '2px', boxSizing: 'content-box' }} to={'/trips'} color="inherit" >TRIPS</Button>
                            <Button component={Link} sx={{ margin: '2px', padding: '2px', boxSizing: 'content-box' }} to={'/login'} color="inherit" >LOGIN</Button>
                            <Button component={Link} sx={{ margin: '2px', padding: '2px', boxSizing: 'content-box' }} to={'/register'} color="inherit" >REGISTER</Button>
                            <Button component={Link} sx={{ margin: '2px', padding: '2px', boxSizing: 'content-box' }} to={'/about'} color="inherit" >ABOUT US</Button>
                        </>}

                </Toolbar>
            </AppBar>
        </Box >

    )
}

export default Header;