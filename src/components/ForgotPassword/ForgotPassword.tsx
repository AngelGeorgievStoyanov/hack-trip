import { Alert, Box, Button, Container, Grid, Snackbar, Typography, useMediaQuery } from "@mui/material";
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
import HelmetWrapper from "../Helmet/HelmetWrapper";

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');
const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data');


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
            <HelmetWrapper
                title={' Hack Trip'}
                description={' Hack Trip'}
                url={`https://www.hack-trip.com/forgot-password`}
                image={imageBackground && imageBackground.length > 0 ? imageBackground : ''}
                hashtag={'#HackTrip'}
                keywords={'Hack Trip, Travel, Adventure'}
                canonical={`https://www.hack-trip.com/forgot-password`}
            />
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