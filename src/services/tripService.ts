import { Trip, TripCreate } from "../model/trip";
import { Identifiable } from "../shared/common-types";

const baseUrl = 'http://localhost:3030';


export interface ApiTrip<K, V extends Identifiable<K>> {
    findAll(): Promise<V[]>;
    findById(id: K): Promise<V>;
    create(entityWithoutId: TripCreate): Promise<any>;
    update(id: K, entity: Trip): Promise<V>;
    updateLikes(id: K, entity: Trip): Promise<V>;
    deleteById(id: K): Promise<void>;
    reportTrip(id: K, entity: Trip): Promise<V>;
    findTopTrips(): Promise<V[]>;
    findAllMyTrips(id:K):Promise<V[]>

}




export class ApiTripImpl<K, V extends Identifiable<K>> implements ApiTrip<K, V> {
    constructor(public apiCollectionSuffix: string) { }

    async findAll(): Promise<V[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}`);


        return response.json()
    }

    async findAllMyTrips(id: K): Promise<V[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/my-trips/${id}`);


        return response.json()
    }
    async findTopTrips(): Promise<V[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/top`);


        return response.json()
    }

    async create(entityWithoutId: TripCreate): Promise<any> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entityWithoutId)
        });


        if (response.status >= 400) {
            const result = await response.json()

            throw new Error(result.message)
        }
        return response.json()
    }

    async findById(id: K): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/${id}`);

        return response.json()
    }

    async deleteById(id: K): Promise<void> {



        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/${id}`, {
            method: 'DELETE',

        });

        if (response.status >= 400) {
            const result = await response.json()

            throw new Error(result.message)
        }
        return await response.json()

    }


    async update(id: K, entity: Trip): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entity)
        });

        const result = await response.json()


        return result
    }

    async updateLikes(id: K, entity: Trip): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/like/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entity)
        });

        const result = await response.json()


        return result
    }
    async reportTrip(id: K, entity: Trip): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/report/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entity)
        });

        const result = await response.json()


        return result
    }

}