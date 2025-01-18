import React from 'react';
import LoadingButton from '@mui/lab/LoadingButton';


interface LoadingButtonWrapperProps {
    loading: boolean;
    children: React.ReactNode;
}

const LoadingButtonWrapper: React.FC<LoadingButtonWrapperProps> = ({ loading, children }) => {
    return (
        <LoadingButton variant="contained" loading={loading}>
            {children}
        </LoadingButton>
    );
};

export default LoadingButtonWrapper;
