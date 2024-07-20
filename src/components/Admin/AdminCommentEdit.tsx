import { useLoaderData, useNavigate } from "react-router-dom";
import { Comment } from "../../model/comment";
import { ApiComment } from "../../services/commentService";
import { IdType } from "../../shared/common-types";
import * as commentService from '../../services/commentService';
import { Box, Button, Grid, Typography } from "@mui/material";
import FormTextArea from "../FormFields/FormTextArea";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from "react-hook-form";
import { BaseSyntheticEvent, FC } from "react";
import { LoginContext } from "../../hooks/LoginContext";
import { useContext } from 'react'
import jwt_decode from "jwt-decode";

const API_COMMENT: ApiComment<IdType, Comment> = new commentService.ApiCommentImpl<IdType, Comment>('data/comments');

type decode = {
    _id: string;
}

type FormData = {
    comment: string;

}


const schema = yup.object({
    comment: yup.string().required('Comment cannot be empty.').min(1)
        .max(1000, 'Maximum comment length is 1000 characters.')
        .matches(/^(?!\s+$).*/, 'Comment cannot be empty string.'),


}).required();

let userId: string;




const AdminCommentEdit: FC = () => {


    const comment = useLoaderData() as Comment;
    const navigate = useNavigate();


    const { token } = useContext(LoginContext);


    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined


    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id;

    }


    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({

        defaultValues: { comment: comment.comment, },
        mode: 'onChange',
        resolver: yupResolver(schema),
    });




    const editCommentSubmitHandler = (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {
        if (accessToken) {

            data.comment = data.comment.trim();
            const editComment = { ...data } as any as Comment;

            API_COMMENT.update(comment._id, editComment, accessToken).then((data) => {
                navigate(-1);
            }).catch((err) => {
                console.log(err)
            });

        }
    }



    const goBack = () => {
        navigate(-1);
    }

    const handeleDelete = () => {

        if (accessToken) {

            API_COMMENT.deleteById(comment._id, accessToken).then((data) => {

                navigate(-1)

            }).catch((err) => {
                console.log(err)
            });
        }

    }

    const handeleDeleteReports = () => {

        if ((userId !== undefined) && (comment !== undefined) && (userId !== null) && accessToken) {
            const reports: [] = [];

            API_COMMENT.deleteReportComment(comment._id, reports, accessToken).then((data) => {
                navigate(-1)

            }).catch((err) => {
                console.log(err);
            });

        }

    }



    return (
        <>

            <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh', '@media(max-width: 600px)': { display: 'flex', padding: '50px' } }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Box component='form'
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        maxWidth: '620px',
                        height: 'fit-content',
                        padding: '30px',
                        marginTop: '50px',
                        backgroundColor: '#8d868670',
                        boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px',
                        '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },
                        '& .MuiButton-root': { m: 1, width: '32ch' },
                    }}
                    noValidate
                    autoComplete='0ff'
                    onSubmit={handleSubmit(editCommentSubmitHandler)}
                >
                    <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h5">
                        EDIT A COMMENT
                    </Typography>
                    <FormTextArea name="comment" label="Comment" control={control} error={errors.comment?.message} multiline={true} rows={4} />
                    <Typography gutterBottom variant="subtitle1" component="div">
                        Reported by IDs : {comment?.reportComment?.join(', ')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>

                        <Button variant="contained" onClick={handeleDeleteReports} sx={{ ':hover': { background: '#ef0a0a' }, margin: '5px' }}>DELETE REPORTS COMMENT</Button>
                        <Button variant="contained" onClick={handeleDelete} sx={{ ':hover': { background: '#ef0a0a' }, margin: '5px' }}>DELETE COMMENT</Button>
                        <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }}>ADMIN EDIT COMMENT</Button>
                        <Button onClick={goBack} variant="contained" sx={{ ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >BACK</Button>
                    </Box>

                </Box>

            </Grid>
        </>
    )
}

export default AdminCommentEdit;