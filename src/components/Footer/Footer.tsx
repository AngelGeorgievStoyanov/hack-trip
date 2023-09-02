import { FC, useEffect, useRef, useState } from 'react'
import './Footer.css'

const Footer: FC = () => {
    
    const [screenOrientation, setScreenOrientation] = useState<string>((window.screen.orientation.type).toString())
    const refFooter = useRef<HTMLElement | null>(null);
    const isIphoneIpad = /\b(iPhone|iPad)\b/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent);
    const isLandscape = /landscape/.test(screenOrientation)
    const root = document.getElementById('root') as HTMLDivElement;

    useEffect(() => {
        window.addEventListener('resize', () => {
            setScreenOrientation(window.screen.orientation.type);
            onTouchEnd();
        });

        window.addEventListener('touchend', () => {
            setScreenOrientation(window.screen.orientation.type);
            onTouchEnd();
        });

    }, []);

    const onTouchEnd = () => {

        if (isIphoneIpad && (window.screen.orientation.angle !== 0 || isLandscape) && refFooter.current && (refFooter.current?.getBoundingClientRect().bottom < window.screen.width + 5)) {
            window.scroll(0, root.clientHeight - window.screen.width - 5);
        }
    }

    return (

        <footer ref={refFooter} className="footer">
            <h4 style={{ fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1' }}>{"Copyright © "} 2022 - 2023  "HACK-TRIP" by Angel Stoyanov.  All rights reserved.</h4>
        </footer>
    )
}

export default Footer;