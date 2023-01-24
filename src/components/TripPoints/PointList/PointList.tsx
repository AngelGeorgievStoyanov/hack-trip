import { Point } from "../../../model/point";
import PointCard from "./PointCard/PointCard";
import './PointList.css'


interface PointListProps {
    points: Point[];

}

export default function PointList({ points }: PointListProps) {

    let sortList = points.sort((a, b) => Number(a.pointNumber) - Number(b.pointNumber))
    return (
        <>
            {sortList.length > 0 ?
                sortList.map((x) =>
                    <PointCard key={x.pointNumber} id={x._id} point={x}  length={sortList.length} />
                )
                : <h1>ADD YOUR FIRST POINT</h1>}
        </>


    )
}



