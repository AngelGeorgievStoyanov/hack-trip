import { Point, PointCreate } from "../model/point";
import { Identifiable } from "../shared/common-types";

const baseUrl = 'http://localhost:3030';


export interface ApiPoint<K, V extends Identifiable<K>> {
    findAll(): Promise<V[]>;
    findByTripId(id: K): Promise<V>;
    create(entityWithoutId: PointCreate): Promise<any>;
    update(id: K, entity: Point): Promise<V>;
    deleteById(id: K): Promise<void>;
    findByPointId(id: K): Promise<V>;
    deleteByTripId(id: K): Promise<void>;

}



export class ApiPointImpl<K, V extends Identifiable<K>> implements ApiPoint<K, V> {
    constructor(public apiCollectionSuffix: string) { }

    async findAll(): Promise<V[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}`);


        return response.json()
    }


    async findByTripId(id: K): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/${id}`);

        const res= await response.json() 
        return res
    }




    async create(entityWithoutId: PointCreate): Promise<any> {
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
   
    async update(id: K, entity: Point): Promise<V> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/${id}`, {
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

    async deleteByTripId(id: K): Promise<void> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trip/${id}`, {
            method: 'DELETE',

        });
 
        if (response.status >= 400) {
            const result = await response.json()

            throw new Error(result.message)
        }
        return await response.json()
    }


    async findByPointId(id: K): Promise<V> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/edit/${id}`);

        return response.json()
    }



}