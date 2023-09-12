import { useNavigate, useParams } from "react-router-dom";
import { CommentCreate } from "../../model/comment";
import { ApiComment } from "../../services/commentService";
import { IdType } from "../../shared/common-types";
import * as commentService from '../../services/commentService'
import { Box, Button, Grid, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { BaseSyntheticEvent, FC, useEffect, useState } from "react";
import FormTextArea from "../FormFields/FormTextArea";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingButton from "@mui/lab/LoadingButton";
import { LoginContext } from "../../App";
import { useContext } from 'react'
import jwt_decode from "jwt-decode";
import { User } from "../../model/users";
import * as userService from '../../services/userService'
import { ApiClient } from "../../services/userService";
import * as tripService from '../../services/tripService';
import { Trip } from '../../model/trip';
import { ApiTrip } from '../../services/tripService';

const API_COMMENT: ApiComment<IdType, CommentCreate> = new commentService.ApiCommentImpl<IdType, CommentCreate>('data/comments');
const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');
const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data/trips');

type FormData = {
    comment: string;
    nameAuthor: string;
    _ownerId: string;
    _tripId: string;
}


const schema = yup.object({
    comment: yup.string().required('Comment cannot be empty.')
        .min(1).max(1000, 'Maximum comment length is 1000 characters.')
        .matches(/^(?!\s+$).*/, 'Comment cannot be empty string.'),


}).required();

type decode = {
    _id: string;
}

let userId: string;




const CreateComment: FC = () => {


    const idTrip = useParams().tripId;


    const { userL } = useContext(LoginContext);

    const [loading, setLoading] = useState<boolean>(true);
    const [nameAuthor, setNameAuthor] = useState<string>()
    const [buttonAdd, setButtonAdd] = useState<boolean>(true)
    const [imageBackground, setImageBackground] = useState<string>()


    const accessToken = userL?.accessToken ? userL.accessToken : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined


    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id;

    }

    useEffect(() => {
        if (userId) {
            API_CLIENT.findById(userId).then((data) => {
                setNameAuthor(data.firstName + ' ' + data.lastName)
            });

            API_TRIP.backgroundImages().then((data) => {
                setImageBackground(data[Math.floor(Math.random() * data.length)])

            }).catch((err) => {
                console.log(err)
            });
        }

    }, [])




    const { control, handleSubmit, formState: { errors, isDirty, isValid } } = useForm<FormData>({

        defaultValues: { comment: '', nameAuthor: '', _ownerId: '', _tripId: '' },
        mode: 'onChange',
        resolver: yupResolver(schema),
    });


    const navigate = useNavigate();
    const createCommentSubmitHandler = (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {
        setButtonAdd(false)
        if (userId !== undefined && nameAuthor !== undefined) {
            data.nameAuthor = nameAuthor + '';
            data._ownerId = userId + '';
            data._tripId = idTrip + '';

        }
        data.comment = data.comment.trim();

        const newComment = { ...data } as any as CommentCreate;

        API_COMMENT.create(newComment).then((data) => {
            setButtonAdd(true)
            navigate(`/trip/details/${idTrip}`);
        }).catch((err) => {
            console.log(err);
        });

    }

    const goBack = () => {
        navigate(-1);
    }


    return (
        <>

            <Grid container sx={{
                backgroundImage: imageBackground ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})` : '',
                backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover", backgroundAttachment: 'fixed',
                justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh',
                '@media(max-width: 600px)': { display: 'flex', padding: '50px', margin: '-25px 0px 0px 0px' }
            }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Box component='form'
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        maxWidth: '600px',
                        height: 'fit-content',
                        padding: '30px',
                        marginTop: '50px',
                        backgroundColor: '#eee7e79e',
                        boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px',
                        '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },
                        '& .MuiButton-root': { m: 1, width: '32ch' },

                    }}
                    noValidate
                    autoComplete='0ff'
                    onSubmit={handleSubmit(createCommentSubmitHandler)}
                >
                    <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h5">
                        WRITE A COMMENT
                    </Typography>

                    <FormTextArea name="comment" label="Comment" control={control} error={errors.comment?.message} multiline={true} rows={4} />

                    <span>
                        {buttonAdd === true ?
                            <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }} disabled={!isDirty || !isValid}>ADD COMMENT</Button>
                            : <LoadingButton variant="contained" loading={loading}   >
                                <span>disabled</span>
                            </LoadingButton>
                        }

                        <Button onClick={goBack} variant="contained" sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>
                    </span>

                </Box>

            </Grid>
        </>
    )
}

export default CreateComment;