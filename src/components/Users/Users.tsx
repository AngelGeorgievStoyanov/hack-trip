import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User } from "../../model/users";
import { IdType } from "../../shared/common-types";
import * as userService from '../../services/userService';
import { ApiClient } from "../../services/userService";

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users');



function Users() {

    const userId = useParams().userId;
    const token = useParams().token;

    const navigate = useNavigate()

    useEffect(() => {


        if (userId && token) {

            API_CLIENT.verifyEmail(userId, token).then((data) => {
                if (data === true) {
                    navigate('/login')

                } else {
                    navigate('/register')
                }
            }).catch((err) => {
                console.log(err)
            })
        }

    }, [])

    return (
        <>
            <h1>LOADING...</h1>
        </>
    )
}

export default Users;
