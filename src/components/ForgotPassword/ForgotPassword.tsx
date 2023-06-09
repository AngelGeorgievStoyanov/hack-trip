import { Box, Button, Container, Grid, Typography, useMediaQuery } from "@mui/material";
import { User } from "../../model/users";
import { IdType, mouseover, touchStart } from "../../shared/common-types";
import FormInputText from "../FormFields/FormInputText";
import * as userService from '../../services/userService';
import { ApiClient } from "../../services/userService";
import { Link, useNavigate } from "react-router-dom";
import { BaseSyntheticEvent, FC, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ReCAPTCHA from "react-google-recaptcha";
import * as tripService from '../../services/tripService';
import { Trip } from '../../model/trip';
import { ApiTrip } from '../../services/tripService';
import { Helmet } from "react-helmet-async";

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');
const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data/trips');


const reCaptchaV2 = process.env.REACT_APP_SITE_KEY2;


type FormData = {
    email: string;
};


const schema = yup.object({
    email: yup.string().required().email(),

}).required();



const ForgotPassword: FC = () => {


    const navigate = useNavigate();
    const [errorApi, setErrorApi] = useState<string>();
    const [verified, setVerified] = useState<boolean>(false)
    const [registerMessage, setRegisterMessage] = useState<string>()
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

        defaultValues: { email: '' },
        mode: 'onChange',
        resolver: yupResolver(schema),

    });



    const forgotPasswordSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {
        event?.preventDefault();
        data.email = data.email.trim();


        API_CLIENT.forgotPassword(data.email).then((message) => {

            setErrorApi(undefined);
            setRegisterMessage(message)
        }).catch((err) => {
            setErrorApi(err.message);
            console.log(err.message);
        })

    }

    if (errorApi) {

        setTimeout(() => {
            setErrorApi(undefined)
        }, 5000)
    }





    if (registerMessage) {

        setTimeout(() => {
            setErrorApi(undefined);
            setRegisterMessage(undefined);
            navigate('/login')
        }, 5000)

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

    return (
        <>

            <Helmet>
                <title>Hack Trip</title>
                <meta name='description' content='Hack Trip is an app where you can share your trips or get valuable tips for your future trips. These are our TOP 5 most liked in Hack Trips!' />
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
                <link rel="canonical" href="/forgot-password" />
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
                        backgroundColor: '#e5e3e3d9',
                        boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px',
                        '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },

                        '@media(max-width: 600px)': { display: 'flex' },
                        '@media(min-width: 600px)': { '& .MuiButton-root': { m: 1, width: '32ch' } }

                    }}
                        noValidate
                        autoComplete='0ff'
                        onSubmit={handleSubmit(forgotPasswordSubmitHandler)}
                    >
                        <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h5">
                            FORGOT PASSWORD
                        </Typography>
                        <FormInputText name='email' label='Email' control={control} error={errors.email?.message}
                            rules={{ required: true, minLength: 5 }} />

                        <Box >
                            <Button variant="contained" disabled={verified === false ? true : registerMessage ? true : false} type='submit' sx={{ ':hover': { background: '#4daf30' }, margin: '5px' }}>Send Email</Button>
                            <Button variant="contained" component={Link} to={'/login'} sx={{ ':hover': { color: 'rgb(248 245 245)' }, margin: '5px', background: 'rgb(194 194 224)', color: 'black' }}  >Back in Login</Button>
                        </Box >
                    </Box>

                    <Box sx={{ display: 'flex', margin: '30px' }} id={'captcha-parent'}>


                        <ReCAPTCHA
                            size="normal"
                            sitekey={reCaptchaV2 ? reCaptchaV2 : ''}
                            onChange={onChangeReCAPTCHA}
                        />

                    </Box>
                </Container>
            </Grid>
        </>
    )
}


export default ForgotPassword;