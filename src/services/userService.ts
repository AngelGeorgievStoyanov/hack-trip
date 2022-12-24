import { UserRegister } from "../model/users";
import { Identifiable } from "../shared/common-types";

const baseUrl = 'http://localhost:3030';





export interface ApiClient<K, V extends Identifiable<K>> {
    findAll(): Promise<V[]>;
    findById(id: K): Promise<V>;
    create(entityWithoutId: Omit<V, 'id'>): Promise<V>;
    update(entity: V): Promise<V>;
    deleteById(id: K): Promise<void>;
    register(entityWithoutId: UserRegister): Promise<V>
    findByUsername(username: any): any;
}



export class ApiClientImpl<K, V extends Identifiable<K>> implements ApiClient<K, V> {
    constructor(public apiCollectionSuffix: string) { }
    async findByUsername(username: any) {

        const exsisting = await this.handleJsonRequest<any>(`${baseUrl}/${this.apiCollectionSuffix}/?username=${username}`);
        if (exsisting.length > 0) {
            throw new Error('Username is taken')
        }

    }
    findAll(): Promise<V[]> {
        return this.handleJsonRequest<V[]>(`${baseUrl}/${this.apiCollectionSuffix}`);
    }
    findById(id: K): Promise<V> {
        return this.handleJsonRequest<V>(`${baseUrl}/${this.apiCollectionSuffix}/${id}`);
    }
    create(entityWithoutId: Omit<V, 'id'>): Promise<V> {

        return this.handleJsonRequest<V>(`${baseUrl}/${this.apiCollectionSuffix}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entityWithoutId)
        });
    }
    update(entity: V): Promise<V> {
        return this.handleJsonRequest<V>(`${baseUrl}/${this.apiCollectionSuffix}/${entity.id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entity)
        });
    }
    async deleteById(id: K): Promise<void> {
        await this.handleJsonRequest<V>(`${baseUrl}/${this.apiCollectionSuffix}/${id}`, {
            method: 'DELETE',
        });
    }



    async register(entityWithoutId: UserRegister): Promise<V> {


        return this.handleJsonRequest<V>(`${baseUrl}/${this.apiCollectionSuffix}`, {
            method: 'POST',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(entityWithoutId)
        })
    }

    private async handleJsonRequest<V>(url: string, options?: RequestInit): Promise<V> {
        console.log(url,'---', options,'====')
        try {
            const postsResp = await fetch(url, options);
            if (postsResp.status >= 400) {
                return Promise.reject(postsResp.body);
            }
            return postsResp.json() as Promise<V>;
        } catch (err) {
            return Promise.reject(err);
        }
    }
}


// export const register = (email: string, firstName: string, lastName: string, password: string) => {
//     return fetch(`${baseUrl}/register`, {
//         method: 'POST',
//         headers: {
//             'content-type': 'application/json'
//         },
//         body: JSON.stringify({ email, firstName, lastName, password })
//     }).then(res => res.json())
// }
