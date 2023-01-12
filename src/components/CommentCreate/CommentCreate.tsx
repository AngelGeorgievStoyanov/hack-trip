import {  useNavigate, useParams } from "react-router-dom"
import { CommentCreate } from "../../model/comment";
import { ApiComment } from "../../services/commentService";
import { IdType } from "../../shared/common-types";

import * as commentService from '../../services/commentService'

import './CommentCreate.css'
import { Box, Button, Grid, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { BaseSyntheticEvent } from "react";
import FormTextArea from "../FormFields/FormTextArea";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';


const API_COMMENT: ApiComment<IdType, CommentCreate> = new commentService.ApiCommentImpl<IdType, CommentCreate>('data/comments');

type FormData = {
    comment: string;
    nameAuthor: string;
    _ownerId: string;
    _tripId: string;
}


const schema = yup.object({
    comment: yup.string().required('Comment cannot be empty.').min(1).max(1000, 'Maximum comment length is 1000 characters.'),


}).required();

export default function CreateComment() {

    const idTrip = useParams().tripId
    const userId = sessionStorage.getItem('userId')
    const nameAuthor = sessionStorage.getItem('email')


    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({




        defaultValues: { comment: '', nameAuthor: '', _ownerId: '', _tripId: '' },
        mode: 'onChange',
        resolver: yupResolver(schema),
    });


    const navigate = useNavigate()
    const createCommentSubmitHandler = (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {




        if (userId !== undefined && nameAuthor !== undefined) {
            data.nameAuthor = nameAuthor + ''
            data._ownerId = userId + ''
            data._tripId = idTrip + ''

        }


        const newComment = { ...data } as any as CommentCreate
        console.log(newComment)

        API_COMMENT.create(newComment).then((data) => {
            console.log(data)

            navigate(`/trip/details/${idTrip}`)
        }).catch((err) => {
            console.log(err)
        })




    }

    const goBack = () => {
        navigate(-1);
    }


    return (
        <>

            <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh' }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Box component='form'
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        maxWidth: '600px',
                        maxHeight: '250px',
                        padding: '30px',
                        marginTop: '50px',
                        backgroundColor: '#8d868670',
                        boxShadow: '3px 2px 5px black', border: 'solid 2px', borderRadius: '12px',
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

                        <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }}>ADD COMMENT</Button>
                        <Button onClick={goBack} variant="contained" sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>
                    </span>

                </Box>

            </Grid>
        </>
    )
}