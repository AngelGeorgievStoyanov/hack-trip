
import { Box, Button, Card, CardContent, MobileStepper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Trip } from '../../../../model/trip';
import jwt_decode from "jwt-decode";
import { LoginContext } from '../../../../App';
import { FC, ReactElement, useContext, useState, TouchEvent } from 'react';
import { IdType } from '../../../../shared/common-types';
import { User } from '../../../../model/users';
import * as userService from '../../../../services/userService';
import { ApiClient } from '../../../../services/userService';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import FavoriteIcon from '@mui/icons-material/Favorite';

type decode = {
    _id: string,
    role: string
}

interface TripCardProps {
    trip: Trip;

}



const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');

let userId: string | undefined;

// const slideInEllipticBottom = keyframes` 
// 0% {
//     -webkit-transform: translateY(600px) rotateX(-30deg) scale(6.5);
//             transform: translateY(600px) rotateX(-30deg) scale(6.5);
//     -webkit-transform-origin: 50% -100%;
//             transform-origin: 50% -100%;
//     opacity: 0;
//   }
//   100% {
//     -webkit-transform: translateY(0) rotateX(0) scale(1);
//             transform: translateY(0) rotateX(0) scale(1);
//     -webkit-transform-origin: 50% 500px;
//             transform-origin: 50% 500px;
//     opacity: 1;
//   }
// `;

const TripCard: FC<TripCardProps> = ({ trip }): ReactElement => {

    const [userVerId, setUserVerId] = useState<boolean>(false)
    const [activeStep, setActiveStep] = useState(0);
    const [touchStart, setTouchStart] = useState<number>(0)
    const [touchEnd, setTouchEnd] = useState<number>(0)

    const minSwipeDistance = 45;
    const theme = useTheme();
    const { token } = useContext(LoginContext);
    const isMobile = useMediaQuery('(max-width:900px)');

    const accessToken = token ? token : localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined

    let role = 'user';
    if (accessToken) {
        const decode: decode = jwt_decode(accessToken);
        role = decode.role;
        userId = decode._id
    }


    if (userId !== undefined && userId !== null) {
        API_CLIENT.findUserId(userId).then((data) => {

            setUserVerId(data)
        }).catch((err) => {
            console.log(err)
        })
    }


    const maxSteps = trip.imageFile ? trip.imageFile.length : 0;

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




    return (
        <>
            {(((trip.reportTrip !== undefined) && (trip.reportTrip !== null) && (Number(trip.reportTrip)) >= 5) && (role === 'user')) ? '' :
                <Card sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    maxWidth: '300px', margin: '20px',
                    height: 'fit-content',
                    padding: '25px 0px 0px 0px', backgroundColor: '#eee7e79e',
                    boxShadow: '3px 2px 5px black', border: 'solid 1px', borderRadius: '0px',
                    // animation: `${slideInEllipticBottom} 1.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1s both`
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: isMobile ? 'auto' : '-webkit-fill-available', justifyContent: 'space-evenly' }}>

                        <Typography gutterBottom variant="h5" sx={{ padding: '0px 15px' }}>
                            Title: {trip.title}
                        </Typography>
                        <Typography gutterBottom variant="h6" sx={{ padding: '0px 15px' }}>
                            Destination: {trip.destination}
                        </Typography>
                    </Box>
                    {trip.imageFile?.length && trip.imageFile.length > 0 ?
                        <>
                            <img onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} src={`https://storage.googleapis.com/hack-trip/${trip.imageFile[activeStep]}`} alt='hack trip' title='hack trip' loading="lazy" width='300px' height='200px' style={{ aspectRatio: '1/1' }} />

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
                            (((role === 'admin') || (role === 'manager')) && ((Number(trip.reportTrip) > 0) || (trip.reportTrip?.toString().length === 36)) && (userVerId === true)) ?
                                <Button href={`/admin/trip/details/${trip._id}`} variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, padding: '10px 50px' }}>DETAILS</Button>
                                :
                                (userVerId === true && accessToken !== undefined) ?
                                    <Button href={`/trip/details/${trip._id}`} variant="contained" type='submit' sx={{ ':hover': { background: '#4daf30' }, padding: '10px 50px' }}>DETAILS</Button>
                                    :
                                    ''}

                        {Number(trip.likes) > 0 ?
                            < Typography sx={{ margin: '10px' }} gutterBottom variant="h6" component="div">
                                LIKES: {Number(trip.likes[0])}
                            </Typography>
                            :
                            < Typography sx={{ margin: '10px', display: 'flex', alignItems: 'center' }} gutterBottom variant="h6" component="div">
                                LIKES: <FavoriteIcon color="primary" />
                            </Typography>
                        }

                    </CardContent>
                </Card>
            }
        </>

    )
}

export default TripCard;