import { Button, Card, CardMedia, Typography } from "@mui/material";
import { User } from "../../../model/users";
import { Link } from 'react-router-dom';
import { FC, ReactElement, useContext } from "react";
import { LoginContext } from "../../../App";
import jwt_decode from "jwt-decode";


type decode = {
    role: string
}


interface UserCardProps {
    user: User;

}


const UserCard: FC<UserCardProps> = ({ user }): ReactElement => {

    const dateFormat = (date: string) => {
        return date.split('.')[0].split('T')[0].split('-').reverse().join('-');
    }


    let oneDay = 60 * 60 * 24 * 1000
    let timeCreatedPlusOneDay = Date.parse(user.timeCreated ? user.timeCreated : new Date().toISOString()) + oneDay
    let now = Date.parse(new Date().toISOString())

    const { token } = useContext(LoginContext);

    const userRole = user.role as any as string;

    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    let role = 'user';
    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;
    }

    return (
        <>
            {(role === 'admin') ?
                <Card sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '300px', margin: '20px',
                    height: 'fit-content',
                    padding: '25px', backgroundColor: '#8d868670',
                    boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px'
                }}>
                    <Typography gutterBottom variant="h5" component="div">
                        User ID :{user._id}
                    </Typography>
                    <Typography gutterBottom variant="h5" component="div">
                        First Name: {user.firstName}
                    </Typography>
                    <Typography gutterBottom variant="h5" component="div">
                        Last Name: {user.lastName}
                    </Typography>
                    {user.imageFile ?
                        <CardMedia
                            component="img"
                            height="200"
                            image={`https://storage.googleapis.com/hack-trip/${user.imageFile}`}
                            alt="USER"
                        />
                        : ''}
                    <Typography gutterBottom variant="h5" color={user.verifyEmail === 0 && (timeCreatedPlusOneDay < now) ? 'red' : ''} component="div">
                        Email: {user.email}
                    </Typography> <Typography gutterBottom variant="subtitle1" component="div">
                        Profile created on: {dateFormat(user.timeCreated!)}
                    </Typography> <Typography gutterBottom variant="subtitle1" component="div">
                        Profile last edited on: {dateFormat(user.timeEdited!)}
                    </Typography> <Typography gutterBottom variant="subtitle1" component="div">
                        Count of logs: {user.countOfLogs}
                    </Typography> <Typography gutterBottom variant="subtitle1" component="div">
                        Last Login: {dateFormat(user.lastTimeLogin!)}
                    </Typography>
                    {((user._id !== null) && (role === 'admin')) ?
                        <>
                            <Button component={Link} to={`/admin/edit/${user._id}`} variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, padding: '10px 50px' }}>EDIT USER</Button>
                        </>
                        : ''}
                </Card>
                : ((role === 'manager') && (userRole !== 'admin')) ?
                    <Card sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        maxWidth: '300px', margin: '20px',
                        height: 'fit-content',
                        padding: '25px', backgroundColor: '#8d868670',
                        boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px'
                    }}>
                        <Typography gutterBottom variant="h5" component="div">
                            User ID :{user._id}
                        </Typography>
                        <Typography gutterBottom variant="h5" component="div">
                            First Name: {user.firstName}
                        </Typography>
                        <Typography gutterBottom variant="h5" component="div">
                            Last Name: {user.lastName}
                        </Typography>
                        {user.imageFile ?
                            <CardMedia
                                component="img"
                                height="200"
                                image={`https://storage.googleapis.com/hack-trip/${user.imageFile}`}
                                alt="USER"
                            />
                            : ''}
                        <Typography gutterBottom variant="h5" component="div">
                            Email: {user.email}
                        </Typography> <Typography gutterBottom variant="subtitle1" component="div">
                            Profile created on: {dateFormat(user.timeCreated!)}
                        </Typography> <Typography gutterBottom variant="subtitle1" component="div">
                            Profile last edited on: {dateFormat(user.timeEdited!)}
                        </Typography> <Typography gutterBottom variant="subtitle1" component="div">
                            Caount of logs: {user.countOfLogs}
                        </Typography> <Typography gutterBottom variant="subtitle1" component="div">
                            Last Login: {dateFormat(user.lastTimeLogin!)}
                        </Typography>
                        {((user._id !== null) && (role === 'manager')) ?
                            <>
                                <Button component={Link} to={`/admin/edit/${user._id}`} variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, padding: '10px 50px' }}>EDIT USER</Button>
                            </>

                            : ''}

                    </Card>
                    : ''}
        </>
    )
}

export default UserCard;