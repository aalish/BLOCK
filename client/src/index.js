import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Dashboard from './components/Dashboard';
import Issuer from './components/Issuer';
import Verifier from './components/Verifier';
import Customer from './components/Customer';

import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Route } from 'react-router-dom';

ReactDOM.render(
    <BrowserRouter>
        <div>
            <Route path="/" exact component={App} />
            <Route path="/dashboard" exact component={Dashboard} />
            <Route path="/issuer" exact component={Issuer} />
            <Route path="/verifier" exact component={Verifier} />
            <Route path="/public" exact component={Customer} />
        </div>
    </BrowserRouter>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
