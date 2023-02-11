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
import { BaseSyntheticEvent, useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";


const API_COMMENT: ApiComment<IdType, Comment> = new commentService.ApiCommentImpl<IdType, Comment>('data/comments');


type FormData = {
    comment: string;

}


const schema = yup.object({
    comment: yup.string().required('Comment cannot be empty.').min(1)
        .max(1000, 'Maximum comment length is 1000 characters.')
        .matches(/^(?!\s+$).*/, 'Comment cannot be empty string.'),


}).required();



export default function EditComment() {

    const comment = useLoaderData() as Comment;
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [buttonAdd, setButtonAdd] = useState<boolean>(true)

    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({

        defaultValues: { comment: comment.comment, },
        mode: 'onChange',
        resolver: yupResolver(schema),
    });




    const editCommentSubmitHandler = (data: FormData, event: BaseSyntheticEvent<object, any, any> | undefined) => {
        setButtonAdd(false)
        data.comment = data.comment.trim();
        const editComment = { ...data } as any as Comment;

        API_COMMENT.update(comment._id, editComment).then((data) => {
            setButtonAdd(true)
            navigate(`/trip/details/${comment._tripId}`);
        }).catch((err) => console.log(err));

    }



    const goBack = () => {
        navigate(-1);
    }


    return (
        <>

            <Grid container sx={{ justifyContent: 'center', bgcolor: '#cfe8fc', padding: '30px', minHeight: '100vh', '@media(max-width: 600px)': { display: 'flex', padding: '50px' } }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Box component='form'
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        maxWidth: '600px',
                        maxHeight: '280px',
                        padding: '30px',
                        marginTop: '50px',
                        backgroundColor: '#8d868670',
                        boxShadow: '3px 2px 5px black', border: 'solid 2px', borderRadius: '12px',
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

                    <span>
                        {buttonAdd === true ?
                            <Button variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' } }}>EDIT COMMENT</Button>
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