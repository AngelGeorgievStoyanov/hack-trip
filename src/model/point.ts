import { Identifiable, IdType } from "../shared/common-types";

export class Point implements Identifiable<IdType> {
    constructor(
        public _id: IdType,
        public name: string,
        public description: string,
        public _ownerTripId: string,
        public lat: string,
        public lng: string,
        public pointNumber: IdType,
        public imageFile? : string[],
        public _ownerId?: string,

    ) { }
}


export class PointCreate implements Omit<Point, '_id'> {
    constructor(
        public _id: IdType,
        public name: string,
        public description: string,
        public _ownerTripId: string,
        public lat: string,
        public lng: string,
        public pointNumber: IdType,
        public imageFile? : string[],
        public _ownerId?: string,

    ) { }

}

