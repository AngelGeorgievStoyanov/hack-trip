import { Identifiable, IdType } from "../shared/common-types";



export class User implements Identifiable<IdType> {
    constructor(

        public _id: IdType,
        public email: string,
        public firstName: string,
        public lastName: string,
        public password: string,
        public accessToken?: string

    ) { }
}



export class UserRegister implements Omit<User, '_id'>{
    constructor(

        public email: string,
        public firstName: string,
        public lastName: string,
        public password: string,

    ) { }
}



export const initialAuthState = {
    _id: '',
    email: '',
    firstName: '',
    lastName: '',
    accessToken: '',

}