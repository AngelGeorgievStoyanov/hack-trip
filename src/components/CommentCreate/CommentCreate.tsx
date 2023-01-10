import { Link, useNavigate, useParams } from "react-router-dom"
import { CommentCreate } from "../../model/comment";
import { ApiComment } from "../../services/commentService";
import { IdType } from "../../shared/common-types";

import * as commentService from '../../services/commentService'

import './CommentCreate.css'



const API_COMMENT: ApiComment<IdType, CommentCreate> = new commentService.ApiCommentImpl<IdType, CommentCreate>('data/comments');



export default function CreateComment() {

    const idTrip = useParams().tripId
    const userId = sessionStorage.getItem('userId')
    const nameAuthor = sessionStorage.getItem('email')


    const navigate = useNavigate()
    const createCommentSubmitHandler = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent) => {
        e.preventDefault()


        const target = e.currentTarget as HTMLFormElement
        if (target) {
            const data = Object.fromEntries(new FormData(target))
            if (userId !== undefined && nameAuthor !== undefined) {
                data.nameAuthor = nameAuthor + ''
                data._ownerId = userId + ''
                data._tripId = idTrip + ''

            }

            const newComment = { ...data } as any as CommentCreate

            API_COMMENT.create(newComment).then((data) => {
                console.log(data)

                navigate(`/trip/details/${idTrip}`)
            }).catch((err) => {
                console.log(err)
            })
        }



    }



    return (
        <div className="div-add-coment">
            <section className="section-add-comment">
                <form id="form" className="form-add-comment" method="POST" onSubmit={createCommentSubmitHandler}>
                    <label htmlFor="comment" >Comment</label>
                    <textarea name="comment" id="comment" cols={20} rows={4} ></textarea>
                    <button className="add-comment">ADD COMMENT</button>
                    <button className="add-comment">
                        <Link to={`/trip/details/${idTrip}`} className="btnDetails">BACK</Link>
                    </button>
                 
                </form>
            </section>
        </div>
    )
}