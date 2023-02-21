import React, { useState, useEffect } from 'react';
import { auth, db } from "../constants/firebaseConfig"
import '../App.css';

function logout() {
    console.log("LOGGING OUT")
    auth.signOut().then(() => {
        console.log("SUCCESS")
        // Sign-out successful.
    }).catch((error) => {
        console.log("FAILURE - ", error)
        // An error happened.
    });
}


function Home() {
    useEffect(() => {
        // 
    })


    return (
        <div className="App">
            <div onClick={logout} className="container">
                <p>Sign Out</p>
            </div>
        </div>
    )
}

export default Home