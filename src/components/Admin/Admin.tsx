import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { FC, useContext, useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { User } from "../../model/users";
import UsersList from "../UsersList/UsersList";
import * as tripService from '../../services/tripService';
import { IdType } from "../../shared/common-types";
import { ApiTrip } from "../../services/tripService";
import { Trip, TripCreate } from "../../model/trip";
import TripList from "../Trips/TripsList/TripsList";
import * as commentService from '../../services/commentService'
import { CommentCreate } from "../../model/comment";
import { ApiComment } from "../../services/commentService";
import CommentCard from "../CommentCard/CommentCard";
import { LoginContext } from "../../App";
import jwt_decode from "jwt-decode";
import * as userService from '../../services/userService';
import { ApiClient } from "../../services/userService";




const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data/trips');
const API_COMMENT: ApiComment<IdType, CommentCreate> = new commentService.ApiCommentImpl<IdType, CommentCreate>('data/comments');
const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');

type decode = {
    _id: string;
}



let userId: string;



const Admin: FC = () => {

    // const users = useLoaderData() as User[];
    const navigate = useNavigate();

    const { userL } = useContext(LoginContext);

    const accessToken = userL?.accessToken ? userL.accessToken : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        userId = decode._id;
    }


    const [trips, setTrips] = useState<Trip[]>();
    const [hideUsersList, setHideUsersList] = useState<boolean>(true);
    const [hideTripsList, setHideTripsList] = useState<boolean>(true);
    const [hideCommentsList, setHideCommentsList] = useState<boolean>(true);
    const [comments, setComments] = useState<CommentCreate[]>();
    const [reportedComment, setReportedComment] = useState<boolean>(false);
    const [users, setUsers] = useState<User[]>();
    const [failedLogs, setFailedLogs] = useState<any[]>()
    const [hideFailedLogsList, setHideFailedLogsList] = useState<boolean>(true);



    useEffect(() => {

        API_CLIENT.findAll(userId).then((data) => {
            setUsers(data)
        }).catch(err => {
            console.log(err)
        });

        API_CLIENT.getFailedLogs(userId).then((data) => {
            setFailedLogs(data)
        }).catch(err => {
            console.log(err)
        });

        API_TRIP.getAllReportTrips(userId).then((data) => {
            setTrips(data);
        }).catch(err => {
            console.log(err)
        });

        API_COMMENT.getAllReportComments(userId).then((data) => {
            setComments(data)
        }).catch(err => {
            console.log(err)
        });

    }, []);


    const hideUsers = () => {
        setHideUsersList(!hideUsersList);

    }


    const hideTrips = () => {
        setHideTripsList(!hideTripsList);
    }


    const hideComments = () => {

        setHideCommentsList(!hideCommentsList)
    }

    const hideFailedLOgs = () => {

        setHideFailedLogsList(!hideFailedLogsList)
    }


    const reportClickHandlerComment = (comment: CommentCreate) => {

        API_COMMENT.reportComment(comment._id, comment).then((data) => {
            setReportedComment(true);
            setComments(data);

        }).catch((err) => {
            console.log(err);
        });

    }



    const unReportClickHandlerComment = (comment: CommentCreate) => {

        if (comment.reportComment !== undefined) {

            const index = comment.reportComment.indexOf('1');

            comment.reportComment.splice(index, 1);

            API_COMMENT.reportComment(comment._id, comment).then((data) => {

                setReportedComment(false);
                setComments(data)
            }).catch((err) => {
                console.log(err);
            });

        }

    }



    const onDeleteComment = async (comment: CommentCreate) => {


        if (comments !== undefined) {
            API_COMMENT.deleteById(comment._id).then((data) => {
                if (data !== undefined) {
                    const copyComments = [...comments];
                    const index = copyComments.findIndex(cmt => {
                        return cmt._id === comment._id;
                    });

                    copyComments.splice(index, 1);

                    setComments(copyComments);
                }

            }).catch((err) => {
                console.log(err)
            });
        }

    }


    const onEditComment = async (comment: CommentCreate) => {
        navigate(`/admin/comments/edit/${comment._id}`);


    }




    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#cfe8fc', minHeight: '100vh', marginTop: '-24px', maxWidth: '100vW', alignContent: 'center', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-evenly', margin: '20px' }}>

                    <Button variant="contained" onClick={hideUsers} sx={{ maxWidth: '150px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black', margin: '4px' }}  >{hideUsersList ? 'HIDE USERS' : 'SHOW USERS'} </Button>
                    {trips !== undefined && trips.length > 0 ?
                        <Button variant="contained" onClick={hideTrips} sx={{ maxWidth: '150px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black', margin: '4px' }}  >{hideTripsList ? 'HIDE TRIPS' : 'SHOW TRIPS'} </Button>
                        : <h4>NO TRIPS REPORTED</h4>}



                    {comments !== undefined && comments.length > 0 ?
                        <Button variant="contained" onClick={hideComments} sx={{ maxWidth: '150px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black', margin: '4px' }}  >{hideCommentsList ? 'HIDE COMMENTS' : 'SHOW COMMENTS'} </Button>
                        : <h4>NO COMMENTS REPORTED</h4>
                    }
                    {failedLogs !== undefined && failedLogs.length > 0 ?
                        <Button variant="contained" onClick={hideFailedLOgs} sx={{ maxWidth: '150px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black', margin: '4px' }}  >{hideFailedLogsList ? 'HIDE LOGS' : 'SHOW LOGS'} </Button>
                        : <h4>NO FAILED LOGS</h4>
                    }

                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', '@media(max-width: 750px)': { display: 'flex', flexDirection: 'column', alignItems: 'center', alignContent: 'center' } }}>

                    {hideUsersList && (users !== undefined) && (users.length > 0) ?
                        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', '@media(max-width: 750px)': { display: 'flex', flexDirection: 'column', alignItems: 'center', alignContent: 'center' } }}>
                            <UsersList users={users} />

                        </Box>
                        : ''}


                    {hideTripsList ?
                        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', '@media(max-width: 750px)': { display: 'flex', flexDirection: 'column', alignItems: 'center', alignContent: 'center' } }}>
                            {trips !== undefined && trips.length > 0 ?
                                <TripList trips={trips} />
                                : ''}

                        </Box>
                        : ''}

                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', '@media(max-width: 750px)': { display: 'flex', flexDirection: 'column', maxWidth: '95%' } }}>


                    {hideCommentsList ?
                        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', '@media(max-width: 750px)': { display: 'flex', flexDirection: 'column', alignItems: 'center', alignContent: 'center' } }}>

                            {(comments !== undefined && comments.length > 0) ? comments.map((x) => <CommentCard key={x._id} comment={x} onDeleteCom={onDeleteComment} onEditCom={onEditComment} onUnReportClickHandlerComment={unReportClickHandlerComment} onReportClickHandlerComment={reportClickHandlerComment} reportedComment={reportedComment} userId={userId} />) : ''}
                        </Box>
                        : ''}

                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '95%', marginBottom: '15px', '@media(max-width: 750px)': { display: 'flex', flexDirection: 'column', alignContent: 'center', alignItems: 'center' } }}>


                    {hideFailedLogsList ?
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', '@media(max-width: 750px)': { display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '95%', alignContent: 'center' } }}>

                            {(failedLogs !== undefined && failedLogs.length > 0) ?
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell align="left">Email</TableCell>
                                                <TableCell align="left">IP</TableCell>
                                                <TableCell align="left">User Agent</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {failedLogs.map((row, i) => (
                                                <TableRow
                                                    key={i}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell component="th" scope="row">
                                                        {row.date}
                                                    </TableCell>
                                                    <TableCell align="right">{row.email}</TableCell>
                                                    <TableCell align="right">{row.ip}</TableCell>
                                                    <TableCell align="right">{row.userAgent}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                : ''}
                        </Box>
                        : ''}

                </Box>
            </Box >
        </>
    )
}

export default Admin;