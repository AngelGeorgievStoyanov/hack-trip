import { Box, Button, Typography } from "@mui/material";
import { FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import './NotFound.css';


const NotFound: FC = () => {


    let internalSec: ReturnType<typeof setInterval>;
    let internal: ReturnType<typeof setTimeout>;
    const initalState = 10;
    const [count, setCount] = useState(initalState);
    const counterRef = useRef(initalState);
    const navigate = useNavigate();

    useEffect(() => {
        counterRef.current = count;
    });


    useEffect(() => {


        internalSec = setInterval(() => {
            setCount(counterRef.current - 1)

        }, 1000)



        internal = setTimeout(() => (
            navigate('/')
        ), 10000)

        return () => {
            clearTimeout(internal);
            clearInterval(internalSec)
        };

    }, [])
    const goHome = () => {
        clearInterval(internalSec)
        clearTimeout(internal)
        navigate('/')
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