import { Box, Button, ImageList, ImageListItem, Typography } from "@mui/material";
import { FC, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IFailedLogs, User } from "../../model/users";
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
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';



const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data');
const API_COMMENT: ApiComment<IdType, CommentCreate> = new commentService.ApiCommentImpl<IdType, CommentCreate>('data/comments');
const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');

type decode = {
    _id: string;
}



let userId: string;

export type GcloudImage = {
    name: string;
    generation: string;
    timeCreated: string;
    updated: string;
    timeStorageClassUpdated: string;
};

export type CommonImagesData = {
    dbOnlyImages: string[];
    cloudOnlyImages: string[];
};

const Admin: FC = () => {

    const navigate = useNavigate();

    const { token } = useContext(LoginContext);

    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined
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
    const [failedLogs, setFailedLogs] = useState<IFailedLogs[]>();
    const [hideFailedLogsList, setHideFailedLogsList] = useState<boolean>(true);
    const [selectedRow, setSelectedRow] = useState<GridRowSelectionModel>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(5);
    const [dbImages, setDbImages] = useState<string[]>();
    const [gcloudImages, setGcloudImages] = useState<GcloudImage[]>();
    const [commonImages, setCommonImages] = useState<CommonImagesData>();
    const [hideDBImages, setHideDBImages] = useState<boolean>(true);
    const [hideGCImages, setHideGCImages] = useState<boolean>(true);
    const [hideCommonImages, setHideCommonImages] = useState<boolean>(true);
    const [colsDB, setColsDB] = useState<number>(4);
    const [colsGC, setColsGC] = useState<number>(4);


    useEffect(() => {

        API_CLIENT.findAll(userId).then((data) => {
            setUsers(data);
        }).catch(err => {
            console.log(err);
        });

        API_CLIENT.getFailedLogs(userId).then((data) => {
            setFailedLogs(data);
        }).catch(err => {
            console.log(err);
        });

        API_TRIP.getAllReportTrips(userId).then((data) => {
            setTrips(data);
        }).catch(err => {
            console.log(err);
        });

        API_COMMENT.getAllReportComments(userId).then((data) => {
            setComments(data);
        }).catch(err => {
            console.log(err);
        });

        API_TRIP.getDBImages(userId).then((data) => {
            setDbImages(data)
        }).catch(err => {
            console.log(err.message)
        })

        API_TRIP.getGCImages(userId).then((data) => {
            setGcloudImages(data)
        }).catch(err => {
            console.log(err.message)
        })

        API_TRIP.getCommonImages(userId).then((data) => {
            setCommonImages(data)
        }).catch(err => {
            console.log(err.message)
        })

        const updateColsDB = () => {

            const newColsDB = Math.floor(window.innerWidth / 100) || 3;
            setColsDB(newColsDB);

        };

        const updateColsGC = () => {

            const newColsGC = Math.floor(window.innerWidth / 100) || 3;
            setColsGC(newColsGC);

        };

        const handleResize = () => {
            updateColsDB();
            updateColsGC();
        };

        window.addEventListener('resize', handleResize);

        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };

    }, []);



    const hideUsers = () => {
        setHideUsersList(!hideUsersList);
    }


    const hideTrips = () => {
        setHideTripsList(!hideTripsList);
    }


    const hideComments = () => {
        setHideCommentsList(!hideCommentsList);
    }

    const hideFailedLOgs = () => {
        setHideFailedLogsList(!hideFailedLogsList);
    }

    const hideDBImg = () => {
        setHideDBImages(!hideDBImages);
    }
    const hideGCImg = () => {
        setHideGCImages(!hideGCImages);
    }
    const hideCommImg = () => {
        setHideCommonImages(!hideCommonImages);
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

            API_COMMENT.adminUnReportComment(comment._id, comment).then((data) => {

                setReportedComment(false);
                setComments(data);
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
                console.log(err);
            });
        }

    }


    const onEditComment = async (comment: CommentCreate) => {
        navigate(`/admin/comments/edit/${comment._id}`);
    }


    const columns: GridColDef[] = [
        { field: 'date', headerName: 'Date', width: 230 },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'ip', headerName: 'IP', width: 180 },
        { field: 'userAgent', headerName: 'User Agent', width: 380 },
        { field: 'country_code', headerName: 'C Code' },
        { field: 'city', headerName: 'City' },
        { field: 'postal', headerName: 'Postual' },
        { field: 'latitude', headerName: 'Lat', width: 130 },
        { field: 'longitude', headerName: 'Lng', width: 130 },
        { field: 'state', headerName: 'State', width: 130 }
    ];

    const handleSelectionModelChange = (selectionModel: GridRowSelectionModel) => {

        setSelectedRow(selectionModel);
    };


    const handeleDeleteRows = () => {
        if (selectedRow.length > 0) {

            API_CLIENT.deleteFailedLogs(userId, selectedRow).then((data) => {

                const updatedFailedLogs = failedLogs ? failedLogs.filter((log: IFailedLogs) => !selectedRow.includes(log._id!)) : [];

                if (updatedFailedLogs.length / pageSize <= (currentPage)) {

                    setCurrentPage(prev => Math.floor(updatedFailedLogs.length / pageSize) - 1);
                }

                setFailedLogs(updatedFailedLogs);

            }).catch((err) => {
                console.log(err);
            })
        }
    }
    const changePage = (newPage: any) => {
        setCurrentPage(newPage.page);
        setPageSize(newPage.pageSize);
    }

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#cfe8fc', minHeight: '100vh', marginTop: '-24px', maxWidth: '100vW', alignContent: 'center', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', margin: '20px' }}>

                    <Button variant="contained" onClick={hideUsers} sx={{ maxWidth: '150px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black', margin: '4px' }}  >{hideUsersList ? 'HIDE USERS' : 'SHOW USERS'} </Button>
                    {trips !== undefined && trips.length > 0 ?
                        <Button variant="contained" onClick={hideTrips} sx={{ maxWidth: '150px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black', margin: '4px' }}  >{hideTripsList ? 'HIDE TRIPS' : 'SHOW TRIPS'} </Button>
                        : <h4 style={{ margin: '15px' }}>NO TRIPS REPORTED</h4>}

                    {comments !== undefined && comments.length > 0 ?
                        <Button variant="contained" onClick={hideComments} sx={{ maxWidth: '150px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black', margin: '4px' }}  >{hideCommentsList ? 'HIDE COMMENTS' : 'SHOW COMMENTS'} </Button>
                        : <h4 style={{ margin: '15px' }}>NO COMMENTS REPORTED</h4>
                    }
                    {failedLogs !== undefined && failedLogs.length > 0 ?
                        <Button variant="contained" onClick={hideFailedLOgs} sx={{ maxWidth: '150px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black', margin: '4px' }}  >{hideFailedLogsList ? 'HIDE LOGS' : 'SHOW LOGS'} </Button>
                        : <h4 style={{ margin: '15px' }}>NO FAILED LOGS</h4>
                    }
                    {dbImages !== undefined && dbImages.length > 0 ?
                        <Button variant="contained" onClick={hideDBImg} sx={{ maxWidth: '150px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black', margin: '4px' }}  >{hideDBImages ? 'HIDE DB IMAGES' : 'SHOW DB IMAGES'} </Button>
                        : <h4 style={{ margin: '15px' }}>NO DB IMAGES</h4>
                    }
                    {gcloudImages !== undefined && gcloudImages.length > 0 ?
                        <Button variant="contained" onClick={hideGCImg} sx={{ maxWidth: '150px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black', margin: '4px' }}  >{hideGCImages ? 'HIDE GC IMAGES' : 'SHOW GC IMAGES'} </Button>
                        : <h4 style={{ margin: '15px' }}>NO GC IMAGES</h4>
                    }
                    {commonImages && (commonImages.dbOnlyImages.length > 0 || commonImages.cloudOnlyImages.length > 0) ?
                        <Button variant="contained" onClick={hideCommImg} sx={{ maxWidth: '150px', ':hover': { color: 'rgb(248 245 245)' }, background: 'rgb(194 194 224)', color: 'black', margin: '4px' }}  >{hideCommonImages ? 'HIDE COMM IMAGES' : 'SHOW COMM IMAGES'} </Button>
                        : <h4 style={{ margin: '15px' }}>NO COMMON IMAGES</h4>
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
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '98%', '@media(max-width: 750px)': { display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '95%', alignContent: 'center' } }}>

                            {(failedLogs !== undefined && failedLogs.length > 0) ?
                                <>
                                    <DataGrid
                                        key={currentPage}
                                        sx={{ maxWidth: '100%', bgcolor: 'white' }}
                                        rows={failedLogs.map((log, index) => ({ id: log._id || index, ...log }))}
                                        columns={columns}
                                        initialState={{
                                            pagination: {
                                                paginationModel: { page: currentPage !== undefined ? currentPage : 0, pageSize: pageSize !== undefined ? pageSize : 5 }
                                            },
                                        }}

                                        pageSizeOptions={[5, 10]}
                                        checkboxSelection
                                        onRowSelectionModelChange={handleSelectionModelChange}

                                        onPaginationModelChange={(newPage: any) => changePage(newPage)}


                                    />
                                    <Button variant="contained" onClick={handeleDeleteRows} sx={{ ':hover': { background: '#ef0a0a' }, margin: '5px' }} disabled={selectedRow.length === 0}>DELETE ROWS</Button>
                                </>
                                : ''}
                        </Box>
                        : ''}

                    {hideDBImages ?
                        <>

                            {(dbImages && dbImages.length > 0) ?
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography variant="subtitle1" align={'center'}>DB IMAGES</Typography>

                                    <ImageList sx={{ maxWidth: '95%', height: 'auto', '@media(max-width: 600px)': { width: '100%', height: 'auto' } }} cols={colsGC} rowHeight={'auto'}>
                                        {dbImages.map((item, i) => (
                                            <ImageListItem key={i}>
                                                <img
                                                    src={`https://storage.googleapis.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format&q=50`}
                                                    srcSet={`https://storage.googleapis.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format&q=50&dpr=2 2x`}
                                                    alt={item}
                                                    loading="lazy"
                                                    // onClick={onClickImage}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </ImageListItem>
                                        ))}
                                    </ImageList>
                                </Box>

                                : ''}
                        </>
                        : ''}

                    {hideGCImages ?
                        <>

                            {(gcloudImages && gcloudImages.length > 0) ?
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography variant="subtitle1" align={'center'}>GC IMAGES</Typography>
                                    <ImageList sx={{ maxWidth: '95%', height: 'auto', '@media(max-width: 600px)': { width: 'auto', height: 'auto' } }} cols={colsGC} rowHeight={'auto'}>
                                        {gcloudImages.map((item, i) => (
                                            <ImageListItem key={i}>
                                                <img
                                                    src={`https://storage.googleapis.com/hack-trip/${item.name}?w=164&h=164&fit=crop&auto=format&q=70`}
                                                    srcSet={`https://storage.googleapis.com/hack-trip/${item.name}?w=164&h=164&fit=crop&auto=format&q=70&dpr=2 2x`}
                                                    alt={item.name}
                                                    loading="lazy"
                                                    // onClick={onClickImage}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </ImageListItem>
                                        ))}
                                    </ImageList>
                                </Box>

                                : ''}
                        </>
                        : ''}
                    {hideCommonImages ?
                        <>
                            {(commonImages && commonImages.dbOnlyImages.length > 0) ?
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography variant="subtitle1" align={'center'}>DB IMAGES</Typography>
                                    <ImageList sx={{ maxWidth: '95%', height: 'auto', '@media(max-width: 600px)': { width: 'auto', height: 'auto' } }} cols={colsDB} rowHeight={'auto'}>
                                        {commonImages.dbOnlyImages.map((item: string, i: number) => (
                                            <ImageListItem key={i}>
                                                <img
                                                    src={`https://storage.googleapis.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format&q=70`}
                                                    srcSet={`https://storage.googleapis.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format&q=70&dpr=2 2x`}
                                                    alt={item}
                                                    loading="lazy"
                                                    // onClick={onClickImage}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </ImageListItem>
                                        ))}
                                    </ImageList>
                                </Box> :
                                <Typography variant="subtitle1" align={'center'}>NO DB IMAGES</Typography>
                            }
                            {(commonImages && commonImages.cloudOnlyImages.length > 0) ?
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography variant="subtitle1">GC IMAGES</Typography>
                                    <ImageList sx={{ maxWidth: '95%', height: 'auto', '@media(max-width: 600px)': { width: 'auto', height: 'auto' } }} cols={colsGC} rowHeight={'auto'}>
                                        {commonImages.cloudOnlyImages.map((item: string, i: number) => (
                                            <ImageListItem key={i}>
                                                <img
                                                    src={`https://storage.googleapis.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format&q=70`}
                                                    srcSet={`https://storage.googleapis.com/hack-trip/${item}?w=164&h=164&fit=crop&auto=format&q=70&dpr=2 2x`}
                                                    alt={item}
                                                    loading="lazy"
                                                    // onClick={onClickImage}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </ImageListItem>
                                        ))}
                                    </ImageList>
                                </Box> :
                                <Typography variant="subtitle1" align={'center'} >NO GC IMAGES</Typography>
                            }
                        </>

                        : ''}
                </Box>

            </Box>
        </>
    )
}

export default Admin;