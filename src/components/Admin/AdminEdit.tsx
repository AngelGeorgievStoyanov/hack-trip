import { Box, Button, CardMedia, Typography } from "@mui/material";
import { useLoaderData, useNavigate } from "react-router-dom";
import FormInputText from "../FormFields/FormInputText";
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';
import { User, UserRole, UserStatus } from "../../model/users";
import { BaseSyntheticEvent, FC, useContext, useState } from "react";
import { IdType, toIsoDate } from "../../shared/common-types";
import { ApiClient } from "../../services/userService";
import * as userService from '../../services/userService'
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { LoginContext } from "../../hooks/LoginContext";
import jwt_decode from "jwt-decode";
import FormInputSelect, { SelectOption } from "../FormFields/FormInputSelect";
import useMediaQuery from '@mui/material/useMediaQuery';
import CustomFileUploadButton from "../CustomFileUploadButton/CustomFileUploadButton ";
import { handleFilesChange } from "../../shared/handleFilesChange";


const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');

const USER_SELECT_OPTIONS_STATUS: SelectOption[] = Object.keys(UserStatus)
    .filter((item) => !isNaN(Number(item)))
    .map((ordinal: string) => parseInt(ordinal))
    .map((ordinal: number) => ({ key: ordinal, value: UserStatus[ordinal] }));



const USER_SELECT_OPTIONS_ROLE: SelectOption[] = Object.keys(UserRole)
    .filter((item) => !isNaN(Number(item)))
    .map((ordinal: string) => parseInt(ordinal))
    .map((ordinal: number) => ({ key: ordinal, value: UserRole[ordinal] }));



type decode = {
    role: string;
    _id: string;
}



type FormData = {
    _id: string,
    email: string
    firstName: string;
    lastName: string;
    imageFile: string | undefined;
    timeCreated: string | undefined;
    timeEdited: string;
    role: string;
    status: string;
};



const schema = yup.object({
    email: yup.string().required().email(),
    firstName: yup.string().required().min(2).max(15).matches(/^(?!\s+$).*(\S{2})/, 'First Name cannot be empty string and must contain at least 2 characters .'),
    lastName: yup.string().required().min(2).max(15).matches(/^(?!\s+$).*(\S{2})/, 'Last Name cannot be empty string and must contain at least 2 characters .'),



}).required();


let userId: string;


const AdminEdit: FC = () => {


    const userEdit = useLoaderData() as User;



    const [fileSelected, setFileSelected] = useState<File[]>([]);
    const [user, setUser] = useState<User>();
    const [errorMessageImage, setErrorMessageImage] = useState<string | undefined>();

    const navigate = useNavigate();

    const { token } = useContext(LoginContext);

    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    let role = 'user';
    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;
        userId = decode._id

    }



    const iconFotoCamera = useMediaQuery('(max-width:600px)');


    let oneDay = 60 * 60 * 24 * 1000
    let timeCreatedPlusOneDay = Date.parse(userEdit.timeCreated ? userEdit.timeCreated : new Date().toISOString()) + oneDay
    let now = Date.parse(new Date().toISOString())

    const { control, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({

        defaultValues: {
            _id: userEdit._id + '', email: userEdit.email,
            firstName: user?.firstName ? user.firstName : userEdit.firstName,
            lastName: user?.lastName ? user.lastName : userEdit.lastName, imageFile: '',
            timeCreated: '', timeEdited: '',
            role: UserRole[userEdit.role],
            status: UserStatus[userEdit.status]
        },

        values: {
            _id: userEdit?._id + '', email: user?.email ? user.email : userEdit.email,
            firstName: user?.firstName ? user.firstName : userEdit.firstName,
            lastName: user?.lastName ? user.lastName : userEdit.lastName, imageFile: '', timeEdited: '',
            timeCreated: '', role: UserRole[userEdit.role], status: UserStatus[userEdit.status]
        },

        mode: 'onChange',
        resolver: yupResolver(schema),
    });


    if (fileSelected.length > 1) {
        setFileSelected(Array(fileSelected[fileSelected.length - 1]))
    }

    const editProfileSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {
        if (accessToken) {


            let formData = new FormData();
            let imagesNames
            if (fileSelected && fileSelected.length > 0) {
                formData.append('file', fileSelected[fileSelected.length - 1]);


                imagesNames = await API_CLIENT.sendFile(formData, accessToken).then((data) => {
                    let imageName = data as unknown as any as any[];
                    return imageName.map((x) => {
                        return x.destination;
                    })
                }).catch((err) => {
                    console.log(err);
                })
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
            data.status = UserStatus[parseInt(data.status)];

            if (data.status === undefined) {
                if ((user !== undefined) && (user.status !== undefined)) {
                    data.status = user.status + '';
                }
            }

            data.role = UserRole[parseInt(data.role)];


            if (data.role === undefined) {
                if ((user !== undefined) && (user.role !== undefined)) {
                    data.role = user.role + '';
                }
            }


            const userEditRole = userEdit.role as any as string;

            if (userEditRole === 'admin') {
                data.status = UserStatus[UserStatus.ACTIVE];
                data.role = UserRole[UserRole.admin];
            }

            const editedUser = { ...data } as any;


            if (userEdit._id) {


                API_CLIENT.updateUserAdmin(userEdit._id, editedUser, accessToken).then((data) => {

                    setUser(prev => data);
                    setFileSelected([]);

                }).catch((err) => {
                    console.log(err)
                });

            }

        }

    }


    const goBack = () => {
        navigate(-1);

    }

    let images;

    const handleAdminEditTripFilesChange = (event: BaseSyntheticEvent) => {
        let file = Array.from(event.target.files)[0] as File;
        if (!file) return;
        handleFilesChange(event, fileSelected, setFileSelected, setErrorMessageImage, images?.length || 0);
    };




    const deleteImage = (e: React.MouseEvent) => {

        const img = e.currentTarget.id;
        if (userEdit._id && accessToken) {

            API_CLIENT.deleteProfileImage(userEdit._id + '', img, accessToken).then((data) => {

                setUser(data);
                userEdit.imageFile = undefined;
            }).catch((err) => {
                console.log(err)
            });
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






    const deleteClickHandler = () => {
        if (accessToken) {

            API_CLIENT.deleteUserById(userId, userEdit._id, accessToken).then((data) => {
                navigate('/admin')
            }).catch((err) => {
                console.log(err)
            })
        }
    }

    return (

        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', bgcolor: '#cfe8fc', minHeight: '100vh', marginTop: '-24px' }}>
                {(user !== undefined && user?.imageFile !== null && user.imageFile !== undefined && user.imageFile.length > 0) ?
                    <>
                        <HighlightOffSharpIcon sx={{ cursor: 'pointer', marginTop: '20px', position: 'relative', translate: '0 28px', backgroundColor: 'white', borderRadius: '50%' }} onClick={deleteImage} id={user.imageFile} />
                        <CardMedia
                            component="img"
                            image={`https://storage.googleapis.com/hack-trip/${user.imageFile}`}
                            sx={{ maxWidth: '300px', maxHeight: '300px', border: '1px solid', boxShadow: '3px 2px 5px black', borderRadius: '50%' }}

                            alt="USER"

                        />
                    </>
                    :
                    (userEdit !== undefined && userEdit.imageFile !== null && userEdit.imageFile !== undefined && userEdit.imageFile.length > 0) ?
                        <>
                            <HighlightOffSharpIcon sx={{ cursor: 'pointer', marginTop: '20px', position: 'relative', translate: '0 28px', backgroundColor: 'white', borderRadius: '50%' }} onClick={deleteImage} id={userEdit.imageFile} />
                            <CardMedia
                                component="img"
                                image={`https://storage.googleapis.com/hack-trip/${userEdit.imageFile}`}
                                sx={{ maxWidth: '300px', maxHeight: '300px', border: '1px solid', boxShadow: '3px 2px 5px black', borderRadius: '50%' }}
                                alt="USEREDIT"

                            />
                        </>
                        : ''}
                <Box component="form" sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    margin: '20px',
                    maxWidth: '600px',
                    height: 'fit-content',
                    padding: '30px',
                    backgroundColor: '#8d868670',
                    boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px',
                    '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },
                    '@media(max-width: 600px)': { display: 'flex', maxWidth: '95%' }
                }}
                    noValidate
                    autoComplete='0ff'
                    onSubmit={handleSubmit(editProfileSubmitHandler)}
                >
                    <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h5">
                        {user?.firstName ? user.firstName : userEdit.firstName}'s  PROFILE
                    </Typography>
                    <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h5">
                        User ID:   {userEdit._id}
                    </Typography>
                    <FormInputText color={userEdit.verifyEmail === 0 && (timeCreatedPlusOneDay < now) ? 'error' : 'primary'} name='email' label='Email' control={control} error={errors.email?.message}
                        rules={{ required: true, minLength: 5 }} autoFocus={userEdit.verifyEmail === 0 && (timeCreatedPlusOneDay < now) ? true : false} />
                    <FormInputText name='firstName' label='First Name' control={control} error={errors.firstName?.message}
                        rules={{ required: true, minLength: 2, maxLength: 15 }} />

                    <FormInputText name='lastName' label='Last Name' control={control} error={errors.lastName?.message}
                        rules={{ required: true, minLength: 2, maxLength: 15 }} />


                    {role === 'admin' ?
                        <>
                            <FormInputSelect name='role' label='role' control={control} error={errors.role?.message}
                                options={USER_SELECT_OPTIONS_ROLE} />
                            <FormInputSelect name='status' label='status' control={control} error={errors.status?.message}
                                options={USER_SELECT_OPTIONS_STATUS} defaultOptionIndex={1} />


                        </>
                        : ''}
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                        <CustomFileUploadButton handleFilesChange={handleAdminEditTripFilesChange} images={images || []} fileSelected={fileSelected} iconFotoCamera={iconFotoCamera} />

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
                            {Array(fileSelected.slice(-1))[0].map((x, i) => { return <li style={{ 'listStyle': 'none', display: 'flex', justifyContent: 'space-between', margin: '5px 0px', alignItems: 'center' }} key={i}><img src={URL.createObjectURL(x)} style={{ borderRadius: '5px' }} alt={x.name} height='45px' width='55px' /> {x.name.length > 60 ? '...' + x.name.slice(-60) : x.name} <HighlightOffSharpIcon sx={{ cursor: 'pointer', backgroundColor: '#ffffff54', borderRadius: '50%' }} onClick={onDeleteImage} key={x.name} id={x.name} /></li> }
                            )}
                        </Box >


                    </> : ''}


                    <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30', margin: '2px' } }} disabled={!isDirty && fileSelected.length === 0}>EDIT PROFILE</Button>
                        <Button variant="contained" onClick={deleteClickHandler} sx={{ ':hover': { background: '#ef0a0a' }, margin: '5px' }}>DELETE USER</Button>

                        <Button variant="contained" onClick={goBack} sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>

                    </Box >

                </Box>
            </Box>
        </>
    )
}

export default AdminEdit;