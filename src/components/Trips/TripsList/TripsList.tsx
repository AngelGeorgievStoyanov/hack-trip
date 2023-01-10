import { Trip } from '../../../model/trip';
import TripCard from './TripCard/TripCard'



interface TripsListProps {
    trips: Trip[];

}


export default function TripList({ trips }: TripsListProps) {



    return (

        <>

            {trips.length > 0 ?
                trips.map(x => <TripCard key={x._id} trip={x} />)
                : <h1>WELCOME!</h1>}
        </>
    )
}