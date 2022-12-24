import { useState } from "react";
import { User } from "../model/users";

interface initialAuthState  {
    _id: string,
    email:string,
    firstName:string,
    lastName:string
    accessToken: string,
    
}


const useLocalStorage = (key:string, initialValue: initialAuthState) => {
    const [state, setState] = useState(() => {


        try {
            let item = localStorage.getItem(key);

            return item
                ? JSON.parse(item)
                : initialValue;
        } catch (err) {
            console.log(err)
            return initialValue;

        }
    })
    const setItem = (value:User) => {

        try {
            localStorage.setItem(key, JSON.stringify(value))
            setState(value);
        } catch (err) {
            console.log(err);

        }
    }

    return[
        state,
        setItem
    ];
}

export default useLocalStorage;