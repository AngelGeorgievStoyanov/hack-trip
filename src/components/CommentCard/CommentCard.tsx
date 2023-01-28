import { Avatar, Button, Card, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Comment } from "../../model/comment"
import { User } from "../../model/users";
import * as userService from '../../services/userService'
import { ApiClient } from "../../services/userService";
import { IdType } from "../../shared/common-types";
import {stringAvatar} from '../../shared/common-types'

export interface CommentListener {
    (comment: Comment): void;
}

interface CommentCardProps {
    comment: Comment;
    onDeleteCom: CommentListener
    onEditCom: CommentListener
}


const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');


export default function CommentCard({ comment, onDeleteCom, onEditCom }: CommentCardProps) {




    const userId = sessionStorage.getItem('userId')

    const [user, setUser] = useState<User>()


    const name = user?.firstName+' '+user?.lastName



    useEffect(() => {
        if (userId) {
            API_CLIENT.findById(userId).then((data) => {
                console.log(data)
                setUser(data)

            }).catch(err => console.log(err))
        }

    }, [])



    const handeleDelete = () => {
        onDeleteCom(comment)
    }

    const handeleEdit = () => {
        onEditCom(comment)
    }

    return (
        <>


            <Card sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                maxWidth: '350px', margin: '20px',

                padding: '30px', backgroundColor: '#8d868670',
                boxShadow: '3px 2px 5px black', border: 'solid 2px', borderRadius: '12px'
            }}>
                {user?.imageFile ?
                    <Avatar alt="Remy Sharp"  src={`http://localhost:8001/uploads/${user.imageFile}`} />
                    :  <Avatar {...stringAvatar(name)} />}

                <Typography gutterBottom component="h4">
                    Author name: {comment.nameAuthor}
                </Typography>
                <Typography gutterBottom component="p" sx={{ wordWrap: "break-word", padding: '5px' }}>
                    Comment: {comment.comment}
                </Typography>
                <span>
                    {comment._ownerId === userId ?
                        <>
                            <Button variant="contained" onClick={handeleEdit} sx={{ ':hover': { background: '#4daf30' }, margin: '5px' }}>EDIT COMMENT</Button>
                            <Button variant="contained" onClick={handeleDelete} sx={{ ':hover': { background: '#ef0a0a' }, margin: '5px' }}>DELETE COMMENT</Button>
                        </>
                        : ''}
                </span>

            </Card>
        </>
    )
}


