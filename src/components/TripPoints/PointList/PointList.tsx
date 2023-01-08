import { Point } from "../../../model/point";
import PointCard from "./PointCard/PointCard";
import './PointList.css'


interface PointListProps {
    points: Point[];

}

export default function PointList({ points }: PointListProps) {


    return (
        <>
            {points.length > 0 ?
                points.map((x,i) =>
                    <PointCard key={x._id} point={x} i={i}/>
                )
                : <h1>ADD YOUR FIRST POINT</h1>}
        </>


    )
}



