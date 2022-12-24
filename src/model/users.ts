import { Identifiable, IdType } from "../shared/common-types";



export class User implements Identifiable<IdType> {
    constructor(

        public id: IdType,
        public email: string,
        public firstName: string,
        public lastName: string,
        public password: string,


    ) { }
}



export class UserRegister implements Omit<User, 'id'>{
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