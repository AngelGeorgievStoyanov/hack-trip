import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
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



const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data/trips');
const API_COMMENT: ApiComment<IdType, CommentCreate> = new commentService.ApiCommentImpl<IdType, CommentCreate>('data/comments');

export default function Admin() {

    const users = useLoaderData() as User[];
    const navigate = useNavigate();
    const userId = sessionStorage.getItem('userId') + ''

    const [trips, setTrips] = useState<Trip[]>();
    const [hideUsersList, setHideUsersList] = useState<boolean>(true);
    const [hideTripsList, setHideTripsList] = useState<boolean>(true);
    const [hideCommentsList, setHideCommentsList] = useState<boolean>(true);
    const [comments, setComments] = useState<CommentCreate[]>()
    const [reportedComment, setReportedComment] = useState<boolean>(false);



    useEffect(() => {

        API_TRIP.getAllReportTrips().then((data) => {
            setTrips(data);
        }).catch(err => {
            console.log(err)
        });

        API_COMMENT.getAllReportComments().then((data) => {
            setComments(data)
        }).catch(err => {
            console.log(err)
        });

    }, [])


    const hideUsers = () => {

        setHideUsersList(!hideUsersList);

    }


    const hideTrips = () => {
        setHideTripsList(!hideTripsList);
    }


    const hideComments = () => {

        setHideCommentsList(!hideCommentsList)
    }


    const reportClickHandlerComment = (comment: CommentCreate) => {

        API_COMMENT.reportComment(comment._id, comment).then((data) => {
            setReportedComment(true);
            setComments(data)

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
            <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#cfe8fc', minHeight: '100vh', marginTop: '-24px', maxWidth: '100vW' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-evenly', margin: '20px' }}>

                    <Button variant="contained" onClick={hideUsers} sx={{ maxWidth: '150px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >{hideUsersList ? 'HIDE USERS' : 'SHOW USERS'} </Button>
                    {trips !== undefined && trips.length > 0 ?
                        <Button variant="contained" onClick={hideTrips} sx={{ maxWidth: '150px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >{hideTripsList ? 'HIDE TRIPS' : 'SHOW TRIPS'} </Button>
                        : 'NO TRIPS REPORTED'}



                    {comments !== undefined && comments.length > 0 ?
                        <Button variant="contained" onClick={hideComments} sx={{ maxWidth: '150px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black' }}  >{hideCommentsList ? 'HIDE COMMENTS' : 'SHOW COMMENTS'} </Button>
                        : 'NO COMMENTS REPORTED'
                    }
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', '@media(max-width: 600px)': { display: 'flex', flexDirection: 'column', maxWidth: '95%' } }}>


                    {hideUsersList ?
                        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>


                            <UsersList users={users} />


                        </Box>

                        : ''}


                    {hideTripsList ?
                        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', }}>
                            {trips !== undefined && trips.length > 0 ?
                                <TripList trips={trips} />
                                : ''}

                        </Box>
                        : ''}

                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', '@media(max-width: 600px)': { display: 'flex', flexDirection: 'column', maxWidth: '95%' } }}>


                    {hideCommentsList ?
                        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>



                            {(comments !== undefined && comments.length > 0) ? comments.map((x) => <CommentCard key={x._id} comment={x} onDeleteCom={onDeleteComment} onEditCom={onEditComment} onUnReportClickHandlerComment={unReportClickHandlerComment} onReportClickHandlerComment={reportClickHandlerComment} reportedComment={reportedComment} userId={userId} />) : ''}




                        </Box>

                        : ''}


                    {hideTripsList ?
                        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', }}>
                            {trips !== undefined && trips.length > 0 ?
                                <TripList trips={trips} />
                                : ''}

                        </Box>
                        : ''}

                </Box>
            </Box>
        </>
    )
}