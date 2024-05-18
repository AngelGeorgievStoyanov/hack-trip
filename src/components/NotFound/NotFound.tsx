import { Box, Button, Typography } from "@mui/material";
import { FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import './NotFound.css';


const NotFound: FC = () => {

    const internalSec = useRef<NodeJS.Timeout>();
    const internal = useRef<NodeJS.Timeout>();
    const initialState = 10;
    const [count, setCount] = useState(initialState);
    const counterRef = useRef(initialState);
    const navigate = useNavigate();

    useEffect(() => {
        counterRef.current = count;
    }, [count]);
    useEffect(() => {
        internalSec.current = setInterval(() => {
            setCount(prevCount => prevCount - 1);
        }, 1000);

        internal.current = setTimeout(() => {
            navigate('/');
        }, 10000);

        return () => {
            clearTimeout(internal.current!);
            clearInterval(internalSec.current!);
        };

    }, [navigate]);

    const goHome = () => {
        clearInterval(internalSec.current!);
        clearTimeout(internal.current!);
        
        navigate('/');
    }

    return (
        <Box component='div' className="not-found" >
            <Box component='div' className="div-not-found">
                <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h3">
                    PAGE NOT FOUND 404
                </Typography>
                <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h4">
                    WRONG WAY!
                </Typography>
            </Box>
            <Box component='div' className="div-time-out">
                <Typography gutterBottom sx={{ margin: '10px auto' }} variant="h3">

                    {count}  SECONDS OR CLICK
                    <Button onClick={goHome} sx={{ color: 'white', background: 'black', ':hover': { background: 'white', color: 'black' }, padding: '10px 30px', margin: '25px' }}  >HOME</Button>

                </Typography>
            </Box>
        </Box >
    )
}

export default NotFound;