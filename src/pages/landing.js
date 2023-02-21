import React from "react"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../constants/firebaseConfig"
import { useHistory } from "react-router-dom";
import '../App.css';

function login() {
    const currentUser = auth.currentUser
    const provider = new GoogleAuthProvider();
    if (!currentUser) {
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                console.log(user)
                // TODO - re-route to /home
            }).catch((error) => {
                console.log("ERROR - ", error)
            });
    } else {
        alert("Already logged in.")
        console.log(currentUser)
    }
}

function Landing() {
    const currentUser = auth.currentUser
    console.log("CURRENT - ", currentUser)

    return (
        <div className="App">
            <div onClick={login} className="container">
                <img
                    className="googleSignIn"
                    src="https://i.pinimg.com/originals/9c/85/47/9c8547399c1e4dd14e1a30f3e05d179a.png" />
            </div>
        </div>
    )
}

export default Landing