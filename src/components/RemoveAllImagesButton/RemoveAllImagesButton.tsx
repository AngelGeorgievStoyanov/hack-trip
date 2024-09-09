import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

interface RemoveAllImagesButtonProps {
    onDeleteAllImages: () => void;
    iconFotoCamera?: boolean;
}

const RemoveAllImagesButton: React.FC<RemoveAllImagesButtonProps> = ({ onDeleteAllImages, iconFotoCamera }) => {
    return (
        <>
            {iconFotoCamera ? (
                <Tooltip title='REMOVE ALL IMAGES' arrow>
                    <DeleteForeverIcon
                        color="primary"
                        fontSize="large"
                        onClick={onDeleteAllImages}
                        style={{ cursor: 'pointer' }}
                    />
                </Tooltip>
            ) : (
                <Box component='div' sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" onClick={onDeleteAllImages}>
                        Remove all images
                    </Button>
                </Box>
            )}
        </>
    );
};

export default RemoveAllImagesButton;
