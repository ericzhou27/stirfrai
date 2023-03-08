import React from "react"
import { auth } from "../constants/firebaseConfig"
import '../App.css';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import splashImg from '../imgs/splash.jpg'

function Landing() {
    const currentUser = auth.currentUser
    console.log("CURRENT - ", currentUser)

    return (
        <div className="App flex-full-height">
            <div className="container">
                {/* <div className='splash-image' style={{backgroundImage: `url(${splashImg})`}} /> */}
                {/* <Typography variant="h3" style={{padding: 30}}>Never worry about what your next meal will be!</Typography> */}
                <Typography variant="h2" style={{padding: 20}}>stirfr.ai</Typography>
                <Typography variant="h3" style={{padding: 20}}>an ai-powered meal planner</Typography>
                <Typography variant="h7" style={{padding: 20, maxWidth: 800, textAlign: 'center'}}>Guided by AI, receive delicious meal plans and recipes based on your preferences and nutritional goals!  Maintain full control of your meal plan at your discretion with our human-in-the-loop design.</Typography>
                <Button variant="contained" size='large' style={{marginTop: 50}}><a href="/home">Get Started</a></Button>
            </div>
        </div>
    )
}

export default Landing