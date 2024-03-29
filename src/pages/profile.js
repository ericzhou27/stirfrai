import React, { useState, useEffect } from 'react';

import '../App.css';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import { Pinwheel } from '@uiball/loaders'
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
    });

    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [macrosLoading, setMacrosLoading] = useState(false);
    const [successAlert, setSuccessAlert] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            auth.onAuthStateChanged(async (authUser) => {
                const profileDoc = await getDoc(doc(db, 'users', authUser.uid));
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

                const macrosDoc = await getDoc(doc(db, 'users', authUser.uid, 'macros', 'values'));
                if (macrosDoc.exists()) {
                    setMacros(macrosDoc.data());
                }
                setLoading(false)
            })

        }

        fetchMacros();
    }, []);

    const saveProfileDetails = async () => {
        console.log(profile);
        setProfileLoading(true);

        const url = `https://stirfrai.fly.dev/macros?height=${profile.height_ft}'${profile.height_in}"&weight=${profile.weight}%20lbs&goal=${profile.goals}`

        const resp = await axios.get(url)
            .then((resp) => {
                console.log("queried for profile data", resp.data);
                return resp.data;
            })
            .catch((error) => console.log("received error when querying for profile data", error));

        await setDoc(doc(db, 'users', auth.currentUser.uid, 'macros', 'values'), {
            carbs: resp.carbs,
            protein: resp.protein,
            fat: resp.fat,
            calories: resp.calories
        }).then(() => {
            console.log("finished adding macros data");
        });

        setMacros(resp);

        await setDoc(doc(db, 'users', auth.currentUser.uid), {
            height_ft: parseInt(profile.height_ft),
            height_in: parseInt(profile.height_in),
            weight: parseInt(profile.weight),
            goals: profile.goals,
        }).then(() => {
            console.log("saved profile data");
        })

        setProfileLoading(false);
        setSuccessAlert(true);
    }

    const saveMacros = async () => {
        console.log(macros);
        setMacrosLoading(true);

        await setDoc(doc(db, 'users', auth.currentUser.uid, 'macros', 'values'), {
            carbs: parseInt(macros.carbs),
            protein: parseInt(macros.protein),
            fat: parseInt(macros.fat),
            calories: parseInt(macros.calories),
        }).then(() => {
            console.log("saved macros data");
        })

        setMacrosLoading(false);
        setSuccessAlert(true);
    }

    const hasProfile = !(macros.carbs === 0 && macros.protein === 0 && macros.fat === 0 && macros.calories === 0)

    return loading ?
        (<div className="loadingContainer">
            <Pinwheel size={35} color="#231F20" />
        </div>) :
        (
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
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'top', height: 500 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'top', marginRight: 50 }}>
                            <Typography variant="h5" style={{ fontFamily: 'Playfair Display' }}>Your information</Typography>
                            <TextField id="outlined-basic" label="Height (in feet)" variant="outlined" type="number" style={{ width: 400 }} sx={{"& .MuiOutlinedInput-root.Mui-focused": {"& > fieldset": {borderColor: 'black'}}}} InputProps={{ style: { fontFamily: 'Playfair Display' } }} InputLabelProps={{ style: { fontFamily: 'Playfair Display', color: 'black' } }} value={profile.height_ft} onChange={(val) => setProfile({ ...profile, height_ft: val.target.value })} />
                            <TextField id="outlined-basic" label="Height (in inches)" variant="outlined" type="number" style={{ width: 400 }} sx={{"& .MuiOutlinedInput-root.Mui-focused": {"& > fieldset": {borderColor: 'black'}}}} InputProps={{ style: { fontFamily: 'Playfair Display' } }} InputLabelProps={{ style: { fontFamily: 'Playfair Display', color: 'black' } }} value={profile.height_in} onChange={(val) => setProfile({ ...profile, height_in: val.target.value })} />
                            <TextField id="outlined-basic" label="Weight (in lbs)" variant="outlined" type="number" style={{ width: 400 }} sx={{"& .MuiOutlinedInput-root.Mui-focused": {"& > fieldset": {borderColor: 'black'}}}} InputProps={{ style: { fontFamily: 'Playfair Display' } }} InputLabelProps={{ style: { fontFamily: 'Playfair Display', color: 'black' } }} value={profile.weight} onChange={(val) => setProfile({ ...profile, weight: val.target.value })} />
                            <TextField id="outlined-basic" label="Goals (i.e. lose weight, gain muscle)" variant="outlined" multiline style={{ width: 400 }} sx={{"& .MuiOutlinedInput-root.Mui-focused": {"& > fieldset": {borderColor: 'black'}}}} InputProps={{ style: { fontFamily: 'Playfair Display' } }} rows={2} value={profile.goals} InputLabelProps={{ shrink: true, style: { fontFamily: 'Playfair Display', color: 'black' } }} onChange={(val) => setProfile({ ...profile, goals: val.target.value })} />
                            <LoadingButton style={{ marginTop: 'auto' }} loading={profileLoading} variant="contained" onClick={saveProfileDetails}>Save Profile</LoadingButton>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'top', marginLeft: 50 }}>
                            <Typography variant="h5" style={{ fontFamily: 'Playfair Display' }}>Your macros</Typography>
                            <TextField disabled={!hasProfile} id="outlined-basic" label="carbs (in grams)" variant="outlined" type="number" sx={{"& .MuiOutlinedInput-root.Mui-focused": {"& > fieldset": {borderColor: 'black'}}}} InputProps={{ style: { fontFamily: 'Playfair Display' } }} InputLabelProps={{ style: { fontFamily: 'Playfair Display', color: 'black' } }} value={macros.carbs} onChange={(val) => setMacros({ ...macros, carbs: val.target.value })} />
                            <TextField disabled={!hasProfile} id="outlined-basic" label="protein (in grams)" variant="outlined" type="number" sx={{"& .MuiOutlinedInput-root.Mui-focused": {"& > fieldset": {borderColor: 'black'}}}} InputProps={{ style: { fontFamily: 'Playfair Display' } }} InputLabelProps={{ style: { fontFamily: 'Playfair Display', color: 'black' } }} value={macros.protein} onChange={(val) => setMacros({ ...macros, protein: val.target.value })} />
                            <TextField disabled={!hasProfile} id="outlined-basic" label="fat (in grams)" variant="outlined" type="number" sx={{"& .MuiOutlinedInput-root.Mui-focused": {"& > fieldset": {borderColor: 'black'}}}} InputProps={{ style: { fontFamily: 'Playfair Display' } }} InputLabelProps={{ style: { fontFamily: 'Playfair Display', color: 'black' } }} value={macros.fat} onChange={(val) => setMacros({ ...macros, fat: val.target.value })} />
                            <TextField disabled={!hasProfile} id="outlined-basic" label="calories" variant="outlined" type="number" sx={{"& .MuiOutlinedInput-root.Mui-focused": {"& > fieldset": {borderColor: 'black'}}}} InputProps={{ style: { fontFamily: 'Playfair Display' } }} InputLabelProps={{ style: { fontFamily: 'Playfair Display', color: 'black' } }} value={macros.calories} onChange={(val) => setMacros({ ...macros, calories: val.target.value })} />
                            <LoadingButton disabled={!hasProfile} style={{ marginTop: 'auto' }} loading={macrosLoading} variant="contained" onClick={saveMacros}>{hasProfile ? 'Save Macros' : 'Create profile first!'}</LoadingButton>
                            <Snackbar
                                open={successAlert}
                                autoHideDuration={2000}
                                onClose={() => setSuccessAlert(false)}
                                message="Successfully saved!"
                            />
                        </div>
                    </div>
                </Box>
            </div>
        )
}

export default Profile