import { FC, useEffect, useRef, useState } from 'react'
import './Footer.css'

const Footer: FC = () => {

    const [screenOrientation, setScreenOrientation] = useState<string>()
    const refFooter = useRef<HTMLElement | null>(null);
    const isIphoneIpad = /\b(iPhone|iPad)\b/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent);
    const isLandscape = /landscape/.test(screenOrientation ? screenOrientation : '');
    const root = document.getElementById('root') as HTMLDivElement;


    useEffect(() => {

        window.addEventListener('resize', () => {
            if (window.screen && (window.screen.orientation !== null) && (window.screen.orientation.type !== null)) {
                setScreenOrientation(window.screen.orientation.type);
            } else {
                if (window.matchMedia('(orientation: landscape)').matches) {
                    setScreenOrientation('landscape');
                } else {
                    setScreenOrientation('portrait');
                }
            }
            onTouchEnd();
        });

        window.addEventListener('touchend', () => {
            if (window.screen && (window.screen.orientation !== null) && (window.screen.orientation.type !== null)) {
                setScreenOrientation(window.screen.orientation.type);
            } else {
                if (window.matchMedia('(orientation: landscape)').matches) {
                    setScreenOrientation('landscape');
                } else {
                    setScreenOrientation('portrait');
                }
            }
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
            <h4 style={{ fontFamily: 'Space Mono, monospace', color: '#fff', opacity: '1' }}>{"Copyright © "} 2022 - {new Date().getFullYear()}  "HACK-TRIP" by Angel Stoyanov.  All rights reserved.</h4>
        </footer>
    )
}

export default Footer;