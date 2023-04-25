import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import { FC, ReactElement } from 'react';
import { Trip } from '../../../model/trip';
import TripCard from './TripCard/TripCard';


interface TripsListProps {
    trips: Trip[];
}



const TripList: FC<TripsListProps> = ({ trips }): ReactElement => {

    return (
        <>
            {trips.length > 0 ?
                trips.map(x => <TripCard key={x._id} trip={x} />)
                :
                <>
                    <Box>
                        <Typography sx={{ fontFamily: 'cursive' }} variant='h5'>WELCOME!</Typography>
                        <Typography sx={{ fontFamily: 'cursive' }} variant='subtitle1'>No trips found!</Typography>
                    </Box>
                </>
            }
        </>
    )
}

export default TripList;