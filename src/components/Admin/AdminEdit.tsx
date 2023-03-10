import { Box, Button, CardMedia, Typography } from "@mui/material";
import { MuiFileInput } from "mui-file-input";
import { useLoaderData, useNavigate } from "react-router-dom";
import FormInputText from "../FormFields/FormInputText";
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';
import { User, UserRole, UserStatus } from "../../model/users";
import { BaseSyntheticEvent, useContext, useState } from "react";
import { IdType, toIsoDate } from "../../shared/common-types";
import { ApiClient } from "../../services/userService";
import * as userService from '../../services/userService'
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { LoginContext } from "../../App";
import jwt_decode from "jwt-decode";
import FormInputSelect, { SelectOption } from "../FormFields/FormInputSelect";
import imageCompression from "browser-image-compression";

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



export default function AdminEdit() {

    const userEdit = useLoaderData() as User;




    const [fileSelected, setFileSelected] = useState<File | null>(null);
    const [user, setUser] = useState<User>();
    const navigate = useNavigate();
    const [errorMessageImage, setErrorMessageImage] = useState<string | undefined>();



    const { userL } = useContext(LoginContext);


    const accessToken = userL?.accessToken ? userL.accessToken : sessionStorage.getItem('accessToken') ? sessionStorage.getItem('accessToken') : undefined

    let role = 'user';
    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;

    }


    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({

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



    const editProfileSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {


        let formData = new FormData();
        let imagesNames
        if (fileSelected) {

            formData.append('file', fileSelected);




             imagesNames = await API_CLIENT.sendFile(formData).then((data) => {
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


            API_CLIENT.updateUserAdmin(userEdit._id, editedUser).then((data) => {

                setUser(prev => data);
                setFileSelected(null);

            }).catch((err) => {
                console.log(err)
            });

        }


    }


    const goBack = () => {
        navigate(-1);

    }


    const handleFileChange = async (file: any) => {

        if (file !== null) {

            if (!file.name.match(/\.(jpg|jpeg|PNG|gif|JPEG|png|JPG|gif)$/)) {
                setErrorMessageImage('Please select valid file image');


                return;
            }
            if (file.name.match(/\.(jpg|jpeg|PNG|gif|JPEG|png|JPG|gif)$/)) {
                setErrorMessageImage(undefined)
            }



            if (file.size > 10000) {
                const options = {
                    maxSizeMB: 0.1,
                    maxWidthOrHeight: 520,
                    fileType: file.type,
                    name: !file.name ? 'IMG' + (Math.random() * 3).toString() :
                        file.name.split(/[,\s]+/).length > 1 ? file.name.split(/[,\s]+/)[0] + '.jpg' : file.name

                }

                try {
                    const compressedFile = await imageCompression(file, options);

                    if (compressedFile !== undefined) {
                        let compFile = new File([compressedFile], options.name, { type: file.type })
                        setFileSelected(prev => compFile);
                    }

                } catch (err) {
                    console.log(err);
                }
            } else {

                const options = {
                    name: !file.name ? 'IMG' + (Math.random() * 3).toString() :
                        file.name.split(/[,\s]+/).length > 1 ? file.name.split(/[,\s]+/)[0] + '.jpg' : file.name
                }
                let newFile = new File([file], options.name, { type: file.type })

                setFileSelected(prev => newFile);
            }

        }


    };

    const deleteFile = (e: React.MouseEvent) => {


        let svg = e.target as HTMLElement;

        if (svg.tagName === 'svg') {

            setFileSelected(null);
        }
    }

    const deleteImage = (e: React.MouseEvent) => {

        const img = e.currentTarget.id;
        if (userEdit._id) {

            API_CLIENT.deleteProfileImage(userEdit._id + '', img).then((data) => {
                setUser(data);
            }).catch((err) => {
                console.log(err)
            });
        }
    }

    return (

        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', bgcolor: '#cfe8fc', minHeight: '100vh', marginTop: '-24px' }}>
                {(user !== undefined && user?.imageFile !== null && user.imageFile !== undefined && user.imageFile.length > 0) ?
                    <>
                        <HighlightOffSharpIcon sx={{ cursor: 'pointer', marginTop: '20px' }} onClick={deleteImage} id={user.imageFile} />
                        <CardMedia
                            component="img"
                            image={`https://storage.googleapis.com/hack-trip/${user.imageFile}`}
                            sx={{ maxWidth: '300px', maxHeight: '300px', border: '1px solid' }}
                            alt="USER"

                        />
                    </>
                    :
                    (userEdit !== undefined && userEdit.imageFile !== null && userEdit.imageFile !== undefined && userEdit.imageFile.length > 0) ?
                        <>
                            <HighlightOffSharpIcon sx={{ cursor: 'pointer', marginTop: '20px' }} onClick={deleteImage} id={userEdit.imageFile} />
                            <CardMedia
                                component="img"
                                image={`https://storage.googleapis.com/hack-trip/${userEdit.imageFile}`}
                                sx={{ maxWidth: '300px', maxHeight: '300px', border: '1px solid' }}
                                alt="USEREDit"

                            />
                        </>
                        : ''}
                <Box component="form" sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    margin: '20px',
                    maxWidth: '600px',
                    maxHeight: '700px',
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
                    <FormInputText name='email' label='Email' control={control} error={errors.email?.message}
                        rules={{ required: true, minLength: 5 }} />
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


                    <MuiFileInput value={fileSelected ? fileSelected : undefined} name='inpImages' helperText={errorMessageImage} sx={{ '& input.css-152mnda-MuiInputBase-input-MuiOutlinedInput-input': { cursor: 'pointer' } }} onChange={handleFileChange} onClick={(e) => deleteFile(e)} />

                    <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }}>EDIT PROFILE</Button>
                        <Button variant="contained" onClick={goBack} sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>

                    </Box >

                </Box>
            </Box>
        </>
    )
}