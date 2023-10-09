import { useForm } from 'react-hook-form';
import { Alert, Box, Button, Container, Grid, Snackbar, Typography, useMediaQuery } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import FormInputText from '../FormFields/FormInputText';
import * as userService from '../../services/userService';
import * as yup from "yup";
import { BaseSyntheticEvent, FC, useContext, useEffect, useRef, useState } from 'react';
import { ApiClient } from '../../services/userService';
import { IdType, mouseover, touchStart } from '../../shared/common-types';
import { User } from '../../model/users';
import { LoginContext } from '../../App';
import { yupResolver } from '@hookform/resolvers/yup';
import * as tripService from '../../services/tripService';
import { Trip } from '../../model/trip';
import { ApiTrip } from '../../services/tripService';
import { Helmet } from 'react-helmet-async';


const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');
const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data/trips');


type FormData = {
    email: string;
    password: string;

};

interface IUserGeolocation {
    IPv4: string,
    city: string,
    country_code: string,
    country_name: string,
    latitude: number,
    longitude: number,
    postal: string,
    state: string
}

const schema = yup.object({
    email: yup.string().required().email(),
    password: yup.string().required().matches(/^(?!\s+$).*/, 'Password cannot be empty string.'),

}).required();


const Login: FC = () => {

    const navigate = useNavigate();

    const loginContext = useContext(LoginContext);
    const [errorApi, setErrorApi] = useState<string>();
    const [imageBackground, setImageBackground] = useState<string>()
    const h1HackRef = useRef<HTMLHeadingElement | null>(null)
    const [userGeolocation, setUserGeolocation] = useState<IUserGeolocation>()

    const madiaQuery = useMediaQuery('(min-width:480px)');

    useEffect(() => {
        API_TRIP.backgroundImages().then((data) => {
            setImageBackground(data[Math.floor(Math.random() * data.length)])

        }).catch((err) => {
            console.log(err)
        });

        fetch('https://geolocation-db.com/json/')
            .then(res => res.json())
            .then(data => {
                setUserGeolocation(data)
            })
            .catch(err => console.log(err))
    }, [])


    const { control, handleSubmit, formState: { errors, isDirty, isValid } } = useForm<FormData>({

        defaultValues: { email: '', password: '' },
        mode: 'onChange',
        resolver: yupResolver(schema),

    });




    const loginSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {
        event?.preventDefault();
        data.email = data.email.trim();
        data.password = data.password.trim();

        if (userGeolocation) {
            API_CLIENT.login(data.email, data.password, userGeolocation)
                .then((user) => {
                    localStorage.setItem('userId', user._id.toString());
                    localStorage.setItem('accessToken', user.accessToken ? user.accessToken : '');
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

    }

    const onmouseover = (e: BaseSyntheticEvent) => {
        mouseover(e, h1HackRef)
    }



    const onTouchStart = () => {
        touchStart(h1HackRef)
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setErrorApi(undefined);
    };


    return (
        <>

            <Helmet>
                <title>Login page hack trip</title>
                <meta name='description' content='Welcome in hack trip' />
                <link rel="canonical" href="/login" />
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

            </Helmet>
            <Grid onTouchStart={onTouchStart} container sx={{
                backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",
                backgroundAttachment: 'fixed', justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh'
            }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Container sx={{ minHeight: '100vh', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: madiaQuery ? 'space-evenly' : 'center', alignItems: 'center', '@media(max-width: 600px)': { display: 'flex' } }}>

                    {madiaQuery ?
                        <h1 ref={h1HackRef} onMouseOver={onmouseover} data-value="Welcome in Hack Trip!" style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Welcome in Hack Trip!</h1>

                        :
                        <>
                            <h1 style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Welcome in</h1>
                            <h1 ref={h1HackRef} data-value="Hack Trip!" style={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }}>Hack Trip!</h1>
                        </>
                    }
                    <Snackbar sx={{ position: 'relative' }} open={errorApi ? true : false} autoHideDuration={5000} onClose={handleClose} >
                        <Alert onClose={handleClose} severity="error">{errorApi}</Alert>
                    </Snackbar>

                    <Box component="form" sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        maxWidth: '700px',
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
                        onSubmit={handleSubmit(loginSubmitHandler)}
                    >
                        <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h5">
                            LOGIN
                        </Typography>
                        <FormInputText name='email' label='Email' control={control} error={errors.email?.message}
                            rules={{ required: true, minLength: 5 }} />

                        <FormInputText name='password' type='password' label='Password' control={control} error={errors.password?.message}
                            rules={{ required: true }} />

                        <Box sx={{ display: 'flex', '@media(max-width: 490px)': { display: 'flex', flexDirection: 'column' } }}>
                            <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, margin: '5px' }} disabled={!isDirty || !isValid}>Sign Up</Button>
                            <Button variant="contained" component={Link} to={'/register'} sx={{ ':hover': { color: 'rgb(248 245 245)' }, margin: '5px', background: 'rgb(194 194 224)', color: 'black' }}  >Don't Have An Account? Sign up!</Button>
                            <Button variant="contained" component={Link} to={'/forgot-password'} sx={{ ':hover': { color: 'rgb(248 245 245)' }, margin: '5px', background: 'rgb(194 194 224)', color: 'black' }}  >Forgot Password</Button>
                        </Box >
                    </Box>
                </Container>
            </Grid>
        </>
    )
}

export default Login;