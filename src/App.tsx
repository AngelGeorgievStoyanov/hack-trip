import { createBrowserRouter, LoaderFunctionArgs, Outlet, RouterProvider } from 'react-router-dom';
import Home from './components/Home/Home';
import { Login } from './components/Login/Login';
import { Register } from './components/Register/Register';
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
import { useState, createContext } from 'react';
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


const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data/trips');

const API_POINT: ApiPoint<IdType, Point> = new pointService.ApiPointImpl<IdType, Point>('data/points');

const API_COMMENT: ApiComment<IdType, Comment> = new commentService.ApiCommentImpl<IdType, Comment>('data/comments')

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');



type LoginContext = {
  userL: User | null;
  setUserL: React.Dispatch<React.SetStateAction<User | null>>
}

export const LoginContext = createContext({} as LoginContext);





export const userId = sessionStorage.getItem('userId')




export async function tripLoader({ params }: LoaderFunctionArgs) {


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



export async function userLoader() {

  try {

    return await API_CLIENT.findAll();
  } catch (err: any) {
    throw new Error(err.message);
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
    errorElement: <h2>No internet connection with server.Please try again later...</h2>,
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
        path: '/register',
        element: <Register user={undefined} />
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
            loader: userLoader,
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
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);

function App() {

  const [userL, setUserL] = useState<null | User>(null)

  return (
    <>
      <ErrorBoundary>

        <LoginContext.Provider value={{ userL, setUserL }}>
   
          <RouterProvider router={router} />
        </LoginContext.Provider>

      </ErrorBoundary>
    </>
  );
}

export default App;
