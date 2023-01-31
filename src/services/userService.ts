import { User, UserEditAdmin, UserRegister } from "../model/users";
import { Identifiable } from "../shared/common-types";
import { CONNECTIONURL } from "../utils/baseUrl";

const baseUrl = CONNECTIONURL;




export interface ApiClient<K, V extends Identifiable<K>> {


    register(entityWithoutId: UserRegister): Promise<V>
    login(email: K, password: K): Promise<V>;
    logout(accessToken: string): Promise<V>;
    findById(id: K): Promise<V>;
    sendFile(entityWithoutId: FormData): Promise<string[]>;
    updateUser(id: K, entity: UserRegister): Promise<V>;
    changePassword(id: K, password: string): Promise<V>;
    deleteProfileImage(id: K, image: string): Promise<V>;
    findAll(): Promise<V>;
    updateUserAdmin(id:K, entity:UserEditAdmin ):Promise<V>
}



export class ApiClientImpl<K, V extends Identifiable<K>> implements ApiClient<K, V> {
    constructor(public apiCollectionSuffix: string) { }



    async login(email: K, password: K): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}`, {
            method: 'POST',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({ email, password })
        })


        if (response.status >= 400) {
            const result = await response.json()
            throw new Error(result)
        }

        return response.json()
    }


    async register(entityWithoutId: UserRegister): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entityWithoutId)
        })

        if (response.status >= 400) {
            const result = await response.json()
            throw new Error(result)
        }
        return response.json()
    }

    async logout(accessToken: string) {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}`, {
            method: 'POST',
            headers: {
                'X-Authorization': accessToken
            }

        })

        if (response.status === 204) {


            return response.json()
        }



    }

    async findById(id: K): Promise<V> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/profile/${id}`)


        if (response.status >= 400) {
            const result = await response.json()
            throw new Error(result)
        }
        return response.json()
    }


    async sendFile(formdata: FormData): Promise<string[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/upload`, {

            method: 'POST',
            body: formdata,
            headers: {}
        });

        const result = await response.json();
        return result
    }

    

    async updateUserAdmin(id: K, entity: UserEditAdmin): Promise<V> {

        

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/admin/edit/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entity)
        });

        if (response.status >= 400) {
            const result = await response.json()

            throw new Error(result.message)
        }
        return await response.json()
    }


    async updateUser(id: K, entity: User): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/edit/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entity)
        });

        if (response.status >= 400) {
            const result = await response.json()

            throw new Error(result.message)
        }
        return await response.json()
    }

    async changePassword(id: K, password: string): Promise<V> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/confirmpassword/${id}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        if (response.status >= 400) {
            const result = await response.json()

            throw new Error(result)
        }
        return await response.json()

    }

    async deleteProfileImage(id: K, image: string): Promise<V> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/delete-image/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ image })
        })

        if (response.status >= 400) {
            const result = await response.json()

            throw new Error(result)
        }
        return await response.json()

    }
    async findAll(): Promise<V> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/admin`)


        if (response.status >= 400) {
            const result = await response.json()
            throw new Error(result)
        }
        return response.json()
    }


}


