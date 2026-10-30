'use client';

import { type ChangeEvent, type FC } from 'react';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { UploadIcon } from '@/constants/icons';
import { MAX_IMAGES_PER_ENTITY } from '@/constants/images';

interface CustomFileUploadButtonProps {
  handleFilesChange: (event: ChangeEvent<HTMLInputElement>) => void;
  images: string[];
  fileSelected: File[];
  iconFotoCamera: boolean;
  disabled?: boolean;
  maxImages?: number;
}

const CustomFileUploadButton: FC<CustomFileUploadButtonProps> = ({
  handleFilesChange,
  images,
  fileSelected,
  iconFotoCamera,
  disabled = false,
  maxImages = MAX_IMAGES_PER_ENTITY,
}) => {
  const isDisabled = images.length + fileSelected.length >= maxImages || disabled;

  if (iconFotoCamera) {
    return (
      <Tooltip title="UPLOAD" arrow>
        <span>
          <IconButton
            color="primary"
            disabled={isDisabled}
            aria-label="Upload images"
            component="label"
          >
            <input
              hidden
              accept="image/*"
              multiple
              type="file"
              onChange={handleFilesChange}
              disabled={isDisabled}
            />
            <UploadIcon fontSize="large" />
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ width: '30ch' }}>
      <Button variant="contained" component="label" disabled={isDisabled}>
        UPLOAD
        <input
          name="files"
          hidden
          accept="image/*"
          multiple
          type="file"
          onChange={handleFilesChange}
          disabled={isDisabled}
        />
      </Button>
    </Box>
  );
};

export default CustomFileUploadButton;
