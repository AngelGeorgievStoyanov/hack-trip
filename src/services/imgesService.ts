import { Identifiable } from "../shared/common-types";
import { CONNECTIONURL } from "../utils/baseUrl";



const baseUrl = CONNECTIONURL;


export interface ApiTripImages<K, V extends Identifiable<K>> {
   
    sendFile(entityWithoutId: FormData): Promise<V>

}



export class ApiTripImagesImpl<K, V extends Identifiable<K>> implements ApiTripImages<K, V> {
    constructor(public apiCollectionSuffix: string) { }


async sendFile(formdata: FormData): Promise < V > {
    const response = await fetch(`${baseUrl}/${this.apiCollectionSuffix}/upload`, {

        method: 'POST',
        body: formdata,
        headers: {}
    });

    const result = await response.json()

    return result
}


}