import React, { useState, useEffect } from 'react';
import { auth, db } from "../constants/firebaseConfig"
import Button from '@mui/material/Button';
import '../App.css';
import { useHistory } from "react-router-dom";
import { Redirect } from 'react-router-dom';

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
    const history = useHistory();

    useEffect(() => {
        // 
    })


    return (
        <div className="App">
            <div className="container">
                <Button variant="contained" style={{margin: 30}}><a href="/create">Create a new meal plan</a></Button>
                {/* <Button variant="contained" style={{margin: 30}} onClick={() => {return <Redirect to="/create" />}}>Create a new meal plan</Button> */}

                <Button variant="contained"><a href="/profile">Create/edit your profile</a></Button>
            </div>
        </div>
    )
}

export default Home