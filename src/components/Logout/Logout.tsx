

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { User } from '../../model/users';
import * as userService from '../../services/userService'
import { ApiClient } from '../../services/userService';
import { IdType } from '../../shared/common-types';

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>('users/logout');


export default function Logout() {

    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken')

        if (accessToken) {
            console.log(accessToken)

            API_CLIENT.logout(accessToken)
                .then((data) => {
                    console.log(data)
                    localStorage.removeItem('userId');
                    localStorage.removeItem('email');
                    localStorage.removeItem('accessToken');
                    navigate('/')
                }).catch((err) => { 
                    console.log(err)
                 })

        }
    })

    return null

}