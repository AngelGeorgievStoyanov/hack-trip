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
