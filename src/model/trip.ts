import { Identifiable, IdType, toIsoDate } from "../shared/common-types";


export enum TripTransport {
    Car = 1, Bus, Aircraft, 'Another type'
}

export enum TripTipeOfGroup {
    Family = 1, 'Family with children', Friends, 'Another type'
}

export class Trip implements Identifiable<IdType> {
    constructor(
        public _id: IdType,
        public title: string,
        public description: string,
        public price: string,
        public transport: TripTransport = TripTransport.Car,
        public countPeoples: string,
        public typeOfPeople: TripTipeOfGroup = TripTipeOfGroup.Family,
        public destination: string,
        public imageUrl: string,
        public coments: string,
        public likes: string[],
        public _ownerId: string,
        public lat: string,
        public lng: string,
        public timeCreated: string = toIsoDate(new Date()),
        public favorites: string[],
        public timeEdited?: string,
        public reportTrip?: string[],
        public imageFile?: string[],
        ) { }

}



export class TripCreate implements Omit<Trip, '_id'>{
    constructor(
        public _id: IdType,
        public title: string,
        public description: string,
        public price: string,
        public transport: TripTransport = TripTransport.Car,
        public countPeoples: string,
        public typeOfPeople: TripTipeOfGroup = TripTipeOfGroup.Family,
        public destination: string,
        public imageUrl: string,
        public coments: string,
        public likes: string[],
        public _ownerId: string,
        public lat: string,
        public lng: string,
        public timeCreated: string = toIsoDate(new Date()),
        public favorites: string[],
        public timeEdited?: string,
        public reportTrip?: string[],
        public imageFile?: string[],
    ) { }
}
