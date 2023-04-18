import { FC, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User } from "../../model/users";
import { IdType } from "../../shared/common-types";
import * as userService from '../../services/userService';
import { ApiClient } from "../../services/userService";
import { Grid, Typography } from "@mui/material";

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');



const Users: FC = () => {

    const userId = useParams().userId;
    const token = useParams().token;

    const navigate = useNavigate()

    useEffect(() => {


        if (userId && token) {

            API_CLIENT.verifyEmail(userId, token).then((data) => {
                if (data === true) {
                    navigate('/login')

                } else {
                    navigate('/register')
                }
            }).catch((err) => {
                console.log(err)
            })
        }

    }, [])

    return (
        <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh', '@media(max-width: 900px)': { display: 'flex', width: '100vw', padding: '0', margin: '0' } }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            <Typography sx={{ fontFamily: 'cursive' }} variant='h4'>LOADING ...</Typography>
        </Grid>
    )
}

export default Users;
