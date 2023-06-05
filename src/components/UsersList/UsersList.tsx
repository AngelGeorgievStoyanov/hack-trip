import { Typography } from "@mui/material";
import { FC, ReactElement } from "react";
import { User } from "../../model/users";
import UserCard from "./UserCard/UserCard";



interface UsersListProps {
    users: User[];

}



const UserList: FC<UsersListProps> = ({ users }): ReactElement => {


    return (
        <>
            {users !== undefined && users.length > 0 ?
                users.map(x => <UserCard key={x._id} user={x} />)
                :
                <Typography sx={{ fontFamily: 'Space Mono, monospace' }} variant='h5'>WELCOME!</Typography>

            }
        </>
    )
}

export default UserList;