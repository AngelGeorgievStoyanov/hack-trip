import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import Home from './components/Home/Home';
import Trips from './components/Trips/Trips';
import Header from './components/Header/Header';
import ErrorBoundary from './utils/ErrorBoundary';
import Footer from './components/Footer/Footer';
import CreateTrip from './components/TripCreate/TripCreate';
import TripDetails from './components/TripDetails/TripDetails';
import TripEdit from './components/TripEdit/TripEdit';
import TripPoints from './components/TripPoints/TripPoints';
import PointEdit from './components/TripPoints/PointEdit/PointEdit';
import CreateComment from './components/CommentCreate/CommentCreate';
import EditComment from './components/CommentEdit/CommentEdit';
import MyTrips from './components/MyTrips/MyTrips';
import GuardedRoute from './components/GuardedRoute/GuardedRoute';
import NotFound from './components/NotFound/NotFound';
import './App.css';
import Profile from './components/Profile/Profile';
import Admin from './components/Admin/Admin';
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
import useLoaders from './hooks/UseLoaders';
import { FC } from 'react';




const App: FC = () => {

  const { tripLoader, pointsLoader, pointLoaderById, commentLoaderById, userIdLoader } = useLoaders();

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
              element: <TripDetails />,
              errorElement: <NotFound />
            }
          ]
        },
        {
          path: '/trip/edit/:tripId',
          element: <GuardedRouteTrip />,
          children: [
            {
              path: '',
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

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};


export default App;
