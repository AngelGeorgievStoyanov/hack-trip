import { Link } from 'react-router-dom';

import './Login.css'

export function Login() {
    return (
        <>

            <section className='section-login' >
                <div className="div-login-form">

                    <h2>LOGIN PAGE</h2>
                    <form className='login-form' method="post">
                        <span>

                            <label htmlFor="email">EMAIL: </label>
                            <input name="email" placeholder="Email" className="login-input" />
                        </span>
                        <span>

                            <label htmlFor="password">PASSWORD: </label>
                            <input type="password" name="password" placeholder="Password"
                                className="login-input" />
                        </span>

                        <button className="btnSubmit login-input">Sign Up</button>
                        <h4>
                            <Link to='/register' className="login-input" id="a">Don't Have An Account? Sign up!</Link>
                        </h4>
                    </form >
                </div >
            </section >
        </>
    )
}