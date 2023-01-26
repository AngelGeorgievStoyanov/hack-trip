import { User, UserRegister } from "../model/users";
import { Identifiable } from "../shared/common-types";
import { CONNECTIONURL } from "../utils/baseUrl";

const baseUrl = CONNECTIONURL;




export interface ApiClient<K, V extends Identifiable<K>> {


    // deleteById(id: K): Promise<void>;
    register(entityWithoutId: UserRegister): Promise<V>
    login(email: K, password: K): Promise<V>;
    // findByUsername(username: any): any;
    logout(accessToken: string): Promise<V>;
    findById(id: K): Promise<V>;
    sendFile(entityWithoutId: FormData): Promise<string[]>;
    updateUser(id: K, entity: UserRegister): Promise<V>;
    changePassword(id: K, password: string): Promise<V>;
}



export class ApiClientImpl<K, V extends Identifiable<K>> implements ApiClient<K, V> {
    constructor(public apiCollectionSuffix: string) { }


    // async findByUsername(username: any) {

    //     const exsisting = await this.handleJsonRequest<any>(`${baseUrl}/${this.apiCollectionSuffix}/?username=${username}`);
    //     if (exsisting.length > 0) {
    //         throw new Error('Username is taken')
    //     }

    // }



    // async deleteById(id: K): Promise<void> {
    //     await this.handleJsonRequest<V>(`${baseUrl}/${this.apiCollectionSuffix}/${id}`, {
    //         method: 'DELETE',
    //     });
    // }

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

        const result = await response.json()
        console.log(result)
        return result
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


    // private async handleJsonRequest<V>(url: string, options?: RequestInit): Promise<V> {

    //     try {
    //         const postsResp = await fetch(url, options);
    //         if (postsResp.status >= 400) {
    //             throw new Error(await postsResp.json())

    //         }
    //         return postsResp.json() as Promise<V>;
    //     } catch (err) {

    //         return Promise.reject(err);
    //     }
    // }
}


