import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { Comment } from "../../model/comment";
import { ApiComment } from "../../services/commentService";
import { IdType } from "../../shared/common-types";
import * as commentService from '../../services/commentService'

import './EditComment.css'

const API_COMMENT: ApiComment<IdType, Comment> = new commentService.ApiCommentImpl<IdType, Comment>('data/comments')

export default function EditComment() {

    const comment = useLoaderData() as Comment;
    const navigate = useNavigate()
    const editCommentSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const data = Object.fromEntries(new FormData(e.currentTarget))

        const editComment = { ...data } as any as Comment

        console.log(editComment)

        API_COMMENT.update(comment._id, editComment).then((data) => {
            console.log(data)
            navigate(`/trip/details/${comment._tripId}`)
        }).catch((err) => console.log(err))

    }
    return (
        <>
            <div className="div-edit-coment">
                <section className="section-edit-comment">
                    <form className="form-edit-comment" method="PUT" onSubmit={editCommentSubmitHandler
                    }>
                        <label htmlFor="comment">Comment</label>
                        <textarea name="comment" className="comment" cols={20} rows={4}
                            defaultValue={comment.comment}  ></textarea>
                        <button className="btnEdit">EDIT COMMENT</button>
                        <button className="btnEdit" ><Link to={`/trip/details/${comment._tripId}`}>BACK</Link></button>
                    </form>
                </section>
            </div>
        </>
    )
}