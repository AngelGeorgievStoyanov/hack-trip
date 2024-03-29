import { createBrowserRouter, LoaderFunctionArgs, Outlet, RouterProvider } from 'react-router-dom';
import Home from './components/Home/Home';
import Trips from './components/Trips/Trips';
import Header from './components/Header/Header';
import ErrorBoundary from './utils/ErrorBoundary';
import Footer from './components/Footer/Footer';
import CreateTrip from './components/TripCreate/TripCreate';
import { Trip } from './model/trip';
import * as tripService from './services/tripService';
import { ApiTrip } from './services/tripService';
import TripDetails from './components/TripDetails/TripDetails';
import { IdType } from './shared/common-types';
import TripEdit from './components/TripEdit/TripEdit';
import TripPoints from './components/TripPoints/TripPoints';
import { Point } from './model/point';
import { ApiPoint } from './services/pointService';
import * as pointService from './services/pointService'
import PointEdit from './components/TripPoints/PointEdit/PointEdit';
import CreateComment from './components/CommentCreate/CommentCreate';
import EditComment from './components/CommentEdit/CommentEdit';
import { ApiComment } from './services/commentService';
import { Comment } from './model/comment';
import * as commentService from './services/commentService'
import { useState, createContext, FC, useEffect, useContext } from 'react';
import { User } from './model/users';
import MyTrips from './components/MyTrips/MyTrips';
import GuardedRoute from './components/GuardedRoute/GuardedRoute';
import NotFound from './components/NotFound/NotFound';
import './App.css';
import Profile from './components/Profile/Profile';
import Admin from './components/Admin/Admin';
import * as userService from './services/userService';
import { ApiClient } from './services/userService';
import AdminEdit from './components/Admin/AdminEdit';
import GuardedRouteAdmin from './components/GuardedRouteAdmin/GuardedRouteAdmin';
import AdminTripDetails from './components/Admin/AdminTripDetails';
import AdminTripEdit from './components/Admin/AdminTripEdit';
import MyFavorites from './components/MyFavorites/MyFavorites';
import AdminCommentEdit from './components/Admin/AdminCommentEdit';
import GuardedRouteTrip from './components/GuardedRouteTrip/GuardedRouteTrip';
import GuardedRoutePoint from './components/GuardedRoutePoints/GuardedRoutePoints';
import GuardedRouteComment from './components/GuardedRouteComment/GuardedRouteComment';
import TermPrivacy from './components/TermPrivacy/TermPrivacy';
import AboutUs from './components/About/About';
import Users from './components/Users/Users';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import ReSendVerifyEmail from './components/ReSendVerifyEmail/ReSendVerifyEmail';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import LiveTripTrackingCreate from './components/LiveTripTrackingCreate/LiveTripTrackingCreate/LiveTripTrackingCreate';
import jwt_decode from "jwt-decode";


const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data');

const API_POINT: ApiPoint<IdType, Point> = new pointService.ApiPointImpl<IdType, Point>('data/points');

const API_COMMENT: ApiComment<IdType, Comment> = new commentService.ApiCommentImpl<IdType, Comment>('data/comments')

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');



type LoginContext = {
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>
  loginUser: (authToken: string) => void;
  logoutUser: () => void;
}


export const LoginContext = createContext({} as LoginContext);

export const LoginProvider = ({ children }: any) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');

    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const loginUser = (authToken: string) => {
    setToken(authToken);
    localStorage.setItem('accessToken', authToken);
  };

  const logoutUser = () => {
    setToken(null);
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('pathname');
  };

  const contextValue: LoginContext = {
    token,
    setToken,
    loginUser,
    logoutUser
  };

  return (
    <LoginContext.Provider value={contextValue}>
      {children}
    </LoginContext.Provider>
  );
};


type decode = {
  _id: string;
}

let userId: string | undefined;
export async function tripLoader({ params }: LoaderFunctionArgs) {



  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    const decode: decode = jwt_decode(accessToken);
    userId = decode._id;
  }

  if (params.tripId && userId !== null && userId !== undefined) {

    try {

      const trip = await API_TRIP.findById(params.tripId, userId);
      if (trip) {
        return trip
      }
    } catch (error) {
      const err = error as Error
      console.log(err.message)
      throw new Error(`${err.message}`)
    }

  } else {
    throw new Error(`Invalid or missing trip ID`);
  }
}


export async function pointsLoader({ params }: LoaderFunctionArgs) {
  if (params.tripId) {

    return API_POINT.findByTripId(params.tripId);
  } else {
    throw new Error(`Invalid or missing points ID`);
  }

}


export async function pointLoaderById({ params }: LoaderFunctionArgs) {
  if (params.pointId) {

    return API_POINT.findByPointId(params.pointId);
  } else {
    throw new Error(`Invalid or missing point ID`);
  }

}

export async function commentLoaderById({ params }: LoaderFunctionArgs) {

  if (params.commentId) {

    return await API_COMMENT.findById(params.commentId)

  } else {

    throw new Error(`Invalid or missing comment ID`);
  }
}


export async function userIdLoader({ params }: LoaderFunctionArgs) {

  if (params.userId) {

    return await API_CLIENT.findById(params.userId);

  } else {

    throw new Error(`Invalid or missing comment ID`);
  }
}



const Layout = () => (
  <>
    <Header />

    <Outlet />

    <Footer />

  </>
)



const router = createBrowserRouter([

  {
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/users/verify-email/:userId/:token',
        element: <Users />
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />
      },
      {
        path: '/resend-email',
        element: <ReSendVerifyEmail />
      },
      {
        path: '/register/',
        children: [
          {
            path: '',
            element: <Register />

          },
          {
            path: ':userId/:token',
            element: <Register />
          }
        ]
      },
      {
        path: '/trips',
        element: <Trips />,
        errorElement: <NotFound />
      },
      {
        path: '/term-privacy-policy',
        element: <TermPrivacy />,
        errorElement: <NotFound />
      },
      {
        path: '/about',
        element: <AboutUs />,
        errorElement: <NotFound />
      },
      {
        path: '/create-trip',
        element: <GuardedRoute />,
        children: [
          {
            path: '',
            element: <CreateTrip />,
            errorElement: <NotFound />
          }
        ]
      },
      {
        path: '/trip/details/:tripId',
        element: <GuardedRoute />,
        children: [
          {
            path: '',
            loader: tripLoader,
            element: <TripDetails />,
            errorElement: <NotFound />
          }
        ]
      },
      {
        path: '/trip/edit/:tripId',
        loader: tripLoader,
        element: <GuardedRouteTrip />,
        children: [
          {
            path: '',
            loader: tripLoader,
            element: <TripEdit />,
            errorElement: <NotFound />
          }
        ]
      },
      {
        path: '/trip/points/:tripId',
        loader: tripLoader,
        element: <GuardedRouteTrip />,
        children: [
          {
            path: '',
            loader: pointsLoader,
            element: <TripPoints />,
            errorElement: <NotFound />
          }
        ]
      },
      {
        path: '/points/edit/:pointId',
        loader: pointLoaderById,
        element: <GuardedRoutePoint />,
        children: [
          {
            path: '',
            loader: pointLoaderById,
            element: <PointEdit />,
            errorElement: <NotFound />
          }
        ]
      },
      {
        path: '/comments/add-comment/:tripId',
        element: <GuardedRoute />,
        children: [
          {
            path: '',
            element: <CreateComment />
          }
        ]
      },
      {
        path: '/comments/edit/:commentId',
        loader: commentLoaderById,
        element: <GuardedRouteComment />,
        children: [
          {
            path: '',
            loader: commentLoaderById,
            element: <EditComment />,
            errorElement: <NotFound />
          }
        ],
        errorElement: <NotFound />
      },
      {
        path: '/my-trips',
        element: <GuardedRoute />,
        children: [
          {
            path: '',
            element: <MyTrips />
          }
        ]
      },
      {
        path: '/profile',
        element: <GuardedRoute />,
        children: [
          {
            path: '',
            element: <Profile />
          }
        ]
      },
      {
        path: '/admin',
        element: <GuardedRouteAdmin />,
        children: [
          {
            path: '',
            element: <Admin />
          }
        ]
      },
      {
        path: '/admin/edit/:userId',
        element: <GuardedRouteAdmin />,
        children: [
          {
            path: '',
            loader: userIdLoader,
            element: <AdminEdit />
          }
        ]
      },
      {
        path: '/admin/trip/details/:tripId',
        element: <GuardedRouteAdmin />,
        children: [
          {
            path: '',
            loader: tripLoader,
            element: <AdminTripDetails />
          }
        ]
      },
      {
        path: '/admin/trip/edit/:tripId',
        element: <GuardedRouteAdmin />,
        children: [
          {
            path: '',
            loader: tripLoader,
            element: <AdminTripEdit />
          }
        ]
      },
      {
        path: '/admin/comment/edit/:commentId',
        element: <GuardedRouteAdmin />,
        children: [
          {
            path: '',
            loader: commentLoaderById,
            element: <AdminCommentEdit />
          }
        ]
      },
      {
        path: '/favorites',
        element: <GuardedRoute />,
        children: [
          {
            path: '',
            element: <MyFavorites />
          }
        ]
      },
      {
        path: '/create-live-trip',
        element: <GuardedRoute />,
        children: [
          {
            path: '',
            element: <LiveTripTrackingCreate />,
            errorElement: <NotFound />
          }
        ]
      },
      {
        path: '*',
        element: <NotFound />
      },
      {
        path: '/not-found',
        element: <NotFound />
      }
    ]
  }
]);



const App: FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginContextValue, setLoginContextValue] = useState<LoginContext>({
    token: null,
    setToken: () => { },
    loginUser: (authToken: string) => { },
    logoutUser: () => { },
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
    }

    setLoading(false);
  }, []);



  return (
    <>
      <ErrorBoundary>
        <LoginProvider>
          <RouterProvider router={router} />
        </LoginProvider>
      </ErrorBoundary>
    </>
  );
};


export default App;
