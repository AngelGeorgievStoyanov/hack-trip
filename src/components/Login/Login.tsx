import { useForm } from 'react-hook-form';
import { Box, Button } from '@mui/material';

import { useNavigate } from 'react-router-dom';
import FormInputText from '../FormFields/FormInputText';
import * as userService from '../../services/userService'

import './Login.css'
import { BaseSyntheticEvent } from 'react';
import { ApiClient } from '../../services/userService';
import { IdType } from '../../shared/common-types';
import { User } from '../../model/users';

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users/login');


type FormData = {
    email: string
    password: string;

};

export function Login() {
    const navigate = useNavigate();
    const { control, handleSubmit, formState: { errors} } = useForm<FormData>({


        mode: 'onChange',
        //  resolver: yupResolver(schema),
    });



    const loginSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {
        event?.preventDefault();





        API_CLIENT.login(data.email, data.password)
            .then((user) => {

                console.log(user)
                localStorage.setItem('userId', user._id + '');
                localStorage.setItem('email', user.email);
                localStorage.setItem('accessToken', user.accessToken ? user.accessToken : '');
                navigate('/')
            }).catch((err) => {
                console.log(err.message)
                throw new Error(err.message)
            })


    }




    return (
        <>

            <section className='section-login' >
                <div className="div-login-form">

                    <Box component="form" sx={{

                        padding: '30px',
                        backgroundColor: '#ddf',
                        '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },
                        '& .MuiButton-root': { m: 1, width: '32ch' },
                    }}
                        noValidate
                        autoComplete='0ff'
                        onSubmit={handleSubmit(loginSubmitHandler)}
                    >
                        <FormInputText name='email' label='Email' control={control} error={errors.email?.message}
                            rules={{ required: true, minLength: 5 }} />

                        <FormInputText name='password' label='Password' control={control} error={errors.password?.message}
                            rules={{ required: true }} />


                        <span>
                            <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }}>Sign Up</Button>
                            <Button variant="contained" href='/register' sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >Don't Have An Account? Sign up!</Button>
                        </span>

                    </Box>
                </div >
            </section >
        </>
    )
}