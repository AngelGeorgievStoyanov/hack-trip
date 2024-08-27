
import { Box, Button, Card, CardContent, MobileStepper, Pagination, PaginationItem, PaginationRenderItemParams, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Trip } from '../../../../model/trip';
import jwt_decode from "jwt-decode";
import { LoginContext } from '../../../../hooks/LoginContext';
import { FC, ReactElement, useContext, useState, TouchEvent, useEffect } from 'react';
import { IdType, TripGroupId } from '../../../../shared/common-types';
import { User } from '../../../../model/users';
import * as userService from '../../../../services/userService';
import { ApiClient } from '../../../../services/userService';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import * as tripService from '../../../../services/tripService';
import { ApiTrip } from '../../../../services/tripService';

type Decode = {
    _id: string;
    role: string;
}

interface TripCardProps {
    trip: Trip;

}



const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');
const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data');

const TripCard: FC<TripCardProps> = ({ trip }): ReactElement => {

    const [userVerId, setUserVerId] = useState<boolean>(false);
    const [activeStep, setActiveStep] = useState(0);
    const [touchStart, setTouchStart] = useState<number>(0);
    const [touchEnd, setTouchEnd] = useState<number>(0);
    const [noTripOnThisDay, setNoTripOnThisDay] = useState<boolean>(false)
    const [pageValue, setPageValue] = useState<number>(1)
    const [currentTrip, setCurrentTrip] = useState<Trip | undefined>(trip)
    const [tripGroupTrips, setTripGroupTrips] = useState<TripGroupId[]>([]);

    const minSwipeDistance = 45;
    const theme = useTheme();
    const { token } = useContext(LoginContext);
    const isMobile = useMediaQuery('(max-width:700px)');

    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    let role = 'user';
    let userId: string | undefined;

    if (accessToken) {
        const decode: Decode = jwt_decode(accessToken);
        role = decode.role;
        userId = decode._id;
    }
    useEffect(() => {
        if (userId !== undefined && userId !== null && accessToken) {
            API_CLIENT.findUserId(userId, accessToken).then((data) => {

                setUserVerId(data)
            }).catch((err) => {
                console.log(err)
            })
        }
    }, [accessToken, userId]);

    useEffect(() => {
        if (trip) {
            fetchTripsByGroupId(trip.tripGroupId);
        }
    }, [trip]);

    const fetchTripsByGroupId = async (tripGroupId: string) => {
        if (accessToken) {

            API_TRIP.findByTripGroupId(tripGroupId, accessToken).then((data) => {

                setTripGroupTrips(data);
            }).catch((err) => {
                console.log(err)
            })
        }

    };


    const maxSteps = currentTrip?.imageFile ? currentTrip.imageFile.length : 0;
    const days = tripGroupTrips.map(trip => trip.dayNumber);
    const maxDay = Math.max(...days);
    const paginationItems = Array.from({ length: maxDay }, (_, i) => i + 1).map(day => ({
        day,
        available: days.includes(day)
    }));


    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }


    const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(0)
        setTouchStart(e.targetTouches[0].clientX)
    }


    const onTouchMove = (e: TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }



    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe === true) {

            if (activeStep < maxSteps - 1) {
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
            }

        } else if (isRightSwipe === true) {

            if (activeStep > 0) {
                setActiveStep((prevActiveStep) => prevActiveStep - 1);
            }
        }

    }


    const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
        const tripIndex = tripGroupTrips.findIndex(trip => trip.dayNumber === value);
        if (tripIndex !== -1) {
            setNoTripOnThisDay(false);
            setPageValue(value);

            if (userId && accessToken) {

                API_TRIP.findById(tripGroupTrips[tripIndex]._id, userId, accessToken).then((data) => {
                    setCurrentTrip(data);
                    setActiveStep(0);
                })
            }
        } else {
            setNoTripOnThisDay(true);
            setPageValue(value);
            setCurrentTrip(undefined);
        }
    };


    return (
        <>
            {currentTrip && (((currentTrip.reportTrip !== undefined) && (currentTrip.reportTrip !== null) && (Number(currentTrip.reportTrip)) >= 5) && (role === 'user')) ? '' :
                currentTrip ? (<Card sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    maxWidth: '300px', margin: '20px',
                    height: isMobile ? 'fit-content' : 'auto',
                    maxHeight: '540px',
                    width: '-webkit-fill-available',
                    padding: '25px 0px 0px 0px', backgroundColor: '#eee7e79e',
                    boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px',
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: isMobile ? 'auto' : '-webkit-fill-available', justifyContent: 'space-evenly' }}>

                        <Typography gutterBottom variant="h5" sx={{ padding: '0px 15px' }}>
                            Title: {currentTrip.title}
                        </Typography>
                        <Typography gutterBottom variant="h6" sx={{ padding: '0px 15px' }}>
                            Destination: {currentTrip.destination}
                        </Typography>
                    </Box>
                    {currentTrip.imageFile?.length && currentTrip.imageFile.length > 0 ?
                        <>
                            <img onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} src={`https://storage.googleapis.com/hack-trip/${currentTrip.imageFile[activeStep]}`} alt='hack trip' title='hack trip' loading="lazy" width='300px' height='200px' style={{ aspectRatio: '1/1' }} />

                            <MobileStepper
                                variant="dots"
                                steps={maxSteps}
                                position="static"
                                activeStep={activeStep}
                                sx={{ width: '-webkit-fill-available', flexGrow: 1, maxHeight: "20px" }}
                                nextButton={
                                    <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1}>
                                        Next
                                        {theme.direction === 'rtl' ? (
                                            <KeyboardArrowLeft />
                                        ) : (
                                            <KeyboardArrowRight />
                                        )}
                                    </Button>
                                }
                                backButton={
                                    <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                                        {theme.direction === 'rtl' ? (
                                            <KeyboardArrowRight />
                                        ) : (
                                            <KeyboardArrowLeft />
                                        )}
                                        Back
                                    </Button>
                                }
                            />
                        </>

                        :
                        <Typography gutterBottom component="h6" sx={{ padding: '0 15px' }}>
                            There is no image for this trip
                        </Typography>
                    }
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                        {
                            (((role === 'admin') || (role === 'manager')) && ((Number(currentTrip.reportTrip) > 0) || (currentTrip.reportTrip?.toString().length === 36)) && (userVerId === true)) ?
                                <Button href={`/admin/trip/details/${currentTrip._id}`} variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, padding: '10px 50px' }}>DETAILS</Button>
                                :
                                (userVerId === true && accessToken !== undefined) ?
                                    <Button href={`/trip/details/${currentTrip._id}`} variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, padding: '10px 50px' }}>DETAILS</Button>
                                    :
                                    ''}

                        {Number(currentTrip.likes) > 0 ?
                            < Typography sx={{ margin: '10px' }} gutterBottom variant="h6" component="div">
                                LIKES: {Number(currentTrip.likes)}
                            </Typography>
                            :
                            < Typography sx={{ margin: '10px', display: 'flex', alignItems: 'center' }} gutterBottom variant="h6" component="div">
                                LIKES: <FavoriteIcon color="primary" />
                            </Typography>
                        }

                        {tripGroupTrips.length > 1 && (
                            <Box>
                                <Pagination
                                    count={paginationItems.length}
                                    variant="outlined"
                                    shape="rounded"
                                    page={noTripOnThisDay ? pageValue : currentTrip?.dayNumber}
                                    onChange={handlePageChange}
                                    renderItem={(item: PaginationRenderItemParams) => (
                                        <PaginationItem
                                            {...item}
                                        />
                                    )}
                                    sx={{ marginTop: 2 }}
                                />
                            </Box>
                        )}
                    </CardContent>
                </Card>) :
                    <>
                        <Card sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            maxWidth: '300px', margin: '20px',
                            height: isMobile ? 'fit-content' : 'auto',
                            maxHeight: '500px',
                            width: '-webkit-fill-available',
                            padding: '25px 0px 0px 0px', backgroundColor: '#eee7e79e',
                            boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px',
                        }}>

                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: isMobile ? 'auto' : '-webkit-fill-available', justifyContent: 'space-evenly' }}>

                                <Typography gutterBottom variant="h5" sx={{ padding: '0px 15px' }}>
                                    No trip on {pageValue} day
                                </Typography>
                            </Box>
                            <CardContent>
                                {tripGroupTrips.length > 1 && (
                                    <Box>
                                        <Pagination
                                            count={paginationItems.length}
                                            variant="outlined"
                                            shape="rounded"
                                            page={pageValue}
                                            onChange={handlePageChange}
                                            renderItem={(item: PaginationRenderItemParams) => (
                                                <PaginationItem
                                                    {...item}
                                                />
                                            )}
                                            sx={{ marginTop: 2 }}
                                        />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </>
            }
        </>


    );
};

export default TripCard;
