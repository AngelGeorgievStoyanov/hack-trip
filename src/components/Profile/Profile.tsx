import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import FormInputText from "../FormFields/FormInputText";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import React, { BaseSyntheticEvent, useEffect, useState } from "react";

import * as userService from '../../services/userService'
import { IdType, toIsoDate } from "../../shared/common-types";
import { User } from "../../model/users";
import { ApiClient } from "../../services/userService";
import { MuiFileInput } from "mui-file-input";
import { options } from "../settings";





const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');

const schema1 = yup.object({
    email: yup.string().required().email(),
    firstName: yup.string().required().min(2).max(15),
    lastName: yup.string().required().min(2).max(15),

    oldpassword: yup.string().required('Old password is required.').matches(/^(?=(.*[a-zA-Z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/, 'Must contain 8 characters, at least one digit, and one character different from letter or digit'),
    password: yup.string().required('New password is required').matches(/^(?=(.*[a-zA-Z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/, 'Must contain 8 characters, at least one digit, and one character different from letter or digit'),
    confirmpass: yup.string().test('passwords-match', 'Passwords must match', function (value) { return this.parent.password === value }),


}).required();


const schema2 = yup.object({
    email: yup.string().required().email(),
    firstName: yup.string().required().min(2).max(15),
    lastName: yup.string().required().min(2).max(15),


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

export default function Profile() {

    const [user, setUser] = useState<User>()
    const [hide, setHide] = useState<boolean>(false)

    const [fileSelected, setFileSelected] = useState<File | undefined>()
    const [errorMessageImage, setErrorMessageImage] = useState<string | undefined>()
    const navigate = useNavigate()
    const userId = sessionStorage.getItem('userId')



    useEffect(() => {
        if (userId) {
            API_CLIENT.findById(userId).then((data) => {
                console.log(data)
                setUser(data)

            }).catch(err => console.log(err))
        }

    }, [])



    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({

        defaultValues: { email: '', firstName: '', lastName: '', password: '', confirmpass: '' },

        values: { email: user?.email!, firstName: user?.firstName!, lastName: user?.lastName!, oldpassword: '', password: '', confirmpass: '', imageFile: '', timeEdited: '', timeCreated: '' },

        mode: 'onChange',
        resolver: yupResolver(hide === true ? schema1 : schema2),
    });


    const editProfileSubmitHandler = async (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {


        if (data.oldpassword.length > 0 && data.password.length > 0 && data.confirmpass.length > 0) {

            if (userId) {


                API_CLIENT.changePassword(userId, data.oldpassword).then((data) => {
                    console.log(data)
                   
                }).catch((err) => {
                    console.log(err.message)

                    return
                })

            }
        }


        let formData = new FormData();


        if (fileSelected) {

            formData.append('file', fileSelected)


        }


        const imagesNames = await API_CLIENT.sendFile(formData).then((data) => {
            let imageName = data as unknown as any as any[]
            return imageName.map((x) => { return x.filename })
        }).catch((err) => {
            console.log(err)
        })


        if (imagesNames) {


            data.imageFile = imagesNames[0]
        }


        data.timeEdited = toIsoDate(new Date())


        const editedUser = { ...data }

        if (userId) {


            API_CLIENT.updateUser(userId, editedUser).then((data) => {
                console.log(data)
                setHide(!hide)
            }).catch((err) => console.log(err))

        }


    }


    const goBack = () => {
        navigate(-1);

    }


    const changePass = () => {
        setHide(!hide)
        if (hide === true) {

            reset({ oldpassword: '', password: '', confirmpass: '' })
        }
    }

    const handleFileChange = (file: any) => {

        if (file !== null) {

            if (!file.name.match(/\.(jpg|jpeg|PNG|gif|JPEG|png|JPG|gif)$/)) {
                setErrorMessageImage('Please select valid file image');


                return;
            }
            if (file.name.match(/\.(jpg|jpeg|PNG|gif|JPEG|png|JPG|gif)$/)) {
                setErrorMessageImage(undefined)
            }
        }
        setFileSelected(prev => file);

    };

    const deleteFile = (e: React.MouseEvent) => {


        let svg = e.target as HTMLElement

        if (svg.tagName === 'svg') {

            setFileSelected(undefined)
        }
    }

    return (

        <>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', bgcolor: '#cfe8fc', minHeight: '100vh', marginTop: '-24px' }}>
                <Box component="form" sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    maxWidth: '600px',
                    maxHeight: '500px',
                    padding: '30px',
                    backgroundColor: '#8d868670',
                    boxShadow: '3px 2px 5px black', border: 'solid 2px', borderRadius: '12px',
                    '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },
                    '& .MuiButton-root': { m: 1, width: '32ch' },
                }}
                    noValidate
                    autoComplete='0ff'
                    onSubmit={handleSubmit(editProfileSubmitHandler)}
                >
                    <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h5">
                        PROFILE
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

                    <MuiFileInput value={fileSelected ? fileSelected : undefined} name='inpImages' helperText={errorMessageImage} inputProps={{ accept: { 'image/png': ['.png'] } }} onChange={handleFileChange} onClick={(e) => deleteFile(e)} />

                    <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }}>EDIT PROFILE</Button>
                        <Button variant="contained" onClick={goBack} sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>
                        <Button variant="contained" onClick={changePass} sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >CHANGE PASSWORD</Button>

                    </Box >

                </Box>
            </Box>
        </>
    )
}