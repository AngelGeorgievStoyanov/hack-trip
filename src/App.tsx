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


const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType,Trip>('data/trips');


export async function tripsLoader() {

  return API_TRIP.findAll()

}


export async function tripLoader({ params }: LoaderFunctionArgs){
  console.log(params)
  if (params.tripId) {
    return API_TRIP.findById(params.tripId);
  } else {
    throw new Error(`Invalid or missing post ID`);
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
        path:'/trip/details/:tripId',
        loader:tripLoader,
        element:<TripDetails/>
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
