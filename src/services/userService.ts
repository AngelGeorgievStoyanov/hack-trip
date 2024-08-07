import { GridRowId } from "@mui/x-data-grid/models/gridRows";
import { IRouteNotFoundLogs, User, UserEditAdmin, UserRegister } from "../model/users";
import { Identifiable } from "../shared/common-types";
import { CONNECTIONURL } from "../utils/baseUrl";

const baseUrl = CONNECTIONURL;


export type UserGeolocation = {
    IPv4: string,
    city: string,
    country_code: string,
    country_name: string,
    latitude: number,
    longitude: number,
    postal: string,
    state: string
}

export interface ApiClient<K, V extends Identifiable<K>> {


    register(entityWithoutId: UserRegister): Promise<string>
    login(email: K, password: K, userGeolocation: UserGeolocation): Promise<V>;
    logout(accessToken: string): Promise<V>;
    findById(id: K): Promise<V>;
    sendFile(entityWithoutId: FormData, token: string): Promise<string[]>;
    updateUser(id: K, entity: UserRegister, token: string): Promise<V>;
    changePassword(id: K, password: string, token: string): Promise<V>;
    deleteProfileImage(id: K, image: string, token: string): Promise<V>;
    findAll(id: K, token: string): Promise<V[]>;
    updateUserAdmin(id: K, entity: UserEditAdmin, token: string): Promise<V>;
    guardedRoute(id: K, role: string, token: string): Promise<boolean>;
    findUserId(id: K, token: string): Promise<boolean>;
    forgotPassword(email: string): Promise<string>;
    newPassword(id: K, token: string, password: string): Promise<V>;
    verifyEmail(id: K, token: string): Promise<boolean>;
    resendVerEmail(email: string): Promise<string>;
    deleteUserById(adminId: K, editedUserId: K, token: string): Promise<void>;
    getFailedLogs(adminId: K, token: string): Promise<any[]>
    deleteFailedLogs(adminId: K, failedLogsArr: GridRowId[], token: string): Promise<string[]>;
    getRouteNotFoundLogs(adminId: K, token: string): Promise<IRouteNotFoundLogs[]>;
}



export class ApiClientImpl<K, V extends Identifiable<K>> implements ApiClient<K, V> {
    constructor(public apiCollectionSuffix: string) { }



    async login(email: K, password: K, userGeolocation: UserGeolocation): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/login`, {
            method: 'POST',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({ email, password, userGeolocation })
        });

        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }

        return response.json();
    }


    async register(entityWithoutId: UserRegister): Promise<string> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/register`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entityWithoutId)
        });

        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }
        return response.json();
    }

    async logout(accessToken: string) {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/logout`, {
            method: 'POST',
            headers: {
                'X-Authorization': accessToken
            }

        });

        if (response.status === 204) {

            return response.json();
        }
    }



    async findById(id: K): Promise<V> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/profile/${id}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
            }
        });

        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }
        return response.json();
    }

    async findUserId(id: K, token: string): Promise<boolean> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/userId/${id}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }
        let res = await response.json();
        return res
    }


    async sendFile(formdata: FormData, token: string): Promise<string[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/upload`, {

            method: 'POST',
            body: formdata,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        return result;
    }



    async updateUserAdmin(id: K, entity: UserEditAdmin, token: string): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/admin/edit/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(entity)
        });

        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message);
        }
        return await response.json();
    }


    async updateUser(id: K, entity: User, token: string): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/edit/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(entity)
        });

        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message);
        }
        return await response.json();
    }



    async changePassword(id: K, password: string, token: string): Promise<V> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/confirmpassword/${id}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password })
        });

        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result);
        }
        return await response.json();
    }



    async deleteProfileImage(id: K, image: string, token: string): Promise<V> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/delete-image/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ image })
        })

        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result);
        }
        return await response.json();

    }



    async findAll(id: K, token: string): Promise<V[]> {


        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/admin/${id}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }
        return response.json();
    }


    async getFailedLogs(adminId: K, token: string): Promise<V[]> {


        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/admin/failedlogs/${adminId}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }
        return response.json();
    }


    async guardedRoute(id: K, role: string, token: string): Promise<boolean> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/guard`, {
            method: 'POST',
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ id, role })
        });


        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }

        return response.json();
    }


    async forgotPassword(email: string): Promise<string> {


        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/forgot-password`, {
            method: 'POST',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({ email })
        });


        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }

        return response.json();
    }


    async newPassword(id: K, token: string, password: string): Promise<V> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/new-password`, {
            method: 'POST',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({ id, token, password })
        });


        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }

        return response.json();
    }


    async verifyEmail(id: K, token: string): Promise<boolean> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/verify-email/${id}/${token}`)

        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }

        return response.json();


    }



    async resendVerEmail(email: string): Promise<string> {


        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/resend-email`, {
            method: 'POST',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({ email })
        });


        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }

        return response.json();
    }


    async deleteUserById(adminId: K, editedUserId: K, token: string): Promise<void> {


        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/admin/${adminId}/${editedUserId}`, {
            method: 'DELETE',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }
        return await response.json();
    }


    async deleteFailedLogs(id: K, failedLogsArr: GridRowId[], token: string): Promise<string[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/admin/delete/failedlogs/${id}`, {
            method: 'DELETE',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(failedLogsArr)
        });

        if (response.status >= 400) {
            const result = await response.json()

            throw new Error(result.message)
        }
        return await response.json()
    }


    async getRouteNotFoundLogs(adminId: K, token: string): Promise<IRouteNotFoundLogs[]> {


        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/admin/routenotfoundlogs/${adminId}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }
        return response.json();
    }



}


