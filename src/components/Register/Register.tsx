import { BaseSyntheticEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, UserRole, UserStatus } from '../../model/users';
import * as userService from '../../services/userService'
import { ApiClient } from '../../services/userService';
import { IdType, Optional, toIsoDate } from '../../shared/common-types';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import FormInputText from '../FormFields/FormInputText';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {
    EReCaptchaV2Size, EReCaptchaV2Theme, ReCaptchaProvider, ReCaptchaV2, ReCaptchaV3,
    TReCaptchaV2Callback, TReCaptchaV3Callback, TReCaptchaV3RefreshToken
} from 'react-recaptcha-x';

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users/register');


interface UserProps {
    user: Optional<User>;

}
type FormData = {
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    confirmpass: string;
    timeCreated: string;
    timeEdited: string | undefined;
    lastTimeLogin: string | undefined;
    countOfLogs: string | undefined;
    status: UserStatus.ACTIVE;
    role: UserRole.user;

};


const schema = yup.object({
    email: yup.string().required().email(),
    firstName: yup.string().required().min(2).max(15).matches(/^(?!\s+$).*(\S{2})/, 'First Name cannot be empty string and must contain at least 2 characters .'),
    lastName: yup.string().required().min(2).max(15).matches(/^(?!\s+$).*(\S{2})/, 'Last Name cannot be empty string and must contain at least 2 characters .'),
    password: yup.string().required().matches(/^(?=(.*[a-zA-Z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/, 'Password must contain 8 characters, at least one digit, and one character different from letter or digit'),
    confirmpass: yup.string().test('passwords-match', 'Passwords must match', function (value) { return this.parent.password === value }),


}).required();

const reCaptchaV2 = process.env.REACT_APP_SITE_KEY2;
const reCaptchaV3 = process.env.REACT_APP_SITE_KEY3;

export function Register({ user }: UserProps) {
    const navigate = useNavigate();

    const [errorApi, setErrorApi] = useState();
    const [registerMessage, setRegisterMessage] = useState<string>()
    const [checkedPrivacyPolicy, setCheckedPrivacyPolicy] = useState<boolean>(false)
    const [verified, setVerified] = useState<boolean>(false)
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({

        defaultValues: { email: '', firstName: '', lastName: '', password: '', confirmpass: '', timeCreated: '', timeEdited: '', lastTimeLogin: '', countOfLogs: '', status: UserStatus.ACTIVE, role: UserRole.user },

        mode: 'onChange',
        resolver: yupResolver(schema),
    });


    const registerSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {
        event?.preventDefault();

        if (verified) {
            alert('You have successfully subscibed!')
        } else {
            alert('Please verify that you are a human!')
            return
        }

        data.timeCreated = toIsoDate(new Date());
        data.timeEdited = toIsoDate(new Date());
        data.lastTimeLogin = toIsoDate(new Date());
        data.countOfLogs = '1';
        data.email = data.email.trim();
        data.firstName = data.firstName.trim();
        data.lastName = data.lastName.trim();


        const newUser = { ...data };


        API_CLIENT.register({ ...newUser })
            .then((message) => {

                setErrorApi(undefined);
                setRegisterMessage(message)
            }).catch((err) => {
                if (err.message === 'Failed to fetch') {
                    err.message = 'No internet connection with server.Please try again later.';
                }
                setErrorApi(err.message);
                console.log(err.message);

            });

    }


    if (errorApi) {

        setTimeout(() => {
            setErrorApi(undefined);
        }, 5000)

    }

    if (registerMessage) {

        setTimeout(() => {
            setErrorApi(undefined);
            setRegisterMessage(undefined);
            navigate('/login')
        }, 10000)

    }

    const handleChangePrivacyPolicy = (e: BaseSyntheticEvent) => {

        setCheckedPrivacyPolicy(e.target.checked)

    }



    const v2Callback: TReCaptchaV2Callback = (
        token: string | false | Error
    ): void => {
        if (typeof token === 'string') {
            setVerified(true)
            console.log('this is the token V2', token);
        } else if (typeof token === 'boolean' && !token) {
            setVerified(false)
            console.log('token has expired, user must check the checkbox again');
        } else if (token instanceof Error) {
            setVerified(false)
            console.log('error. please check your network connection');
        }
    };

    const v3Callback: TReCaptchaV3Callback = (
        token: string | void,
        refreshToken: TReCaptchaV3RefreshToken | void
    ): void => {
        if (typeof token === 'string') {
            console.log('this is the token V3', token);
            if (typeof refreshToken === 'function') {
                console.log('this is the refresh token function V3', refreshToken);
            }
        } else {
            console.log('token retrieval in progress...');
        }
    };

    return (
        <>
            <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

                <Container sx={{ bgcolor: '#cfe8fc', minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>



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
                        maxWidth: '600px',
                        maxHeight: '540px',
                        padding: '30px',
                        backgroundColor: '#8d868670',
                        boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px',
                        '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },
                        '@media(max-width: 600px)': { display: 'flex' },
                        '@media(min-width: 600px)': { '& .MuiButton-root': { m: 1, width: '32ch' } }
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
                        <FormControlLabel sx={{ width: 'fit-content' }} control={<Checkbox checked={checkedPrivacyPolicy} onChange={handleChangePrivacyPolicy} />} label={<Link to={'/term-privacy-policy'}>I accept the terms of use and privacy policy</Link>} />
                        <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }} disabled={!checkedPrivacyPolicy ? true : !verified ? true : registerMessage ? true : false}>Sign Up</Button>
                            <Button component={Link} to={'/login'} variant="contained" sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >Already Have An Account?</Button>
                        </Box >
                    </Box>

                    <Box sx={{display:'flex', margin:'30px'}}>

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
                </Container>
            </Grid>
        </>
    )

}