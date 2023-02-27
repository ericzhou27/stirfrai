import React, { useState, useEffect } from 'react';

import '../App.css';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../constants/firebaseConfig"
import axios from 'axios';

function Profile() {
    const [profile, setProfile] = useState({
        height_ft: 0,
        height_in: 0,
        weight: 0,
        goals: '',
    });

    const [macros, setMacros] = useState({
        carbs: 0,
        protein: 0,
        fat: 0,
        calories: 0,
    })

    useEffect(() => {
        async function fetchProfile() {
            auth.onAuthStateChanged(async (authUser) => {
                const profileDoc = await getDoc(doc(db, 'users', authUser.email));
                if (profileDoc.exists()) {
                    setProfile(profileDoc.data());
                }
            });
        }

        fetchProfile()
    }, []);

    useEffect(() => {
        async function fetchMacros() {
            auth.onAuthStateChanged(async (authUser) => {

                const macrosDoc = await getDoc(doc(db, 'users', authUser.email, 'macros', 'values'));
                if (macrosDoc.exists()) {
                    setMacros(macrosDoc.data());
                }
            })
        }

        fetchMacros();
    }, []);

    const saveProfileDetails = async () => {
        console.log(profile);

        const url = `https://stirfrai.fly.dev/macros?height=${profile.height_ft}'${profile.height_in}"&weight=${profile.weight}%20lbs&goal=${profile.goals}`

        const resp = await axios.get(url)
        .then((resp) => {
            console.log("queried for profile data", resp.data);
            return resp.data;
        })
        .catch((error) => console.log("received error when querying for profile data", error));

        await setDoc(doc(db, 'users', auth.currentUser.email, 'macros', 'values'), {
            carbs: resp.carbs,
            protein: resp.protein,
            fat: resp.fat,
            calories: resp.calories
        }).then(() => {
            console.log("finished adding macros data");
        });

        setMacros(resp);

        await setDoc(doc(db, 'users', auth.currentUser.email), {
            height_ft: parseInt(profile.height_ft),
            height_in: parseInt(profile.height_in),
            weight: parseInt(profile.weight),
            goals: profile.goals,
        }).then(() => {
            console.log("saved profile data");
        })
    }

    const saveMacros = async () => {
        console.log(macros);

        await setDoc(doc(db, 'users', auth.currentUser.email, 'macros', 'values'), {
            carbs: parseInt(macros.carbs),
            protein: parseInt(macros.protein),
            fat: parseInt(macros.fat),
            calories: parseInt(macros.calories),
        }).then(() => {
            console.log("saved macros data");
        })

    }

    return (
        <div className="App">
            <div className="container">
                <p>Profile</p>
                <Box
                    component="form"
                    sx={{
                        '& .MuiTextField-root': { m: 1, width: '25ch' },
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', width: 350 }}>
                            <TextField id="outlined-basic" label="Height (in feet)" variant="outlined" type="number" value={profile.height_ft} onChange={(val) => setProfile({ ...profile, height_ft: val.target.value })} />
                            <TextField id="outlined-basic" label="Height (in inches)" variant="outlined" type="number" value={profile.height_in} onChange={(val) => setProfile({ ...profile, height_in: val.target.value })} />
                        </div>
                        <TextField id="outlined-basic" label="Weight (in lbs)" variant="outlined" type="number" value={profile.weight} onChange={(val) => setProfile({ ...profile, weight: val.target.value })} />
                        <TextField id="outlined-basic" label="Goals (i.e. lose weight, gain muscle)" variant="outlined" multiline style={{ width: 400 }} rows={2} value={profile.goals} InputLabelProps={{ shrink: true }} onChange={(val) => setProfile({ ...profile, goals: val.target.value })} />
                        <Button variant="contained" onClick={saveProfileDetails}>Save Profile</Button>
                        {macros.carbs === 0 && macros.protein === 0 && macros.fat === 0 && macros.calories === 0 ?
                            <Typography variant="h4" style={{ padding: 20 }}>Add your profile details to view your estimated macros!</Typography>
                            : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40 }}>
                                    <Typography variant="h5">Your saved macros</Typography>
                                    <TextField id="outlined-basic" label="carbs" variant="outlined" type="number" value={macros.carbs} onChange={(val) => setMacros({ ...macros, carbs: val.target.value })} />
                                    <TextField id="outlined-basic" label="protein" variant="outlined" type="number" value={macros.protein} onChange={(val) => setMacros({ ...macros, protein: val.target.value })} />
                                    <TextField id="outlined-basic" label="fat" variant="outlined" type="number" value={macros.fat} onChange={(val) => setMacros({ ...macros, fat: val.target.value })} />
                                    <TextField id="outlined-basic" label="calories" variant="outlined" type="number" value={macros.calories} onChange={(val) => setMacros({ ...macros, calories: val.target.value })} />
                                    <Button variant="contained" onClick={saveMacros}>Save Macros</Button>

                                </div>
                            )
                        }
                    </div>
                </Box>
            </div>
        </div>
    )
}

export default Profile