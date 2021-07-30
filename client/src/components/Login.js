import React from 'react';

function Login() {
    return (
        <div>
            <div className="log-in-tab">

            <button className="btn cut-log-in-tab"><i className="fa fa-close"></i></button>
            <form action="#" className="log-in-form" autocomplete="off">
                <div className="form-block username-block">
                    <label for="signature">Singature</label>
                    <input id="signature" type="text" placeholder="signature"/>
                </div>

                <div className="form-block password-block">
                    <label for="privatekey">Private Key</label>
                    <input id="privatekey" type="password" placeholder="private key"/>
                </div>

                <div className="submit-btn">
                    <button className="log-in-submit">log in</button>
                </div>
            </form>


            </div>
        </div>
    );
}

export default Login;