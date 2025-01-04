import imageCompression from "browser-image-compression";
import { BaseSyntheticEvent } from "react";

export const handleFilesChange = async (
    event: BaseSyntheticEvent,
    existingFiles: File[], 
    setFileSelected: React.Dispatch<React.SetStateAction<File[]>>,
    setErrorMessageImage: React.Dispatch<React.SetStateAction<string | undefined>>, 
    existingImagesLength: number = 0 
) => {
    let files: File[] = Array.from(event.target.files);

    if (!files || files.length === 0) return;


    while (files.some((x) => !x.name.match(/\.(jpg|jpeg|PNG|gif|JPEG|png|JPG|gif)$/))) {
        setErrorMessageImage('Please select valid file image');

        let index = files.findIndex((x: any) => !x.name.match(/\.(jpg|jpeg|PNG|gif|JPEG|png|JPG|gif)$/));
        files.splice(index, 1);
    }

    files = files.slice(0, 9 - existingFiles.length - existingImagesLength);

    let indexSize: number = 0;
    let totalSize: number = 0;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(window.navigator.userAgent);

    if (isMobile) {
        files.forEach((x, i) => {
            totalSize += x.size;
            if (totalSize > 40000000 && indexSize === 0) {
                indexSize = i - 1;
            }
        });

        if (indexSize > 0) {
            files = files.slice(0, indexSize);
        }
    }

    const compressFiles = files.map(async (x: File) => {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: x.type,
            name: x.name.split(/[,\s]+/).length > 1 ? x.name.split(/[,\s]+/)[0] + '.jpg' : x.name
        };

        try {
            const compressedFile = await imageCompression(x, options);
            const compressFile = new File([compressedFile], options.name, { type: x.type });
            setFileSelected(prev => [...prev, compressFile]);
        } catch (err) {
            console.log(err);
        }
    });

    await Promise.all(compressFiles); 
};
