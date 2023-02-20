import { useContext } from 'react';
import { Navigate, Outlet, useLoaderData } from 'react-router-dom';
import { LoginContext } from '../../App';
import { Comment } from '../../model/comment';
import NotFound from '../NotFound/NotFound';




const GuardedRouteComment = () => {

    const comment = useLoaderData() as Comment;


    const { userL, setUserL } = useContext(LoginContext);

    const userId = userL?._id ? userL._id : sessionStorage.getItem('userId') ? sessionStorage.getItem('userId') : undefined;

    return (comment._ownerId === userId) ? <Outlet /> :  <NotFound />

}
export default GuardedRouteComment