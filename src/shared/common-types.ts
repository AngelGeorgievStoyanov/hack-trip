import { BaseSyntheticEvent } from "react";
import { Trip } from "../model/trip";

export function toIsoDate(date: Date) {
    return date.toJSON();
}


export type IdType = number | string;



export interface Identifiable<K> {

    _id?: K;

}


export type Optional<T> = T | undefined;



export function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

export function stringAvatar(name: string) {
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    };
}



export function sliceDescription(description: string, maxLength: number) {
    if (!description) {
        return '';
    }
    if (description.length > maxLength) {

        let slicedDescription = description.slice(0, maxLength - 3);
        const lastSpaceIndex = slicedDescription.lastIndexOf(' ');
        slicedDescription = slicedDescription.slice(0, lastSpaceIndex);
        if (slicedDescription.length < description.length) {
            slicedDescription += '...';
        }
        return slicedDescription;
    } else {
        return description;
    }
}



export function mouseover(e: BaseSyntheticEvent, element: React.MutableRefObject<HTMLHeadingElement | null>) {

    if (element && element.current !== null) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let iterations = 0;
        const interval = setInterval(() => {
            e.target.innerText = e.target.innerText.split('').map((letter: string, index: number) => {
                if (index < iterations) {
                    return e.target.dataset.value[index];
                }
                return letters[Math.floor(Math.random() * 26)];
            }).join('');
            if (iterations >= e.target.dataset.value.length) clearInterval(interval);
            iterations += 1 / 3;
        }, 30);
    }

}



export function touchStart(element: React.MutableRefObject<HTMLHeadingElement | null>) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let iterations = 0;
    const interval = setInterval(() => {
        if ((element !== null) && (element.current !== null)) {
            element.current.innerText = element.current?.innerText.split('').map((letter: string, index: number) => {
                if (index < iterations) {
                    return element.current?.dataset.value![index];
                }
                return letters[Math.floor(Math.random() * 26)];
            }).join('');
            if (iterations >= element.current?.dataset.value!.length!) clearInterval(interval);
            iterations += 1 / 3;
        }
    }, 30);
}


export function getRandomTripAndImage(trips: Trip[] | []) {
    if (!trips || trips.length === 0) return


    const randomTripIndex = Math.floor(Math.random() * trips.length);
    const randomTrip = trips[randomTripIndex];
    const randomImage =
        randomTrip.imageFile && randomTrip.imageFile.length > 0
            ? randomTrip.imageFile[
            Math.floor(Math.random() * randomTrip.imageFile.length)
            ]
            : "hack-trip-home-page.png";

    return randomImage;
}


export type TripGroupId = { _id: string, tripGroupId: string, dayNumber: number, _ownerId: string }


export const testUserDetails = '191ff979-5438-4ea8-865e-5724257a8fd6';

export const accessTokenTestUserDetails = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIxOTFmZjk3OS01NDM4LTRlYTgtODY1ZS01NzI0MjU3YThmZDYiLCJlbWFpbCI6InRlc3RAYWJ2LmJnIiwiZmlyc3ROYW1lIjoiVGVzdCIsImxhc3ROYW1lIjoiVGVzdCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzM3MjA1NTAzfQ.JVrj6BU_pcVug-wCJeqV3oe1qL5WiR4QTy0jIMKWa3M';
