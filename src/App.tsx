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
import * as tripService from './services/tripService'
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


const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data/trips');

const API_POINT: ApiPoint<IdType, Point> = new pointService.ApiPointImpl<IdType, Point>('data/points');

const API_COMMENT: ApiComment<IdType, Comment> = new commentService.ApiCommentImpl<IdType, Comment>('data/comments')




type LoginContext = {
  userL: User | null;
  setUserL: React.Dispatch<React.SetStateAction<User | null>>
}

export const LoginContext = createContext({} as LoginContext)


export async function tripsLoader() {

  return API_TRIP.findAll()

}
export async function tripsLoaderTop() {

  return API_TRIP.findTopTrips()

}

export async function tripLoader({ params }: LoaderFunctionArgs) {
  if (params.tripId) {
    try {

      const trip = await API_TRIP.findById(params.tripId);
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

    return API_POINT.findByTripId(params.tripId)
  } else {
    throw new Error(`Invalid or missing points ID`);
  }

}


export async function pointLoaderById({ params }: LoaderFunctionArgs) {
  if (params.pointId) {

    return API_POINT.findByPointId(params.pointId)
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
    errorElement: <h2>No internet connection with server.Please try again later.</h2>,
    children: [
      {
        path: "/",
        loader: tripsLoaderTop,
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
        loader: tripsLoader,
        element: <Trips />,
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
          },
          {
            path: '*'
          }
        ]

      },
      {
        path: '/trip/edit/:tripId',
        element: <GuardedRoute />,
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
        element: <GuardedRoute />,
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
        element: <GuardedRoute />,
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

        element: <GuardedRoute />,

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
        path: '*',
        element: <NotFound />
      }
    ]
  }


])



function App() {

  const [userL, setUserL] = useState<null | User>(null)
  const userId = sessionStorage.getItem('userId')


  return (
    <>

      <ErrorBoundary>
        {window.navigator.onLine ?

          <LoginContext.Provider value={{ userL, setUserL }}>

            <RouterProvider router={router} />
          </LoginContext.Provider>


          : <h1>No internet connection. Please try again later.</h1>}
      </ErrorBoundary>
    </>

  );
}

export default App;
