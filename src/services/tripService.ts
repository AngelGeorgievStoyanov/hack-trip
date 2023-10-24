import { CommonImagesData, GcloudImage } from "../components/Admin/Admin";
import { Trip, TripCreate } from "../model/trip";
import { Identifiable } from "../shared/common-types";
import { CONNECTIONURL } from "../utils/baseUrl";

const baseUrl = CONNECTIONURL;


export interface ApiTrip<K, V extends Identifiable<K>> {
    findAll(search: string, typeOfGroup: string, typeOfTransportSelect: string): Promise<K>;
    findById(id: K, userId: K): Promise<V>;
    create(entityWithoutId: TripCreate): Promise<any>;
    update(id: K, entity: Trip, userId: K): Promise<V>;
    updateLikes(id: K, userId: K): Promise<V>;
    deleteById(id: K, userId: K): Promise<void>;
    reportTrip(id: K, entity: Trip): Promise<V>;
    findTopTrips(userId: K | undefined): Promise<V[]>;
    findAllMyTrips(id: K): Promise<V[]>;
    sendFile(entityWithoutId: FormData): Promise<string[]>;
    editImages(id: K, oneImage: string[]): Promise<V>;
    getAllReportTrips(id: K): Promise<V[]>;
    deleteReportTrip(id: K, entity: []): Promise<V>;
    updateFavorites(id: K, entity: Trip): Promise<V>;
    findAllMyFavorites(id: K): Promise<V[]>;
    findAllPagination(page: K, search: string, typeOfGroup: string, typeOfTransportSelect: string, userId: K | undefined): Promise<V[]>;
    backgroundImages(): Promise<string[]>;
    getDBImages(id: K): Promise<string[]>;
    getGCImages(id: K): Promise<GcloudImage[]>;
    getCommonImages(id: K): Promise<CommonImagesData>
}




export class ApiTripImpl<K, V extends Identifiable<K>> implements ApiTrip<K, V> {
    constructor(public apiCollectionSuffix: string) { }

    async findAll(search: string, typeOfGroup: string, typeOfTransportSelect: string): Promise<K> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/?search=${search}&typegroup=${typeOfGroup}&typetransport=${typeOfTransportSelect}`);
        return response.json();
    }


    async findAllPagination(page: K, search: string, typeOfGroup: string, typeOfTransportSelect: string, userId: K | undefined): Promise<V[]> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/paginate/?page=${page}&search=${search}&typegroup=${typeOfGroup}&typetransport=${typeOfTransportSelect}&userId=${userId}`);


        return await response.json();
    }


    async findAllMyTrips(id: K): Promise<V[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/my-trips/${id}`);
        return response.json();
    }


    async findAllMyFavorites(id: K): Promise<V[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/favorites/${id}`);
        return response.json();
    }


    async findTopTrips(id: K | undefined): Promise<V[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/top/${id}`);
        return response.json();
    }


    async create(entityWithoutId: TripCreate): Promise<any> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips`, {
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

    async findById(id: K, userId: K): Promise<V> {


        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/${id}/${userId}`);

        if (response.status >= 400) {
            const res = await response.json();
            throw new Error(res);
        }

        const result = await response.json();

        return result
    }

    async deleteById(id: K, userId: K): Promise<void> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/${id}/${userId}`, {
            method: 'DELETE',

        });

        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }
        return await response.json();
    }


    async update(id: K, entity: Trip, userId: K): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/details/${id}/${userId}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entity)
        });

        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }
        return await response.json();
    }



    async updateLikes(id: K, userId: K): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/like/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });
        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }

        const result = await response.json();
        return result;
    }



    async reportTrip(id: K, entity: Trip): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/report/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entity)
        });
        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }
        const result = await response.json();


        return result;
    }

    async deleteReportTrip(id: K, entity: []): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/admin/delete-report/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entity)
        });
        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }
        const result = await response.json();

        return result;
    }

    async sendFile(formdata: FormData): Promise<string[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/upload`, {

            method: 'POST',
            body: formdata,
            headers: {}
        });
        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }
        const result = await response.json();
        return result;
    }



    async editImages(id: K, oneImage: string[]) {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/edit-images/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(oneImage)
        });
        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }
        const result = await response.json();
        return result;
    }


    async getAllReportTrips(id: K): Promise<V[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/reports/${id}`);

        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }
        return await response.json();
    }


    async updateFavorites(id: K, entity: Trip): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/favorites/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entity)
        });
        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }
        const result = await response.json();
        return result;
    }

    async backgroundImages(): Promise<string[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/background`);
        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }

        return await response.json();
    }

    async getDBImages(id: K): Promise<string[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/cloud/db-images/${id}`);
        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result.message ? result.message : result);
        }

        return await response.json();
    }

    async getGCImages(id: K): Promise<GcloudImage[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/cloud/cloud-images/${id}`);

        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }
        return await response.json();
    }

    async getCommonImages(id: K): Promise<CommonImagesData> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/cloud/unique-images/${id}`);
        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }

        return await response.json();
    }

}

