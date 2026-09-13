import React from 'react';
import { Button } from '@mui/material';


interface LoadingButtonWrapperProps {
    loading: boolean;
    children: React.ReactNode;
}

const LoadingButtonWrapper: React.FC<LoadingButtonWrapperProps> = ({ loading, children }) => {
    return (
        <Button variant="contained" loading={loading}>
            {children}
        </Button>
    );
};

export default LoadingButtonWrapper;
