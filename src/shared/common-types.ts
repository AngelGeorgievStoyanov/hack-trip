


export type IdType = number | string ;



export interface Identifiable<K> {
  
    _id?: K;
}


export type Optional<T> = T | undefined;