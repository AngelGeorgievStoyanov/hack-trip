import { useNavigate } from "react-router-dom";
import { Box, Button, CardMedia, Typography } from "@mui/material";
import FormInputText from "../FormFields/FormInputText";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import React, { BaseSyntheticEvent, FC, useContext, useEffect, useState } from "react";
import * as userService from '../../services/userService';
import { IdType, toIsoDate } from "../../shared/common-types";
import { User } from "../../model/users";
import { ApiClient } from "../../services/userService";
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';
import { LoginContext } from "../../hooks/LoginContext";
import jwt_decode from "jwt-decode";
import useMediaQuery from '@mui/material/useMediaQuery';
import { TripCreate } from "../../model/trip";
import * as tripService from "../../services/tripService";
import { ApiTrip } from "../../services/tripService";
import { handleFilesChange } from "../../shared/handleFilesChange";
import CustomFileUploadButton from "../CustomFileUploadButton/CustomFileUploadButton ";
import { useConfirm } from "../ConfirmDialog/ConfirmDialog";


const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');
const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data');

const schema1 = yup.object({
    email: yup.string().required().email(),
    firstName: yup.string().required().min(2).max(15).matches(/^(?!\s+$).*(\S{2})/, 'First Name cannot be empty string and must contain at least 2 characters .'),
    lastName: yup.string().required().min(2).max(15).matches(/^(?!\s+$).*(\S{2})/, 'Last Name cannot be empty string and must contain at least 2 characters .'),
    oldpassword: yup.string().required('Old password is required.').matches(/^(?=(.*[a-zA-Z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/, 'Password must contain 8 characters, at least one digit, and one character different from letter or digit'),
    password: yup.string().required('New password is required').matches(/^(?=(.*[a-zA-Z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/, 'New password must contain 8 characters, at least one digit, and one character different from letter or digit'),
    confirmpass: yup.string().test('passwords-match', 'Passwords must match', function (value) { return this.parent.password === value }),


}).required();


const schema2 = yup.object({
    email: yup.string().required().email(),
    firstName: yup.string().required().min(2).max(15).matches(/^(?!\s+$).*(\S{2})/, 'First Name cannot be empty string and must contain at least 2 characters .'),
    lastName: yup.string().required().min(2).max(15).matches(/^(?!\s+$).*(\S{2})/, 'Last Name cannot be empty string and must contain at least 2 characters .'),



}).required();



type FormData = {
    email: string
    firstName: string;
    lastName: string;
    oldpassword: string;
    password: string;
    confirmpass: string;
    imageFile: string | undefined;
    timeCreated: string | undefined;
    timeEdited: string;

};


type decode = {
    _id: string,
}


let userId: string | undefined;


const Profile: FC = () => {

    const [user, setUser] = useState<User>();
    const [hide, setHide] = useState<boolean>(false);
    const [fileSelected, setFileSelected] = useState<File[]>([]);
    const [errorMessageImage, setErrorMessageImage] = useState<string | undefined>();
    const [imageBackground, setImageBackground] = useState<string>();
    const [images, setImages] = useState([]);

    const { confirm } = useConfirm();

    const navigate = useNavigate();

    const { token } = useContext(LoginContext);


    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id;

    }

    const iconFotoCamera = useMediaQuery('(max-width:600px)');


    useEffect(() => {
        if (userId !== undefined) {
            API_CLIENT.findById(userId).then((data) => {
                setUser(data);

            }).catch(err => {
                console.log(err)
            });

            API_TRIP.backgroundImages().then((data) => {
                setImageBackground(data[Math.floor(Math.random() * data.length)])

            }).catch((err) => {
                console.log(err)
            });
        }

    }, []);


    const { control, handleSubmit, formState: { errors, isDirty, isValid }, reset } = useForm<FormData>({

        defaultValues: { email: '', firstName: '', lastName: '', password: '', confirmpass: '' },
        mode: 'onChange',
        resolver: yupResolver(hide === true ? schema1 : schema2),
    });

    useEffect(() => {
        if (user) {
            reset({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                oldpassword: '',
                password: '',
                confirmpass: ''
            });
        }
    }, [user, reset]);

    const editProfileSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {


        if (data.oldpassword.length > 0 && data.password.length > 0 && data.confirmpass.length > 0) {

            if (userId && accessToken) {
                API_CLIENT.changePassword(userId, data.oldpassword, accessToken).then((data) => {

                }).catch((err) => {
                    console.log(err.message);

                    return;
                });

            }
        }


        let formData = new FormData();

        let imagesNames;

        if (fileSelected && fileSelected.length > 0 && accessToken) {
            formData.append('file', fileSelected[fileSelected.length - 1]);


            imagesNames = await API_CLIENT.sendFile(formData, accessToken).then((data) => {
                let imageName = data as unknown as any as any[];
                return imageName.map((x) => {
                    return x.destination;
                });
            }).catch((err) => {
                console.log(err);
            });
        }
        if (imagesNames !== undefined && imagesNames.length > 0) {
            data.imageFile = imagesNames[0];

        } else {
            if ((user?.imageFile !== undefined) && (user.imageFile !== null) && (user.imageFile !== '')) {
                data.imageFile = user?.imageFile
            }

        }


        data.timeEdited = toIsoDate(new Date());
        data.firstName = data.firstName.trim();
        data.lastName = data.lastName.trim();
        data.oldpassword = data.oldpassword.trim();
        data.password = data.password.trim();
        data.confirmpass = data.confirmpass.trim();

        const editedUser = { ...data } as any;

        if (userId && accessToken) {

            API_CLIENT.updateUser(userId, editedUser, accessToken).then((data) => {
                setUser(data);
                setFileSelected([]);
                reset({ oldpassword: '', password: '', confirmpass: '' });
                setHide(false);
            }).catch((err) => {
                console.log(err)
            });

        }


    }


    const goBack = () => {
        navigate(-1);

    }


    const changePass = () => {
        setHide(!hide);
        if (hide === true) {

            reset({ oldpassword: '', password: '', confirmpass: '' });
        }
    }



    const handleProfileFileChange = (event: BaseSyntheticEvent) => {

        handleFilesChange(event, fileSelected, setFileSelected, setErrorMessageImage, images?.length || 0);
    };



    const deleteImage = async (e: React.MouseEvent) => {

        const img = e.currentTarget.id;
        if (userId && accessToken) {
            const result = await confirm('Are you sure you want to delete this image?', 'Delete Confirmation');
            if (result) {
                API_CLIENT.deleteProfileImage(userId, img, accessToken).then((data) => {
                    setUser(data);
                }).catch((err) => {
                    console.log(err)
                });
            }
        }
    }


    const onDeleteImage = (event: BaseSyntheticEvent) => {

        setFileSelected([])
    }


    if (errorMessageImage) {

        setTimeout(() => {
            setErrorMessageImage(undefined)
        }, 5000)


    }


    if (fileSelected.length > 1) {
        setFileSelected(Array(fileSelected[fileSelected.length - 1]))
    }



    return (

        <>
            <Box sx={{
                backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",
                backgroundAttachment: 'fixed', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly',
                alignItems: 'center', bgcolor: '#cfe8fc', minHeight: '100vh', marginTop: '-24px',
                '@media(max-width: 600px)': { display: 'flex', padding: '20px', maxWidth: '100vW' }
            }}>
                {user?.imageFile ?
                    <>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <HighlightOffSharpIcon sx={{ cursor: 'pointer', marginTop: '20px', position: 'relative', translate: '0 28px', backgroundColor: 'white', borderRadius: '50%' }} onClick={deleteImage} id={user.imageFile} />
                            <CardMedia
                                component="img"
                                image={`https://storage.googleapis.com/hack-trip/${user.imageFile}`}
                                sx={{ maxWidth: '300px', maxHeight: '300px', border: '1px solid', boxShadow: '3px 2px 5px black', borderRadius: '50%' }}
                                alt="USER"
                            />
                        </Box>
                    </>
                    : ''}
                <Box component="form"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        margin: '20px',
                        maxWidth: '600px',
                        height: 'fit-content',
                        padding: '30px',
                        backgroundColor: '#eee7e79e',
                        boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px',
                        '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },
                        '@media(max-width: 600px)': { display: 'flex', width: '90%' }
                    }}
                    noValidate
                    autoComplete='0ff'
                    onSubmit={handleSubmit(editProfileSubmitHandler)}
                >
                    <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h5">
                        {user?.firstName}'s  PROFILE
                    </Typography>
                    <FormInputText name='email' label='Email' control={control} error={errors.email?.message}
                        rules={{ required: true, minLength: 5 }} />
                    <FormInputText name='firstName' label='First Name' control={control} error={errors.firstName?.message}
                        rules={{ required: true, minLength: 2, maxLength: 15 }} />

                    <FormInputText name='lastName' label='Last Name' control={control} error={errors.lastName?.message}
                        rules={{ required: true, minLength: 2, maxLength: 15 }} />
                    {hide === true ?
                        <>
                            <FormInputText name='oldpassword' label='Old Password' type='password' control={control} error={errors.oldpassword?.message}
                                rules={{ required: true }} />
                            <FormInputText name='password' label='Password' type='password' control={control} error={errors.password?.message}
                                rules={{ required: true }} />

                            <FormInputText name='confirmpass' label='Confirm Password' type='password' control={control} error={errors.confirmpass?.message}
                                rules={{ required: true }} />
                        </>

                        : ''}

                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                        <CustomFileUploadButton handleFilesChange={handleProfileFileChange} images={images || []} fileSelected={fileSelected} iconFotoCamera={iconFotoCamera} />

                    </Box >
                    {errorMessageImage ? <Typography style={{ color: 'red', marginLeft: '12px' }}>{errorMessageImage}</Typography> : ''}
                    {fileSelected.length > 0 ? <>

                        <Box component='div' id='box-images' sx={{
                            display: "flex",
                            flexDirection: "column",
                            maxHeight: "200px",
                            overflow: "hidden",
                            overflowY: 'auto',
                            padding: '6px',
                            border: 'solid 1px black',
                            margin: '6px',
                            borderRadius: '5px',

                        }}>
                            {Array(fileSelected.slice(-1)[0]).map((x, i) => { return <li style={{ 'listStyle': 'none', display: 'flex', justifyContent: 'space-between', margin: '5px 0px', alignItems: 'center' }} key={i}><img src={URL.createObjectURL(x)} style={{ borderRadius: '5px' }} alt={x.name} height='45px' width='55px' /> {x.name.length > 60 ? '...' + x.name.slice(-60) : x.name} <HighlightOffSharpIcon sx={{ cursor: 'pointer', backgroundColor: '#ffffff54', borderRadius: '50%' }} onClick={onDeleteImage} key={x.name} id={x.name} /></li> }
                            )}
                        </Box >


                    </> : ''}
                    <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button variant="contained" type='submit' disabled={(!isDirty || !isValid) && fileSelected.length === 0} sx={{ margin: '2px', ':hover': { background: '#4daf30' } }}>EDIT PROFILE</Button>
                        <Button variant="contained" onClick={goBack} sx={{ margin: '2px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>
                        <Button variant="contained" onClick={changePass} disabled={user?.email === 'test@abv.bg' ? true : false} sx={{ margin: '2px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >{hide ? 'HIDE CHANGE PASSWORD' : 'CHANGE PASSWORD'}</Button>
                    </Box >
                </Box>
            </Box>
        </>
    )
}

export default Profile;