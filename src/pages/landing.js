import React from "react"
import { auth } from "../constants/firebaseConfig"
import '../App.css';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

function Landing() {
    const currentUser = auth.currentUser
    console.log("CURRENT - ", currentUser)

    return (
        <div className="App">
            <div className="container">
                <Typography variant="h1" style={{padding: 30, alignContent: 'center'}}>Never worry about what your next meal will be!</Typography>
                <Typography variant="h4" style={{padding: 20}}>Powered by AI, receive delicious recipes based on your preferences and nutritional goals!</Typography>
                <Button variant="contained"><a href="/home">Get Started</a></Button>
            </div>
        </div>
    )
}

export default Landing