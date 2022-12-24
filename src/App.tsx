import './App.css';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import Home from './components/Home/Home';
import { Login } from './components/Login/Login';
import { Register } from './components/Register/Register';
import Trips from './components/Trips/Trips';
import Header from './components/Header/Header';
import ErrorBoundary from './utils/ErrorBoundary';
import Footer from './components/Footer/Footer';
import Logout from './components/Logout/Logout';
import CreateTrip from './components/CreateTrip/CreateTrip';



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
        element: <Trips />
      },
      {
        path:'/logout',
        element:<Logout/>
      },
      {
        path:'/create-trip',
        element:<CreateTrip/>
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
