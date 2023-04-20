import { Typography } from "@mui/material";
import { FC, ReactElement } from "react";
import { Point } from "../../../model/point";
import PointCard from "./PointCard/PointCard";


interface PointListProps {
    points: Point[];

}


const PointList: FC<PointListProps> = ({ points }): ReactElement => {


    let sortList = points.sort((a, b) => Number(a.pointNumber) - Number(b.pointNumber));
    return (
        <>
            {sortList.length > 0 ?
                sortList.map((x) =>
                    <PointCard key={x.pointNumber} id={x._id} point={x} length={sortList.length} />
                )
                :
                <Typography variant='h5'>
                    ADD YOUR FIRST POINT
                </Typography>

            }
        </>
    )
}

export default PointList;



