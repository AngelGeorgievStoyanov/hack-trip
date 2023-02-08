import { Trip, TripCreate } from "../model/trip";
import { Identifiable } from "../shared/common-types";
import { CONNECTIONURL } from "../utils/baseUrl";

const baseUrl = CONNECTIONURL;


export interface ApiTrip<K, V extends Identifiable<K>> {
    findAll(search: string, typeOfGroup: string, typeOfTransportSelect: string): Promise<K>;
    findById(id: K): Promise<V>;
    create(entityWithoutId: TripCreate): Promise<any>;
    update(id: K, entity: Trip): Promise<V>;
    updateLikes(id: K, entity: Trip): Promise<V>;
    deleteById(id: K): Promise<void>;
    reportTrip(id: K, entity: Trip): Promise<V>;
    findTopTrips(): Promise<V[]>;
    findAllMyTrips(id: K): Promise<V[]>;
    sendFile(entityWithoutId: FormData): Promise<string[]>;
    editImages(id: K, oneImage: string[]): Promise<V>;
    getAllReportTrips(): Promise<V[]>;
    deleteReportTrip(id: K, entity: []): Promise<V>;
    updateFavorites(id: K, entity: Trip): Promise<V>;
    findAllMyFavorites(id: K): Promise<V[]>;
    findAllPagination(page: K, search: string, typeOfGroup: string, typeOfTransportSelect: string): Promise<V[]>;

}




export class ApiTripImpl<K, V extends Identifiable<K>> implements ApiTrip<K, V> {
    constructor(public apiCollectionSuffix: string) { }

    async findAll(search: string, typeOfGroup: string, typeOfTransportSelect: string): Promise<K> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/?search=${search}&typegroup=${typeOfGroup}&typetransport=${typeOfTransportSelect}`);
        return response.json();
    }


    async findAllPagination(page: K, search: string, typeOfGroup: string, typeOfTransportSelect: string): Promise<V[]> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/paginate/?page=${page}&search=${search}&typegroup=${typeOfGroup}&typetransport=${typeOfTransportSelect}`);


        return await response.json();
    }


    async findAllMyTrips(id: K): Promise<V[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/my-trips/${id}`);
        return response.json();
    }


    async findAllMyFavorites(id: K): Promise<V[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/favorites/${id}`);
        return response.json();
    }


    async findTopTrips(): Promise<V[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/top`);
        return response.json();
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
            const result = await response.json();

            throw new Error(result.message);
        }
        return response.json();
    }

    async findById(id: K): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/${id}`);

        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message);
        }
        return await response.json();
    }

    async deleteById(id: K): Promise<void> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/${id}`, {
            method: 'DELETE',

        });

        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result.message);
        }
        return await response.json();
    }


    async update(id: K, entity: Trip): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entity)
        });

        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message);
        }
        return await response.json();
    }



    async updateLikes(id: K, entity: Trip): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/like/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entity)
        });

        const result = await response.json();
        return result;
    }



    async reportTrip(id: K, entity: Trip): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/report/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entity)
        });

        const result = await response.json();


        return result;
    }
    async deleteReportTrip(id: K, entity: []): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/admin/delete-report/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entity)
        });

        const result = await response.json();

        return result;
    }

    async sendFile(formdata: FormData): Promise<string[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/upload`, {

            method: 'POST',
            body: formdata,
            headers: {}
        });

        const result = await response.json();
        return result;
    }



    async editImages(id: K, oneImage: string[]) {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/edit-images/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(oneImage)
        });

        const result = await response.json();
        return result;
    }


    async getAllReportTrips(): Promise<V[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/reports`);
        return response.json();
    }


    async updateFavorites(id: K, entity: Trip): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/favorites/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entity)
        });

        const result = await response.json();
        return result;
    }

}

