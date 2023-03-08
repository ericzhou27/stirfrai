import React from "react"
import { auth } from "../constants/firebaseConfig"
import '../App.css';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useHistory } from "react-router-dom";


function Landing() {
    const currentUser = auth.currentUser
    const history = useHistory()

    return (
        <div className="App flex-full-height">
            <div className="container">
                {/* <div className='splash-image' style={{backgroundImage: `url(${splashImg})`}} /> */}
                {/* <Typography variant="h3" style={{padding: 30}}>Never worry about what your next meal will be!</Typography> */}
                <Typography variant="h2" style={{ padding: 20, fontStyle: 'italic', fontFamily: 'Playfair Display' }}>stirfr.ai</Typography>
                <Typography variant="h3" style={{ padding: 20, fontFamily: 'Playfair Display' }}>an ai-powered meal planner</Typography>
                <Typography variant="h7" style={{ padding: 20, maxWidth: 800, textAlign: 'center', fontFamily: 'Playfair Display' }}>Guided by AI, receive delicious meal plans and recipes based on your preferences and nutritional goals!  Maintain full control of your meal plan at your discretion with our human-in-the-loop design.</Typography>
                <div className="button" style={{ width: 200 }} onClick={() => {
                    history.push(`/home`)
                }}><p style={{ margin: 0, fontFamily: 'Playfair Display', fontStyle: 'italic' }}>Get Started</p></div>
            </div>
        </div>
    )
}

export default Landing