import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { User } from "../../model/users";
import { IdType } from "../../shared/common-types";
import FormInputText from "../FormFields/FormInputText";
import * as userService from '../../services/userService';
import { ApiClient } from "../../services/userService";
import { Link, useNavigate } from "react-router-dom";
import { BaseSyntheticEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";


import ReCAPTCHA from "react-google-recaptcha";

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');


const reCaptchaV2 = process.env.REACT_APP_SITE_KEY2;


type FormData = {
    email: string;
};


const schema = yup.object({
    email: yup.string().required().email(),

}).required();



function ForgotPassword() {


    const navigate = useNavigate();
    const [errorApi, setErrorApi] = useState<string>();
    const [verified, setVerified] = useState<boolean>(false)
    const [registerMessage, setRegisterMessage] = useState<string>()


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
        }
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