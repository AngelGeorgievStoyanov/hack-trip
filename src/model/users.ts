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
        public verifyEmail?: number
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



export interface IFailedLogs {
    _id?: string,
    date: string,
    email: string,
    ip: string,
    userAgent: string,
    country_code: string,
    country_name: string,
    city: string,
    latitude: number,
    longitude: number,
    state: string
}

export interface IRouteNotFoundLogs {
    _id?: string;
    date?: string;
    reqUrl?: string;
    reqMethod?: string;
    reqHeaders?: any;
    reqQuery?: any;
    reqBody?: string;
    reqParams?: string;
    reqIp?: string;
    reqUserId?: string;
    reqUserEmail?: string;
  }
  
