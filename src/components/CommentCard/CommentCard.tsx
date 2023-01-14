import { Button, Card, Typography } from "@mui/material";
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
       

            <Card sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '350px', margin: '20px',
              
                padding: '30px', backgroundColor: '#8d868670',
                boxShadow: '3px 2px 5px black', border: 'solid 2px', borderRadius: '12px'
            }}>

                <Typography gutterBottom component="h4">
                    Author name: {comment.nameAuthor}
                </Typography>
                <Typography  gutterBottom component="p" sx={{wordWrap: "break-word", padding:'5px'}}>
                    Comment: {comment.comment}
                </Typography>
                <span>

                    <Button variant="contained" onClick={handeleEdit} sx={{ ':hover': { background: '#4daf30' } ,margin:'5px' }}>EDIT COMMENT</Button>
                    <Button variant="contained" onClick={handeleDelete} sx={{ ':hover': { background: '#ef0a0a' } ,margin:'5px'}}>DELETE COMMENT</Button>
                </span>

            </Card>
        </>
    )
}


