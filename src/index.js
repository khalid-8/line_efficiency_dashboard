import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// import reportWebVitals from './reportWebVitals';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter } from "react-router-dom";
import { Notification } from "./components";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));
//const getBaseName = path => path.substr(0, path.indexOf('/'))

root.render(
    <BrowserRouter basename={process.env.REACT_APP_HOSTING_SUBFOLDER}>
        <App />
        <Notification />
    </BrowserRouter>
);
/**
 *     <React.StrictMode>

 */
serviceWorkerRegistration.register();


/*if (process.env.REACT_APP_NODE_ENV === "production") {
    console.log = () => { }
    console.error = () => { }
    console.debug = () => { }

}*/
