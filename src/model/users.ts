import { Identifiable, IdType } from "../shared/common-types";



export enum UserStatus {
    ACTIVE = 1, SUSPENDED, DEACTIVATED
}



export enum UserRole {
    user = 1, manager, admin
}


export class User implements Identifiable<IdType> {
    constructor(

        public _id: IdType,
        public email: string,
        public firstName: string,
        public lastName: string,
        public password: string,
        public status: UserStatus = UserStatus.ACTIVE,
        public role: UserRole = UserRole.user,
        public accessToken?: string,
        public timeCreated?: string,
        public timeEdited?: string,
        public lastTimeLogin?: string,
        public countOfLogs?: string,
        public imageFile?: string,


    ) { }
}



export class UserRegister implements Omit<User, '_id'>{
    constructor(

        public email: string,
        public firstName: string,
        public lastName: string,
        public password: string,
        public status: UserStatus = UserStatus.ACTIVE,
        public role: UserRole = UserRole.user,
        public timeCreated?: string,
        public timeEdited?: string,
        public lastTimeLogin?: string,
        public countOfLogs?: string,
        public imageFile?: string,


    ) { }
}



export class UserEditAdmin implements Identifiable<IdType> {
    constructor(

        public _id: IdType,
        public email: string,
        public firstName: string,
        public lastName: string,
        public status: UserStatus = UserStatus.ACTIVE,
        public role: UserRole = UserRole.user,
        public timeCreated?: string,
        public timeEdited?: string,
        public lastTimeLogin?: string,
        public countOfLogs?: string,
        public imageFile?: string,


    ) { }
}
