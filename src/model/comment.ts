import { Identifiable, IdType } from "../shared/common-types";

export class Comment implements Identifiable<IdType> {
    constructor(
        public nameAuthor: string | null,
        public _id: string,
        public comment: string,
        public _ownerId: string,
        public _tripId: string,

    ) { }
}


export class CommentCreate implements Omit<Comment, '_id'> {
    constructor(
        public nameAuthor: string | null,
        public _id: string,
        public comment: string,
        public _ownerId: string,
        public _tripId: string,
    ) { }

}
