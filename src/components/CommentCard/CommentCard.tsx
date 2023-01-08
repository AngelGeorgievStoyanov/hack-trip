import { Comment } from "../../model/comment"

export interface CommentListener {
    (comment: Comment): void;
}

interface CommentCardProps {
    comment: Comment;
    onDeleteCom: CommentListener
    onEditCom: CommentListener
}

export default function CommentCard({ comment, onDeleteCom, onEditCom }: CommentCardProps) {


    const handeleDelete = () => {
        onDeleteCom(comment)
    }

    const handeleEdit = () => {
        onEditCom(comment)
    }

    return (
        <>
            <article className="article-trip-comments">
                <h4>Author name: {comment.nameAuthor}</h4>
                <p>Comment: {comment.comment}</p>
                <button onClick={handeleDelete}>DELETE COMMENT</button>
                <button onClick={handeleEdit}>EDIT COMMENT</button>
            </article>
        </>
    )
}