import { Box, Button, IconButton, Tooltip } from "@mui/material";
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { FC } from "react";






interface CustomFileUploadButtonProps {
    handleFilesChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    images: string[];
    fileSelected: File[];
    iconFotoCamera: boolean;
    disabled?: boolean;
}


const CustomFileUploadButton: FC<CustomFileUploadButtonProps> = ({ handleFilesChange, images, fileSelected, iconFotoCamera, disabled = false }) => {
    const isDisabled = ((images ? images.length : 0) + fileSelected.length) >= 9;

    return (
        <>
            {iconFotoCamera ? (
                <Tooltip title="UPLOAD" arrow>
                    <IconButton color="primary" disabled={isDisabled || disabled} aria-label="upload picture" component="label">
                        <input hidden accept="image/*" multiple type="file" onChange={handleFilesChange} />
                        <PhotoCamera fontSize="large" />
                    </IconButton>
                </Tooltip>
            ) : (
                <Box sx={{ width: '30ch' }}>
                    <Button variant="contained" component="label" disabled={isDisabled || disabled}>
                        Upload
                        <input name="files" hidden accept="image/*" multiple type="file" onChange={handleFilesChange} />
                    </Button>
                </Box>
            )}
        </>
    );
};

export default CustomFileUploadButton;