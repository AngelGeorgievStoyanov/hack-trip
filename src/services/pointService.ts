import { points } from "../components/TripPoints/PointList/PointCard/PointCard";
import { Point, PointCreate } from "../model/point";
import { Identifiable } from "../shared/common-types";
import { CONNECTIONURL } from "../utils/baseUrl";

const baseUrl = CONNECTIONURL;


export interface ApiPoint<K, V extends Identifiable<K>> {
    findByTripId(id: K, token: string): Promise<V>;
    create(entityWithoutId: PointCreate, token: string): Promise<any>;
    update(id: K, entity: Point, token: string): Promise<V>;
    deleteById(id: K, idTrip: K, userId: K, token: string): Promise<void>;
    findByPointId(id: K, token: string): Promise<V>;
    deleteByTripId(id: K, userId: K, token: string): Promise<void>;
    editPointPosition(id: K, entity: points, token: string): Promise<V>;
    sendFile(entityWithoutId: FormData, token: string): Promise<string[]>;
    editImages(id: K, oneImage: string[], token: string): Promise<V>;

}



export class ApiPointImpl<K, V extends Identifiable<K>> implements ApiPoint<K, V> {
    constructor(public apiCollectionSuffix: string) { }


    async findByTripId(id: K, token: string): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/${id}`, {
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




    async create(entityWithoutId: PointCreate, token: string): Promise<any> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(entityWithoutId)
        });


        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result);
        }
        return response.json();
    }

    async update(id: K, entity: Point, token: string): Promise<V> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(entity)
        });

        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result);
        }
        return await response.json();
    }

    async editPointPosition(id: K, entity: points, token: string): Promise<V> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/edit-position/${id}`, {
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




    async deleteById(id: K, idTrip: K, userId: K, token: string): Promise<void> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/${id}`, {
            method: 'DELETE',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ idTrip, userId })

        });

        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result);
        }
        return await response.json();
    }

    async deleteByTripId(id: K, userId: K, token: string): Promise<void> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trip/${id}/${userId}`, {
            method: 'DELETE',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },

        });


        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message);
        }
        return await response.json();
    }


    async findByPointId(id: K, token: string): Promise<V> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/edit/${id}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message);
        }
        return await response.json();
    }

    async sendFile(formdata: FormData, token: string): Promise<string[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/upload`, {

            method: 'POST',
            body: formdata,
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        return result;
    }


    async editImages(id: K, oneImage: string[], token: string) {


        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/edit-images/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(oneImage)
        });

        const result = await response.json();
        return result;
    }


}