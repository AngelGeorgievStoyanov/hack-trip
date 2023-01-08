import './App.css';
import { createBrowserRouter, LoaderFunctionArgs, Outlet, RouterProvider } from 'react-router-dom';
import Home from './components/Home/Home';
import { Login } from './components/Login/Login';
import { Register } from './components/Register/Register';
import Trips from './components/Trips/Trips';
import Header from './components/Header/Header';
import ErrorBoundary from './utils/ErrorBoundary';
import Footer from './components/Footer/Footer';
import Logout from './components/Logout/Logout';
import CreateTrip from './components/CreateTrip/CreateTrip';
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
import CreateComment from './components/CreateComment/CreateComment';
import EditComment from './components/EditComment/EditComment';
import { ApiComment } from './services/commentService';
import { Comment } from './model/comment';
import * as commentService from './services/commentService'


const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>('data/trips');

const API_POINT: ApiPoint<IdType, Point> = new pointService.ApiPointImpl<IdType, Point>('data/points');

const API_COMMENT: ApiComment<IdType, Comment> = new commentService.ApiCommentImpl<IdType, Comment>('data/comments')

export async function tripsLoader() {

  return API_TRIP.findAll()

}


export async function tripLoader({ params }: LoaderFunctionArgs) {
  if (params.tripId) {
    return API_TRIP.findById(params.tripId);
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
    return API_COMMENT.findById(params.commentId)
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
        loader: tripsLoader,
        element: <Trips />,

      },
      {
        path: '/logout',
        element: <Logout />
      },
      {
        path: '/create-trip',
        element: <CreateTrip />
      },
      {
        path: '/trip/details/:tripId',
        loader: tripLoader,
        element: <TripDetails />,
      },
      {
        path: '/trip/edit/:tripId',
        loader: tripLoader,
        element: <TripEdit />
      },
      {
        path: '/trip/points/:tripId',
        loader: pointsLoader,
        element: <TripPoints />
      },
      {
        path: '/points/edit/:pointId',
        loader: pointLoaderById,
        element: <PointEdit />
      },
      {
        path: '/comments/add-comment/:tripId',
        element: <CreateComment />
      },
      {
        path: '/comments/edit/:commentId',
        loader: commentLoaderById,
        element: <EditComment />
      }
    ]
  }


])



function App() {



  return (
    <>
      <ErrorBoundary>


        <RouterProvider router={router} />

      </ErrorBoundary>
    </>

  );
}

export default App;
