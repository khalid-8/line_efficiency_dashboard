import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const {
    REACT_APP_APIKEY, 
    REACT_APP_AUTHDOMAIN, 
    REACT_APP_PROJECTID,
    REACT_APP_STORAGEBUCKET,
    REACT_APP_MESSAGING_SENDERID,
    REACT_APP_APPID,
    REACT_APP_MEASUREMENTID
    } = process.env

// Initialize Firebase
const app = initializeApp({
    apiKey: REACT_APP_APIKEY,
    authDomain: REACT_APP_AUTHDOMAIN,
    projectId: REACT_APP_PROJECTID,
    storageBucket: REACT_APP_STORAGEBUCKET,
    messagingSenderId: REACT_APP_MESSAGING_SENDERID,
    appId: REACT_APP_APPID,
    measurementId: REACT_APP_MEASUREMENTID
});

export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app);

export default app
