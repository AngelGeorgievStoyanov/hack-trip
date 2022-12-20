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
        element: <Register />
      },
      {
        path: '/trips',
        element: <Trips />
      },
      {
        path:'/logout',
        element:<Logout/>
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
