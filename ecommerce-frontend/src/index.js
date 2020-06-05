import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import store from "./store/storeConfig";
import { Route, BrowserRouter } from "react-router-dom";
import * as serviceWorker from './serviceWorker';
import Home from './components/Home';

// include css
import './css/index.css';



ReactDOM.render(
    
    <Provider store={store}>
        <BrowserRouter>
            <Route  path="/" component={Home} />
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);

serviceWorker.unregister();