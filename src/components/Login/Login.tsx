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
import {
    EReCaptchaV2Size, EReCaptchaV2Theme, ReCaptchaProvider, ReCaptchaV2, ReCaptchaV3,
    TReCaptchaV2Callback, TReCaptchaV3Callback, TReCaptchaV3RefreshToken
} from 'react-recaptcha-x';

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');

const reCaptchaV2 = process.env.REACT_APP_SITE_KEY2;
const reCaptchaV3 = process.env.REACT_APP_SITE_KEY3;

type FormData = {
    email: string;
    password: string;

};

const schema1 = yup.object({
    email: yup.string().required().email(),

}).required();

const schema2 = yup.object({
    email: yup.string().required().email(),
    password: yup.string().required().matches(/^(?!\s+$).*/, 'Password cannot be empty string.'),

}).required();

export function Login() {





    const navigate = useNavigate();

    const loginContext = useContext(LoginContext);
    const [errorApi, setErrorApi] = useState<string>();
    const [forgotPassword, setForgotPassword] = useState<boolean>(false)
    const [verified, setVerified] = useState<boolean>(false)
    const [registerMessage, setRegisterMessage] = useState<string>()

    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({

        defaultValues: { email: '', password: '' },
        mode: 'onChange',
        resolver: yupResolver(forgotPassword === true ? schema1 : schema2),

    });




    const loginSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {
        event?.preventDefault();
        data.email = data.email.trim();
        data.password = data.password.trim();

        if (!forgotPassword) {

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

        } else {

            API_CLIENT.forgotPassword(data.email).then((message) => {

                setErrorApi(undefined);
                setRegisterMessage(message)
            }).catch((err) => {
                setErrorApi(err.message);
                console.log(err.message);
            })

        }

    }

    if (errorApi) {

        setTimeout(() => {
            setErrorApi(undefined)
        }, 5000)


    }


    const onForgotPassword = () => {
        setForgotPassword(!forgotPassword)
    }

    const v2Callback: TReCaptchaV2Callback = (
        token: string | false | Error
    ): void => {
        if (typeof token === 'string') {
            setVerified(true)
            setErrorApi(undefined)
        } else if (typeof token === 'boolean' && !token) {
            setVerified(false)
            setErrorApi('User must check the checkbox again')

        } else if (token instanceof Error) {
            setVerified(false)
            setErrorApi('Please check your network connection')

        }
    };

    const v3Callback: TReCaptchaV3Callback = (
        token: string | void,
        refreshToken: TReCaptchaV3RefreshToken | void
    ): void => {
        if (typeof token === 'string') {
            setVerified(true);
            setErrorApi(undefined);
         
            if (typeof refreshToken === 'function') {
             
                setVerified(true);
            setErrorApi(undefined);
            }
        } else {
            console.log('token retrieval in progress...');
        }
    };


    if (registerMessage) {

        setTimeout(() => {
            setErrorApi(undefined);
            setRegisterMessage(undefined);
            navigate('/')
        }, 10000)

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
                    {registerMessage ?
                        <Box component='div' sx={{ backgroundColor: '#1976d2', color: 'white', padding: '10px 20px', borderRadius: '9px', margin: '20px' }}>
                            <Typography component='h3'>
                                {registerMessage}
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
                            {forgotPassword ? 'FORGOT PASSWORD' : 'LOGIN'}
                        </Typography>
                        <FormInputText name='email' label='Email' control={control} error={errors.email?.message}
                            rules={{ required: true, minLength: 5 }} />

                        {!forgotPassword ? <FormInputText name='password' type='password' label='Password' control={control} error={errors.password?.message}
                            rules={{ required: true }} /> : ''}


                        <Box >
                            <Button variant="contained" disabled={forgotPassword && !verified ? true : registerMessage ? true : false} type='submit' sx={{ ':hover': { background: '#4daf30' }, margin: '5px' }}>{forgotPassword ? 'Send Email' : 'Sign Up'}</Button>
                            {!forgotPassword ? <Button variant="contained" component={Link} to={'/register'} sx={{ ':hover': { color: 'rgb(248 245 245)' }, margin: '5px', background: 'rgb(194 194 224)', color: 'black' }}  >Don't Have An Account? Sign up!</Button> : ''}
                            <Button variant="contained" onClick={onForgotPassword} sx={{ ':hover': { color: 'rgb(248 245 245)' }, margin: '5px', background: 'rgb(194 194 224)', color: 'black' }}  >{forgotPassword ? 'Back in Login' : 'Forgot Password'}</Button>
                        </Box >
                    </Box>
                    {forgotPassword ?
                        <Box sx={{ display: 'flex', margin: '30px' }}>

                            <ReCaptchaProvider
                                siteKeyV2={reCaptchaV2}
                                siteKeyV3={reCaptchaV3}
                                langCode="en"
                                hideV3Badge={false}
                            >

                                <ReCaptchaV2
                                    callback={v2Callback}
                                    theme={EReCaptchaV2Theme.Light}
                                    size={EReCaptchaV2Size.Normal}
                                    id="my-id"
                                    data-test-id="my-test-id"
                                    tabindex={0}
                                />
                                <ReCaptchaV3 action="youraction" callback={v3Callback} />
                            </ReCaptchaProvider>

                        </Box>
                        : ''}


                </Container>
            </Grid>
        </>
    )
}