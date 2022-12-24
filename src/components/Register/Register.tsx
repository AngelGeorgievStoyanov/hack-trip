import { BaseSyntheticEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../../model/users';
import * as userService from '../../services/userService'
import { ApiClient } from '../../services/userService';
import { IdType, Optional } from '../../shared/common-types';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';

import './Register.css'
import { useForm } from 'react-hook-form';
import { Box, Button } from '@mui/material';
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
    const { control, handleSubmit, formState: { errors, isDirty, isValid } } = useForm<FormData>({


        mode: 'onChange',
        resolver: yupResolver(schema),
    });


    const registerSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {
        event?.preventDefault();

        const newUser = { ...data }
        // const data = Object.fromEntries(new FormData(e.currentTarget))
        // const email = data.email + ''
        // const firstName = data.firstName + ''
        // const lastName = data.lastName + ''
        // const password = data.password + ''

        API_CLIENT.register({ ...newUser }).then((authData) => {
            console.log(authData)

            navigate('/')
        }).catch(err => console.log(err.message))



    }

    return (
        <>
            <section id="register-section">
                <article className='article-register'>

                    <Box component="form" sx={{
                        padding: '30px',
                        backgroundColor: '#ddf',
                        '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },
                        '& .MuiButton-root': { m: 1, width: '32ch' },
                    }}
                        noValidate
                        autoComplete='0ff'
                        onSubmit={handleSubmit(registerSubmitHandler)}
                    >
                        <FormInputText name='email' label='Email' control={control} error={errors.email?.message}
                            rules={{ required: true, minLength: 5 }} />
                        <FormInputText name='firstName' label='First Name' control={control} error={errors.firstName?.message}
                            rules={{ required: true, minLength: 2, maxLength: 15 }} />

                        <FormInputText name='lastName' label='Last Name' control={control} error={errors.lastName?.message}
                            rules={{ required: true, minLength: 2, maxLength: 15 }} />

                        <FormInputText name='password' label='Password' control={control} error={errors.password?.message}
                            rules={{ required: true }} />

                        <FormInputText name='confirmpass' label='Confirm Password' control={control} error={errors.confirmpass?.message}
                            rules={{ required: true }} />
                        <span>
                            <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }}>Sign Up</Button>
                            <Button variant="contained" href='/login' sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >Already Have An Account?</Button>
                        </span>

                    </Box>
                </article>
            </section>
        </>
    )

}