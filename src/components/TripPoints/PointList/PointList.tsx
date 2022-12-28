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
                points.map(x => <article className="article-points">
                    <h6>Point N {points.indexOf(x)+1}</h6>
                    <PointCard key={x._id} point={x} />
                    </article>)
                : <h1>ADD YOUR FIRST POINT</h1>}
        </>
    )
}