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
                        <Typography sx={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }} variant='h5'>WELCOME!</Typography>
                        <Typography sx={{ margin: '2px', fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1', textShadow: '3px 3px 3px rgb(10,10,10)' }} variant='subtitle1'>No trips found!</Typography>
                    </Box>
                </>
            }
        </>
    )
}

export default TripList;