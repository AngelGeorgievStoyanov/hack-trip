import imageCompression from "browser-image-compression";
import { BaseSyntheticEvent } from "react";

const MAX_IMAGES = 9;
const MAX_SINGLE_FILE_SIZE_MB = 25;
const MAX_SIZE_MB = 2;
const MAX_DIMENSION = 2048;
const QUALITY = 0.88;

export const handleFilesChange = async (
    event: BaseSyntheticEvent,
    existingFiles: File[],
    setFileSelected: React.Dispatch<React.SetStateAction<File[]>>,
    setErrorMessageImage: React.Dispatch<React.SetStateAction<string | undefined>>,
    existingImagesLength: number = 0
) => {
    const selectedFiles: File[] = Array.from(event.target.files || []);

    if (!selectedFiles.length) return;

    const remainingSlots =
        MAX_IMAGES - existingFiles.length - existingImagesLength;

    if (remainingSlots <= 0) {
        setErrorMessageImage(`Maximum ${MAX_IMAGES} images allowed`);
        return;
    }


    const files = selectedFiles.slice(0, remainingSlots);

    const validFiles = files.filter(
        (file) =>
            file.size <= MAX_SINGLE_FILE_SIZE_MB * 1024 * 1024
    );

    const skippedFilesCount = files.length - validFiles.length;

    if (skippedFilesCount > 0) {
        setErrorMessageImage(
            `${skippedFilesCount} image${skippedFilesCount > 1 ? "s" : ""
            } skipped because ${skippedFilesCount > 1 ? "they exceed" : "it exceeds"
            } the ${MAX_SINGLE_FILE_SIZE_MB} MB limit.`
        );
    } else {
        setErrorMessageImage(undefined);
    }

    if (!validFiles.length) {
        if (event.target instanceof HTMLInputElement) {
            event.target.value = "";
        }
        return;
    }

    const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(
            window.navigator.userAgent
        );

    const options = {
        maxSizeMB: MAX_SIZE_MB,
        maxWidthOrHeight: isMobile ? MAX_DIMENSION : 2560,
        useWebWorker: true,
        initialQuality: QUALITY,
        fileType: "image/jpeg",
    };

    for (const file of validFiles) {
        try {
            const compressedFile = await imageCompression(file, options);

            const originalNameWithoutExtension = file.name.replace(
                /\.[^/.]+$/,
                ""
            );

            const fileName = `${originalNameWithoutExtension}.jpg`;

            const finalFile = new File([compressedFile], fileName, {
                type: "image/jpeg",
            });

            setFileSelected((prev) => [...prev, finalFile]);
        } catch {
            setErrorMessageImage(
                `Could not process image "${file.name}".`
            );
        }
    }

    if (event.target instanceof HTMLInputElement) {
        event.target.value = "";
    }
};