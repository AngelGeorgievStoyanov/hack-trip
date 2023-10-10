import { Comment, CommentCreate } from "../model/comment";
import { Identifiable } from "../shared/common-types";
import { CONNECTIONURL } from "../utils/baseUrl";

const baseUrl = CONNECTIONURL;

export interface ApiComment<K, V extends Identifiable<K>> {
    findAll(): Promise<V[]>;
    findByTripId(id: K, userId: K): Promise<V[]>;
    create(entityWithoutId: CommentCreate): Promise<any>;
    update(id: K, entity: Comment): Promise<V>;
    deleteById(id: K): Promise<void>;
    findByPointId(id: K): Promise<V>;
    deleteByTripId(id: K, userId: K): Promise<void>;
    findById(id: K): Promise<V>;
    reportComment(id: K, entity: Comment): Promise<V[]>;
    getAllReportComments(id: K): Promise<V[]>;
    deleteReportComment(id: K, entity: []): Promise<V>;
    findUserImage(id: K): Promise<string>;
    adminUnReportComment(id: K, entity: Comment): Promise<V[]>;

}


export class ApiCommentImpl<K, V extends Identifiable<K>> implements ApiComment<K, V> {
    constructor(public apiCollectionSuffix: string) { }
    findAll(): Promise<V[]> {
        throw new Error("Method not implemented.");
    }
    async findByTripId(id: K, userId: K): Promise<V[]> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trip/${id}/${userId}`);
        const res = await response.json()
        return res;
    }

    async findById(id: K): Promise<V> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/${id}`);
        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message);
        }
        return response.json();
    }

    async create(entityWithoutId: CommentCreate): Promise<any> {
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

    async update(id: K, entity: Comment): Promise<V> {
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
            const result = await response.json();

            throw new Error(result.message);
        }
        return await response.json();
    }


    findByPointId(id: K): Promise<V> {
        throw new Error("Method not implemented.");
    }
    async deleteByTripId(id: K, userId: K): Promise<void> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/trip/${id}/${userId}`, {
            method: 'DELETE',

        });

        if (response.status >= 400) {
            const result = await response.json();

            throw new Error(result.message);
        }
        return await response.json();
    }

    async reportComment(id: K, entity: Comment): Promise<V[]> {

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


    async adminUnReportComment(id: K, entity: Comment): Promise<V[]> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/admin/report/${id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(entity)
        });

        const result = await response.json();


        return result;
    }



    async getAllReportComments(id: K): Promise<V[]> {

        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/reports/${id}`);
        return response.json();
    }


    async deleteReportComment(id: K, entity: []): Promise<V> {

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


    async findUserImage(id: K): Promise<string> {
        const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/image-user/${id}`);
        return response.json();
    }


}