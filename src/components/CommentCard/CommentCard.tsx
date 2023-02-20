import { Avatar, Button, Card, Tooltip, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Comment } from "../../model/comment";
import { User } from "../../model/users";
import * as userService from '../../services/userService';
import { ApiClient } from "../../services/userService";
import { IdType } from "../../shared/common-types";
import { stringAvatar } from '../../shared/common-types';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import ReportOffIcon from '@mui/icons-material/ReportOff';
import jwt_decode from "jwt-decode";
import { LoginContext } from "../../App";
import { Link } from "react-router-dom";



export interface CommentListener {
    (comment: Comment): void;
}


type decode = {
    _id: string,
    email: string,
    firstName: string,
    lastName: string,
    role: string
}

interface CommentCardProps {
    comment: Comment;
    onDeleteCom: CommentListener;
    onEditCom: CommentListener;
    onReportClickHandlerComment: CommentListener
    onUnReportClickHandlerComment: CommentListener
    reportedComment: boolean
    userId: IdType
}


const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');


export default function CommentCard({ comment, onDeleteCom, onEditCom, onReportClickHandlerComment, onUnReportClickHandlerComment, reportedComment, userId }: CommentCardProps) {


    const [user, setUser] = useState<User>();

    const { userL, setUserL } = useContext(LoginContext)

    const accessToken = userL?.accessToken ? userL.accessToken : sessionStorage.getItem('accessToken') ? sessionStorage.getItem('accessToken') : undefined

    let role = 'user';
    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;
    }



    const name = user?.firstName + ' ' + user?.lastName;



    useEffect(() => {
        if (userId) {
            API_CLIENT.findById(userId).then((data) => {
                setUser(data);

            }).catch(err => console.log(err));
        }

    }, []);



    const handeleDelete = () => {
        onDeleteCom(comment);
    }

    const handeleEdit = () => {
        onEditCom(comment);
    }


    const handleReportClickHandlerComment = () => {
        onReportClickHandlerComment(comment)
    }

    const handleUnReportClickHandlerComment = () => {
        onUnReportClickHandlerComment(comment)
    }

    const MuiTooltiReport = () => {
        return (
            <Tooltip title='REPORT COMMENT' arrow>
                <ReportGmailerrorredIcon color="primary" onClick={handleReportClickHandlerComment} fontSize="large" sx={{ ':hover': { cursor: 'pointer', color: 'red' }, margin: '5px' }} />

            </Tooltip>
        )
    }



    const MuiTooltiUnReport = () => {
        return (
            <Tooltip title='UN REPORT COMMENT' arrow>
                <ReportOffIcon color="primary" onClick={handleUnReportClickHandlerComment} fontSize="large" sx={{ ':hover': { cursor: 'pointer', color: 'red' }, margin: '5px' }} />

            </Tooltip>
        )
    }

    return (
        <>
            <Card sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                maxWidth: '350px', margin: '20px',
                height: 'fit-content',
                padding: '30px', backgroundColor: '#8d868670',
                boxShadow: '3px 2px 5px black', border: 'solid 2px', borderRadius: '12px'
            }}>
                {user?.imageFile ?
                    <Avatar alt="Remy Sharp" src={`https://storage.googleapis.com/hack-trip/${user.imageFile}`} />
                    : <Avatar {...stringAvatar(name)} />}

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
                    {((comment.reportComment?.some((x) => x === userId))) ?

                        <MuiTooltiUnReport />
                        :
                        <MuiTooltiReport />
                    }

                </span>

                {(((user !== undefined && user.role.toString() === 'admin') || (user !== undefined && user.role.toString() === 'manager')) && (role === 'admin' || role === 'manager')) ?


                    < Button component={Link} to={`/admin/comment/edit/${comment?._id}`} variant="contained" sx={{ ':hover': { background: '#4daf30' }, padding: '10px 10px', margin: '5px' }}>ADMIN EDIT COMMENT</Button>
                    : ''
                }

            </Card>
        </>
    )
}


