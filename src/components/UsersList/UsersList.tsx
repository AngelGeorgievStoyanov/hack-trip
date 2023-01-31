import { User } from "../../model/users";
import UserCard from "./UserCard/UserCard";



interface UsersListProps {
    users: User[];

}


export default function UsersList({ users }: UsersListProps) {



    return (

        <>

            {users!==undefined && users.length > 0 ?
                users.map(x => <UserCard key={x._id} user={x} />)
                : <h1>WELCOME!</h1>}
        </>
    )
}