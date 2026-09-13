import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { FC, lazy, Suspense } from 'react';
import Header from './components/Header/Header';
import ErrorBoundary from './utils/ErrorBoundary';
import Footer from './components/Footer/Footer';
import GuardedRoute from './components/GuardedRoute/GuardedRoute';
import NotFound from './components/NotFound/NotFound';
import './App.css';
import GuardedRouteAdmin from './components/GuardedRouteAdmin/GuardedRouteAdmin';
import GuardedRouteTrip from './components/GuardedRouteTrip/GuardedRouteTrip';
import GuardedRoutePoint from './components/GuardedRoutePoints/GuardedRoutePoints';
import GuardedRouteComment from './components/GuardedRouteComment/GuardedRouteComment';
import useLoaders from './hooks/UseLoaders';

const Home = lazy(() => import('./components/Home/Home'));
const Trips = lazy(() => import('./components/Trips/Trips'));
const CreateTrip = lazy(() => import('./components/TripCreate/TripCreate'));
const TripDetails = lazy(() => import('./components/TripDetails/TripDetails'));
const TripEdit = lazy(() => import('./components/TripEdit/TripEdit'));
const TripPoints = lazy(() => import('./components/TripPoints/TripPoints'));
const PointEdit = lazy(() => import('./components/TripPoints/PointEdit/PointEdit'));
const CreateComment = lazy(() => import('./components/CommentCreate/CommentCreate'));
const EditComment = lazy(() => import('./components/CommentEdit/CommentEdit'));
const MyTrips = lazy(() => import('./components/MyTrips/MyTrips'));
const Profile = lazy(() => import('./components/Profile/Profile'));
const Admin = lazy(() => import('./components/Admin/Admin'));
const AdminEdit = lazy(() => import('./components/Admin/AdminEdit'));
const AdminTripDetails = lazy(() => import('./components/Admin/AdminTripDetails'));
const AdminTripEdit = lazy(() => import('./components/Admin/AdminTripEdit'));
const MyFavorites = lazy(() => import('./components/MyFavorites/MyFavorites'));
const AdminCommentEdit = lazy(() => import('./components/Admin/AdminCommentEdit'));
const TermPrivacy = lazy(() => import('./components/TermPrivacy/TermPrivacy'));
const AboutUs = lazy(() => import('./components/About/About'));
const Users = lazy(() => import('./components/Users/Users'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword/ForgotPassword'));
const ReSendVerifyEmail = lazy(() => import('./components/ReSendVerifyEmail/ReSendVerifyEmail'));
const Login = lazy(() => import('./components/Login/Login'));
const Register = lazy(() => import('./components/Register/Register'));
const LiveTripTrackingCreate = lazy(() => import('./components/LiveTripTrackingCreate/LiveTripTrackingCreate/LiveTripTrackingCreate'));




const App: FC = () => {

  const { tripLoader, pointsLoader, pointLoaderById, commentLoaderById, userIdLoader } = useLoaders();

  const Layout = () => (
    <>
      <Header />

      <Suspense fallback={null}>
        <Outlet />
      </Suspense>

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
          path: "/create-trip/:tripGroupId",
          element: <CreateTrip />,
          children: [
            { path: '', element: <CreateTrip /> }
          ]
        },
        {
          path: '/trip/details/:tripId',
          element: <TripDetails />,
          errorElement: <NotFound />
        },
        // TODO
        // {
        //   path: '/trip/details/:tripId',
        //   element: <GuardedRoute />,
        //   children: [
        //     {
        //       path: '',
        //       element: <TripDetails />,
        //       errorElement: <NotFound />
        //     }
        //   ]
        // },
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
