import { Identifiable, IdType, toIsoDate } from "../shared/common-types";



export class User implements Identifiable<IdType> {
    constructor(

        public _id: IdType,
        public email: string,
        public firstName: string,
        public lastName: string,
        public password: string,
        public accessToken?: string,
        public timeCreated?: string,
        public timeEdited?: string,
        public lastTimeLogin?: string,
        public countOfLogs?: string,
        public imageFile?:string

    ) { }
}



export class UserRegister implements Omit<User, '_id'>{
    constructor(

        public email: string,
        public firstName: string,
        public lastName: string,
        public password: string,
        public timeCreated?: string,
        public timeEdited?: string,
        public lastTimeLogin?: string,
        public countOfLogs?: string,
        public imageFile?:string

    ) { }
}



export const initialAuthState = {
    _id: '',
    email: '',
    firstName: '',
    lastName: '',
    accessToken: '',

}