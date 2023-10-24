import { BaseSyntheticEvent, FC, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { User, UserRole, UserStatus } from '../../model/users';
import * as userService from '../../services/userService'
import { ApiClient } from '../../services/userService';
import { IdType, mouseover, toIsoDate, touchStart } from '../../shared/common-types';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, Container, Grid, Snackbar, Typography, useMediaQuery } from '@mui/material';
import FormInputText from '../FormFields/FormInputText';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import ReCAPTCHA from 'react-google-recaptcha';
import * as tripService from '../../services/tripService';
import { Trip } from '../../model/trip';
import { ApiTrip } from '../../services/tripService';
import { Helmet } from 'react-helmet-async';


const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');
const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data');



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


const schema1 = yup.object({
    email: yup.string().required().email(),
    firstName: yup.string().required().min(2).max(15).matches(/^(?!\s+$).*(\S{2})/, 'First Name cannot be empty string and must contain at least 2 characters .'),
    lastName: yup.string().required().min(2).max(15).matches(/^(?!\s+$).*(\S{2})/, 'Last Name cannot be empty string and must contain at least 2 characters .'),
    password: yup.string().required().matches(/^(?=(.*[a-zA-Z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/, 'Password must contain 8 characters, at least one digit, and one character different from letter or digit'),
    confirmpass: yup.string().test('passwords-match', 'Passwords must match', function (value) { return this.parent.password === value }),


}).required();


const schema2 = yup.object({
    password: yup.string().required().matches(/^(?=(.*[a-zA-Z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/, 'Password must contain 8 characters, at least one digit, and one character different from letter or digit'),
    confirmpass: yup.string().test('passwords-match', 'Passwords must match', function (value) { return this.parent.password === value }),


}).required();

const reCaptchaV2 = process.env.REACT_APP_SITE_KEY2;

const Register: FC = () => {

    const userId = useParams().userId;
    const token = useParams().token;

    const navigate = useNavigate();

    const [errorApi, setErrorApi] = useState<string>();
    const [registerMessage, setRegisterMessage] = useState<string>()
    const [checkedPrivacyPolicy, setCheckedPrivacyPolicy] = useState<boolean>(false)
    const [verified, setVerified] = useState<boolean>(false)
    const [imageBackground, setImageBackground] = useState<string>()
    const h1HackRef = useRef<HTMLHeadingElement | null>(null)

    const madiaQuery = useMediaQuery('(min-width:480px)');

    useEffect(() => {
        API_TRIP.backgroundImages().then((data) => {
            setImageBackground(data[Math.floor(Math.random() * data.length)])

        }).catch((err) => {
            console.log(err)
        });
    }, [])

    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({

        defaultValues: { email: '', firstName: '', lastName: '', password: '', confirmpass: '', timeCreated: '', timeEdited: '', lastTimeLogin: '', countOfLogs: '', status: UserStatus.ACTIVE, role: UserRole.user },

        mode: 'onChange',
        resolver: yupResolver((userId !== undefined && token !== undefined) ? schema2 : schema1),
    });


    const registerSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {
        event?.preventDefault();
        if (userId !== undefined && token !== undefined) {

            API_CLIENT.findById(userId).then((res) => {


                setErrorApi(undefined)
                API_CLIENT.newPassword(userId, token, data.password).then((result) => {
                    setRegisterMessage('You have successfully changed a new password.')
                    setErrorApi(undefined)
                }).catch((err) => {
                    setErrorApi(err.message)
                    console.log(err.message)
                })

            }).catch((err) => {
                setErrorApi(err.message)
                console.log(err.message)
            })

        } else {




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
    }


    const handleChangePrivacyPolicy = (e: BaseSyntheticEvent) => {

        setCheckedPrivacyPolicy(e.target.checked)

    }


    const onChangeReCAPTCHA = (value: any) => {
        if (value !== null) {
            setVerified(true);
            setErrorApi(undefined);
        } else {
            setVerified(false);
        }
    }


    const onmouseover = (e: BaseSyntheticEvent) => {
        mouseover(e, h1HackRef)
    }


    const onTouchStart = () => {
        touchStart(h1HackRef)
    }

    const handleCloseApi = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setErrorApi(undefined);
    }

    const handleCloseRegister = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setRegisterMessage(undefined);
        navigate('/login')
    }


    return (
        <>
            <Helmet>
                <title>Register page hack trip</title>
                <meta name='description' content='Welcome in hack trip' />
                <meta property="og:title" content="Hack Trip" />
                <meta property="og:url" content="https://www.hack-trip.com" />
                <meta property="og:image:url" content="https://www.hack-trip.com" />
                <meta property="og:image" content={`https://storage.googleapis.com/hack-trip-background-images/${imageBackground}`} />
                <meta property="og:type" content="website" />
                <meta property="og:description"
                    content="Hack Trip is an app where you can share your trips or get valuable tips for your future trips. These are our TOP 5 most liked in Hack Trips!" />
                <meta property="quote" content={'Hack Trip'} />
                <meta property="og:locale" content="en_US" />
                <meta property="og:hashtag" content={'#HackTrip'} />
                <meta property="og:site_name" content="Hack-Trip" />
                <link rel="canonical" href="/register" />
            </Helmet>
            <Grid onTouchStart={onTouchStart} container sx={{
                backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",
                backgroundAttachment: 'fixed', justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh'
            }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

                <Container sx={{ minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: madiaQuery ? 'space-evenly' : 'center', alignItems: 'center' }}>

                    {madiaQuery ?
                        <h1 ref={h1HackRef} onMouseOver={onmouseover} data-value="Welcome in Hack Trip!" style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Welcome in Hack Trip!</h1>

                        :
                        <>
                            <h1 style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Welcome in</h1>
                            <h1 ref={h1HackRef} data-value="Hack Trip!" style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Hack Trip!</h1>
                        </>
                    }


                    <Snackbar sx={{ position: 'relative' }} open={errorApi ? true : false} autoHideDuration={5000} onClose={handleCloseApi} >
                        <Alert onClose={handleCloseApi} severity="error">{errorApi}</Alert>
                    </Snackbar>

                    <Snackbar sx={{ position: 'relative' }} open={registerMessage ? true : false} autoHideDuration={5000} onClose={handleCloseRegister} >
                        <Alert onClose={handleCloseRegister} severity="success">{registerMessage}</Alert>
                    </Snackbar>


                    <Box component="form" sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        maxWidth: '600px',
                        height: 'fit-content',
                        padding: '30px',
                        backgroundColor: '#e5e3e3d9',
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
                            {userId !== undefined && token !== undefined ? 'RESET PASSWORD' : 'REGISTER'}
                        </Typography>
                        {userId === undefined && token === undefined ?
                            <>
                                <FormInputText name='email' label='Email' control={control} error={errors.email?.message}
                                    rules={{ required: true, minLength: 5 }} />
                                <FormInputText name='firstName' label='First Name' control={control} error={errors.firstName?.message}
                                    rules={{ required: true, minLength: 2, maxLength: 15 }} />

                                <FormInputText name='lastName' label='Last Name' control={control} error={errors.lastName?.message}
                                    rules={{ required: true, minLength: 2, maxLength: 15 }} />
                            </>
                            : ''}
                        <FormInputText name='password' label='Password' type='password' control={control} error={errors.password?.message}
                            rules={{ required: true }} />

                        <FormInputText name='confirmpass' label='Confirm Password' type='password' control={control} error={errors.confirmpass?.message}
                            rules={{ required: true }} />
                        {userId === undefined && token === undefined ?
                            <>
                                <FormControlLabel sx={{ width: 'fit-content' }} control={<Checkbox checked={checkedPrivacyPolicy} onChange={handleChangePrivacyPolicy} />} label={<Link to={'/term-privacy-policy'}>I accept the terms of use and privacy policy</Link>} />
                                <Box sx={{ '@media(max-width: 520px)': { display: 'flex', flexDirection: 'column' } }}>

                                    <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, margin: '5px' }} disabled={!checkedPrivacyPolicy ? true : !verified ? true : registerMessage ? true : false}>Sign Up</Button>
                                    <Button component={Link} to={'/login'} variant="contained" sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black', margin: '5px' }}  >Already Have An Account?</Button>
                                    <Button component={Link} to={'/resend-email'} variant="contained" sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black', margin: '5px' }}  >Resend verification email</Button>
                                </Box >
                            </>
                            :
                            <>
                                <Box sx={{ display: 'flex', padding: '0 20px', flexDirection: 'row', justifyContent: 'space-between' }}>

                                    <Button variant="contained" type='submit' sx={{ margin: '5px', ':hover': { background: '#4daf30' }, }} disabled={!verified ? true : registerMessage ? true : false}>NEW PASSWORD</Button>
                                    <Button component={Link} to={'/login'} variant="contained" sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black', margin: '5px' }}  >Already Have An Account?</Button>
                                </Box>


                            </>}
                    </Box>

                    <Box sx={{ display: 'flex', margin: '30px' }} id={'captcha-parent'}>

                        <ReCAPTCHA
                            sitekey={reCaptchaV2 ? reCaptchaV2 : ''}
                            onChange={onChangeReCAPTCHA}

                        />
                    </Box>
                </Container>
            </Grid>
        </>
    )

}

export default Register;