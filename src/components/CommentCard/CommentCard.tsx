import { Avatar, Button, Card, Tooltip, Typography } from "@mui/material";
import { FC, ReactElement, useContext, useEffect, useState } from "react";
import { Comment, CommentCreate } from "../../model/comment";
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
import * as commentService from '../../services/commentService'
import { ApiComment } from "../../services/commentService";



export interface CommentListener {
    (comment: Comment): void;
}


type decode = {
    role: string;
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

const API_COMMENT: ApiComment<IdType, CommentCreate> = new commentService.ApiCommentImpl<IdType, CommentCreate>('data/comments');


let name: string;


const CommentCard: FC<CommentCardProps> = ({ comment, onDeleteCom, onEditCom, onReportClickHandlerComment, onUnReportClickHandlerComment, reportedComment, userId }): ReactElement => {

    const [userImg, setUserImg] = useState<string>();

    const [user, setUser] = useState<User>()

    const { userL } = useContext(LoginContext)

    const accessToken = userL?.accessToken ? userL.accessToken : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    let role = 'user';
    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;
    }



    if (comment.nameAuthor !== undefined && comment.nameAuthor !== null) {

        name = comment.nameAuthor
    } else {
        name = 'A A'
    }


    useEffect(() => {
        if (comment._id) {
            API_COMMENT.findUserImage(comment._id).then((data) => {
                setUserImg(data)
            }).catch(err => {
                console.log(err)
            });
        }

        if (userId) {
            API_CLIENT.findById(userId).then((data) => {
                setUser(data);

            }).catch(err => {
                console.log(err)
            });
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
                padding: '30px', backgroundColor: '#eee7e7cc',
                boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px'
            }}>
                {userImg ?
                    <Avatar alt="Remy Sharp" src={`https://storage.googleapis.com/hack-trip/${userImg}`} />
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

export default CommentCard;


