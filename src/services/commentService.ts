import { Comment, CommentCreate } from "../model/comment";
import { Identifiable } from "../shared/common-types";
import { CONNECTIONURL } from "../utils/baseUrl";

const baseUrl = CONNECTIONURL;

export interface ApiComment<K, V extends Identifiable<K>> {
    findByTripId(id: K, userId: K, token: string): Promise<V[]>;
    create(entityWithoutId: CommentCreate, token: string): Promise<any>;
    update(id: K, entity: Comment, token: string): Promise<V>;
    deleteById(id: K, token: string): Promise<void>;
    deleteByTripId(id: K, userId: K, token: string): Promise<void>;
    findById(id: K, token: string): Promise<V>;
    reportComment(id: K, entity: Comment, token: string): Promise<V[]>;
    getAllReportComments(id: K, token: string): Promise<V[]>;
    deleteReportComment(id: K, entity: [], token: string): Promise<V>;
    findUserImage(id: K, token: string): Promise<string>;
    adminUnReportComment(id: K, entity: Comment, token: string): Promise<V[]>;

}


export class ApiCommentImpl<K, V extends Identifiable<K>> implements ApiComment<K, V> {
    constructor(public apiCollectionSuffix: string) { }

    async findByTripId(id: K, userId: K, token: string): Promise<V[]> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trip/${id}/${userId}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message);
        }
        return response.json();
    }

    async findById(id: K, token: string): Promise<V> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/${id}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message);
        }
        return response.json();
    }

    async create(entityWithoutId: CommentCreate, token: string): Promise<any> {
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

            throw new Error(result.message);
        }
        return response.json();
    }

    async update(id: K, entity: Comment, token: string): Promise<V> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(entity)
        });

        if (response.status >= 400) {
            const result = await response.json()

            throw new Error(result.message)
        }
        return await response.json()
    }


    async deleteById(id: K, token: string): Promise<void> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/${id}`, {
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

    async reportComment(id: K, entity: Comment, token: string): Promise<V[]> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/report/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(entity)
        });

        const result = await response.json();


        return result;
    }


    async adminUnReportComment(id: K, entity: Comment, token: string): Promise<V[]> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/admin/report/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(entity)
        });

        const result = await response.json();


        return result;
    }



    async getAllReportComments(id: K, token: string): Promise<V[]> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/reports/${id}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result.message);
        }
        return response.json();
    }


    async deleteReportComment(id: K, entity: [], token: string): Promise<V> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/admin/delete-report/${id}`, {
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
        return response.json();
    }


    async findUserImage(id: K, token: string): Promise<string> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/image-user/${id}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (response.status >= 400) {
            const result = await response.json();
            throw new Error(result.message);
        }
        return response.json();
    }

}