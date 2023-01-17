import { BaseSyntheticEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../../model/users';
import * as userService from '../../services/userService'
import { ApiClient } from '../../services/userService';
import { IdType, Optional } from '../../shared/common-types';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';

import './Register.css'
import {  useForm } from 'react-hook-form';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import FormInputText from '../FormFields/FormInputText';



const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users/register');


interface UserProps {
    user: Optional<User>;

}
type FormData = {
    email: string
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    confirmpass: string;

};


const schema = yup.object({
    email: yup.string().required().email(),
    firstName: yup.string().required().min(2).max(15),
    lastName: yup.string().required().min(2).max(15),
    password: yup.string().required().matches(/^(?=(.*[a-zA-Z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/, 'Must contain 8 characters, at least one digit, and one character different from letter or digit'),
    confirmpass: yup.string().test('passwords-match', 'Passwords must match', function (value) { return this.parent.password === value }),


}).required();


export function Register({ user }: UserProps) {
    const navigate = useNavigate();

    const [errorApi, setErrorApi] = useState()



    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({

        defaultValues: { email: '', firstName: '', lastName: '', password: '', confirmpass: '' },

        mode: 'onChange',
        resolver: yupResolver(schema),
    });


    const registerSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {
        event?.preventDefault();

        const newUser = { ...data }




        API_CLIENT.register({ ...newUser })
            .then((user) => {

                sessionStorage.setItem('userId', user._id + '');
                sessionStorage.setItem('email', user.email);
                sessionStorage.setItem('accessToken', user.accessToken ? user.accessToken : '');
                setErrorApi(undefined)
                navigate('/')
            }).catch((err) => {
                setErrorApi(err.message)

                console.log(err.message)
               
            })










    }

    return (
        <>

            <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>


                <Container sx={{ bgcolor: '#cfe8fc', minHeight: '100vh', minWidth: '100vH', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    {errorApi ?
                        <Box component='div' sx={{ backgroundColor: 'red', color: 'black', padding: '10px 20px', borderRadius: '9px', margin:'20px' }}>
                            <Typography component='h4'>
                                {errorApi}
                            </Typography>
                        </Box>
                        : ''}
                    <Box component="form" sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        maxWidth: '600px',
                        maxHeight: '500px',
                        padding: '30px',
                        backgroundColor: '#8d868670',
                        boxShadow: '3px 2px 5px black', border: 'solid 2px', borderRadius: '12px',
                        '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },
                        '& .MuiButton-root': { m: 1, width: '32ch' },
                    }}
                        noValidate
                        autoComplete='0ff'
                        onSubmit={handleSubmit(registerSubmitHandler)}
                    >
                        <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h5">
                            REGISTER
                        </Typography>
                        <FormInputText name='email' label='Email' control={control} error={errors.email?.message}
                            rules={{ required: true, minLength: 5 }} />
                        <FormInputText name='firstName' label='First Name' control={control} error={errors.firstName?.message}
                            rules={{ required: true, minLength: 2, maxLength: 15 }} />

                        <FormInputText name='lastName' label='Last Name' control={control} error={errors.lastName?.message}
                            rules={{ required: true, minLength: 2, maxLength: 15 }} />

                        <FormInputText name='password' label='Password' type='password' control={control} error={errors.password?.message}
                            rules={{ required: true }} />

                        <FormInputText name='confirmpass' label='Confirm Password' type='password' control={control} error={errors.confirmpass?.message}
                            rules={{ required: true }} />
                        <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }}>Sign Up</Button>
                            <Button component={Link} to={'/login'} variant="contained" sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >Already Have An Account?</Button>


                        </Box >

                    </Box>
                </Container>
            </Grid>
        </>
    )

}