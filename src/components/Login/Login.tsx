import { useForm } from 'react-hook-form';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import FormInputText from '../FormFields/FormInputText';
import * as userService from '../../services/userService';
import * as yup from "yup";
import { BaseSyntheticEvent, useContext, useState } from 'react';
import { ApiClient } from '../../services/userService';
import { IdType } from '../../shared/common-types';
import { User } from '../../model/users';
import { LoginContext } from '../../App';
import { yupResolver } from '@hookform/resolvers/yup';

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');


type FormData = {
    email: string;
    password: string;

};



const schema = yup.object({
    email: yup.string().required().email(),
    password: yup.string().required().matches(/^(?!\s+$).*/, 'Password cannot be empty string.'),

}).required();

export function Login() {


    const navigate = useNavigate();

    const loginContext = useContext(LoginContext);
    const [errorApi, setErrorApi] = useState<string>();

    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({

        defaultValues: { email: '', password: '' },
        mode: 'onChange',
        resolver: yupResolver(schema),

    });




    const loginSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {
        event?.preventDefault();
        data.email = data.email.trim();
        data.password = data.password.trim();



        API_CLIENT.login(data.email, data.password)
            .then((user) => {
                sessionStorage.setItem('userId', user._id + '');
                sessionStorage.setItem('accessToken', user.accessToken ? user.accessToken : '');
                if (user !== undefined) {


                    loginContext?.setUserL({ ...user });
                }

                setErrorApi(undefined);
                navigate('/');
            }).catch((err) => {
                if (err.message === 'Failed to fetch') {
                    err.message = 'No internet connection with server.Please try again later.'
                }
                setErrorApi(err.message);
                console.log(err.message);

            });



    }

    if (errorApi) {

        setTimeout(() => {
            setErrorApi(undefined)
        }, 5000)


    }




   
    return (
        <>
            <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Container sx={{ bgcolor: '#cfe8fc', minHeight: '100vh', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', '@media(max-width: 600px)': { display: 'flex' } }}>
                    {errorApi ?
                        <Box component='div' sx={{ backgroundColor: 'red', color: 'black', padding: '10px 20px', borderRadius: '9px', margin: '20px' }}>
                            <Typography component='h4'>
                                {errorApi}
                            </Typography>
                        </Box>
                        : ''}
                  
                    <Box component="form" sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        maxWidth: '700px',
                        maxHeight: '385px',
                        padding: '30px',
                        backgroundColor: '#8d868670',
                        boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px',
                        '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },

                        '@media(max-width: 600px)': { display: 'flex' },
                        '@media(min-width: 600px)': { '& .MuiButton-root': { m: 1, width: '32ch' } }

                    }}
                        noValidate
                        autoComplete='0ff'
                        onSubmit={handleSubmit(loginSubmitHandler)}
                    >
                        <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h5">
                            LOGIN
                        </Typography>
                        <FormInputText name='email' label='Email' control={control} error={errors.email?.message}
                            rules={{ required: true, minLength: 5 }} />

                        <FormInputText name='password' type='password' label='Password' control={control} error={errors.password?.message}
                            rules={{ required: true }} />

                        <Box >
                            <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, margin: '5px' }}>Sign Up</Button>
                            <Button variant="contained" component={Link} to={'/register'} sx={{ ':hover': { color: 'rgb(248 245 245)' }, margin: '5px', background: 'rgb(194 194 224)', color: 'black' }}  >Don't Have An Account? Sign up!</Button>
                            <Button variant="contained" component={Link} to={'/forgot-password'} sx={{ ':hover': { color: 'rgb(248 245 245)' }, margin: '5px', background: 'rgb(194 194 224)', color: 'black' }}  >Forgot Password</Button>
                        </Box >
                    </Box>
                </Container>
            </Grid>
        </>
    )
}