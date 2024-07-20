import { useContext } from 'react';
import jwt_decode from 'jwt-decode';
import { LoaderFunctionArgs } from 'react-router-dom';

import { ApiTrip } from '../services/tripService';
import { IdType } from '../shared/common-types';
import { TripCreate } from '../model/trip';
import { ApiComment } from '../services/commentService';
import { CommentCreate } from '../model/comment';
import { ApiClient } from '../services/userService';
import { User } from '../model/users';
import * as tripService from '../services/tripService';
import * as commentService from '../services/commentService';
import * as userService from '../services/userService';
import * as pointService from '../services/pointService';
import { ApiPoint } from '../services/pointService';
import { Point } from '../model/point';
import { LoginContext } from './LoginContext';

const API_TRIP: ApiTrip<IdType, TripCreate> = new tripService.ApiTripImpl<IdType, TripCreate>('data');
const API_COMMENT: ApiComment<IdType, CommentCreate> = new commentService.ApiCommentImpl<IdType, CommentCreate>('data/comments');
const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');
const API_POINT: ApiPoint<IdType, Point> = new pointService.ApiPointImpl<IdType, Point>('data/points');


const useLoaders = () => {
    
    const { token } = useContext(LoginContext);
   
    const getUserIdFromToken = () => {
        if (token) {
            const decode: { _id: string } = jwt_decode(token);
            return decode._id;
        }
        return null;
    };

    const tripLoader = async ({ params }: LoaderFunctionArgs) => {
        const userId = getUserIdFromToken();

        if (params.tripId && userId && token) {
            try {
                const trip = await API_TRIP.findById(params.tripId, userId, token);
                if (trip) {
                    return trip;
                }
            } catch (error) {
                const err = error as Error;
                console.log(err.message);
                throw new Error(`${err.message}`);
            }
        } else {
            throw new Error(`Invalid or missing trip ID`);
        }
    };

    const pointsLoader = async ({ params }: LoaderFunctionArgs) => {
        if (params.tripId && token) {
            return API_POINT.findByTripId(params.tripId, token);
        } else {
            throw new Error(`Invalid or missing points ID`);
        }
    };

    const pointLoaderById = async ({ params }: LoaderFunctionArgs) => {
        if (params.pointId && token) {
            return API_POINT.findByPointId(params.pointId, token);
        } else {
            throw new Error(`Invalid or missing point ID`);
        }
    };

    const commentLoaderById = async ({ params }: LoaderFunctionArgs) => {
        if (params.commentId && token) {
            return await API_COMMENT.findById(params.commentId, token);
        } else {
            throw new Error(`Invalid or missing comment ID`);
        }
    };

    const userIdLoader = async ({ params }: LoaderFunctionArgs) => {
        if (params.userId) {
            return await API_CLIENT.findById(params.userId);
        } else {
            throw new Error(`Invalid or missing user ID`);
        }
    };



    return {
        tripLoader,
        pointsLoader,
        pointLoaderById,
        commentLoaderById,
        userIdLoader,
    };
};

export default useLoaders;
