import { CommonImagesData, GcloudImage } from "../components/Admin/Admin";
import { Trip, TripCreate } from "../model/trip";
import { Identifiable, TripGroupId } from "../shared/common-types";
import { CONNECTIONURL } from "../utils/baseUrl";

const baseUrl = CONNECTIONURL;


export interface ApiTrip<K, V extends Identifiable<K>> {
    findAll(search: string, typeOfGroup: string, typeOfTransportSelect: string): Promise<K>;
    findById(id: K, userId: K, token: string): Promise<V>;
    create(entityWithoutId: TripCreate, token: string): Promise<any>;
    update(id: K, entity: Trip, userId: K, token: string): Promise<V>;
    updateLikes(id: K, userId: K, token: string): Promise<V>;
    deleteById(id: K, userId: K, token: string): Promise<void>;
    reportTrip(id: K, entity: Trip, token: string): Promise<V>;
    findTopTrips(userId: K | undefined): Promise<V[]>;
    findAllMyTrips(id: K, token: string): Promise<V[]>;
    sendFile(entityWithoutId: FormData, token: string): Promise<string[]>;
    editImages(id: K, oneImage: string[], token: string): Promise<V>;
    getAllReportTrips(id: K, token: string): Promise<V[]>;
    deleteReportTrip(id: K, entity: [], token: string): Promise<V>;
    updateFavorites(id: K, entity: Trip, token: string): Promise<V>;
    findAllMyFavorites(id: K, token: string): Promise<V[]>;
    findAllPagination(page: K, search: string, typeOfGroup: string, typeOfTransportSelect: string, userId: K | undefined): Promise<V[]>;
    backgroundImages(): Promise<string[]>;
    getDBImages(id: K, token: string): Promise<string[]>;
    getGCImages(id: K, token: string): Promise<GcloudImage[]>;
    getCommonImages(id: K, token: string): Promise<CommonImagesData>;
    findByTripGroupId(tripGroupId: string, token: string): Promise<TripGroupId[]>
}




export class ApiTripImpl<K, V extends Identifiable<K>> implements ApiTrip<K, V> {
    constructor(public apiCollectionSuffix: string) { }

    async findAll(search: string, typeOfGroup: string, typeOfTransportSelect: string): Promise<K> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/?search=${search}&typegroup=${typeOfGroup}&typetransport=${typeOfTransportSelect}`);
      
        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }
        return response.json();
    }


    async findAllPagination(page: K, search: string, typeOfGroup: string, typeOfTransportSelect: string, userId: K | undefined): Promise<V[]> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/paginate/?page=${page}&search=${search}&typegroup=${typeOfGroup}&typetransport=${typeOfTransportSelect}&userId=${userId}`);


        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }
        return response.json();
    }


    async findAllMyTrips(id: K, token: string): Promise<V[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/my-trips/${id}`, {
            method: 'GET',
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        });
        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }
        return response.json();
    }


    async findAllMyFavorites(id: K, token: string): Promise<V[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/favorites/${id}`, {
            method: 'GET',
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        });
        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result);
        }
        return response.json();
    }


    async findTopTrips(id: K | undefined): Promise<V[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/top/${id}`);
        return response.json();
    }


    async create(entityWithoutId: TripCreate, token: string): Promise<any> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips`, {
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

    async findById(id: K, userId: K, token: string): Promise<V> {


        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/${id}/${userId}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (response.status >= 400) {
            const res = await response.json();
            throw new Error(res);
        }

        const result = await response.json();

        return result
    }

    async deleteById(id: K, userId: K, token: string): Promise<void> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/${id}/${userId}`, {
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


    async update(id: K, entity: Trip, userId: K, token: string): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/details/${id}/${userId}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(entity)
        });

        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }
        return await response.json();
    }



    async updateLikes(id: K, userId: K, token: string): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/like/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
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



    async reportTrip(id: K, entity: Trip, token: string): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/report/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
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

    async deleteReportTrip(id: K, entity: [], token: string): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/admin/delete-report/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
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

    async sendFile(formdata: FormData, token: string): Promise<string[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/upload`, {

            method: 'POST',
            body: formdata,
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }
        const result = await response.json();
        return result;
    }



    async editImages(id: K, oneImage: string[], token: string) {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/edit-images/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
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


    async getAllReportTrips(id: K, token: string): Promise<V[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/reports/${id}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }
        return await response.json();
    }


    async updateFavorites(id: K, entity: Trip, token: string): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/favorites/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
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

    async getDBImages(id: K, token: string): Promise<string[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/cloud/db-images/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'content-type': 'application/json'
            }
        });
        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result.message ? result.message : result);
        }

        return await response.json();
    }

    async getGCImages(id: K, token: string): Promise<GcloudImage[]> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/cloud/cloud-images/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'content-type': 'application/json'
            }
        });

        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }
        return await response.json();
    }

    async getCommonImages(id: K, token: string): Promise<CommonImagesData> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/cloud/unique-images/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'content-type': 'application/json'
            }
        });
        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }

        return await response.json();
    }


    async findByTripGroupId(tripGroupId: string, token: string): Promise<TripGroupId[]> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trips/trip-group/${tripGroupId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'content-type': 'application/json'
            }
        });
        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message ? result.message : result);
        }

        return await response.json();
    }
}

