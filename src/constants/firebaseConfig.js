import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
    apiKey: "AIzaSyBKZoVId7Jqbny0frdhEI6hVEyPX_GWvu4",
    authDomain: "stirfrai-2d1d2.firebaseapp.com",
    projectId: "stirfrai-2d1d2",
    storageBucket: "stirfrai-2d1d2.appspot.com",
    messagingSenderId: "393505458106",
    appId: "1:393505458106:web:999317d41937929e9abf83",
    measurementId: "G-8YYF0391R3"
}

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore()

export { auth as auth, db as db }