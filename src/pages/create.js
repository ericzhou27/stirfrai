import React, { useState, useEffect } from 'react';
import '../App.css';
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { doc, addDoc, collection, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../constants/firebaseConfig"
import axios from 'axios';
import { WithContext as ReactTags } from 'react-tag-input';
import { useHistory } from "react-router-dom";
import ScrollIntoView from 'react-scroll-into-view'

import '../styles/react_tags.css'

function Create() {
    const [loading, setLoading] = useState(false);
    const history = useHistory()

    const [preferences, setPreferences] = useState({
        likes: [],
        dislikes: [],
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden";
    }, [])

    const KeyCodes = {
        comma: 188,
        enter: 13
    };
    const delimiters = [KeyCodes.comma, KeyCodes.enter];
    const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER'];

    const generateMealPlan = async () => {
        setLoading(true);
        const macrosDoc = await getDoc(doc(db, 'users', auth.currentUser.uid, 'macros', 'values'));
        const macrosData = macrosDoc.data();

        const likesUrl = preferences.likes ? "&like=" + preferences.likes.map(x => x.text).join("&like=") : "";
        const dislikesUrl = preferences.dislikes ? "&dislike=" + preferences.dislikes.map(x => x.text).join("&dislike=") : "";

        const url = `https://stirfrai.fly.dev/mealplan?carbs=${macrosData.carbs}&protein=${macrosData.protein}&fat=${macrosData.fat}&calories=${macrosData.calories}${likesUrl}${dislikesUrl}`;

        const mealPlan = await axios.get(url)
            .then((resp) => {
                console.log("queried for meal plans", resp.data);
                return resp.data;
            })
            .catch((error) => console.log("received error when querying for meal plans", error));

        const id = await addDoc(collection(db, 'users', auth.currentUser.uid, 'mealplans'), {
            "timestamp": Timestamp.now(),
            "likes": preferences.likes,
            "dislikes": preferences.dislikes,
            "name": "Unnamed Meal Plan",
            "values": mealPlan.map((day) => {
                // Can't have nested arrays, so use dictionary for the individual meals
                return Object.assign({}, ...day.map((meal, index) => ({
                    [MEAL_TYPES[index]]: {
                        name: meal,
                        ingredients: [],
                        recipe: ""
                    }
                })))
            })
        }).then((data) => {
            console.log("saved mealplans data");
            setLoading(false);
            return data.id;
        });

        history.push(`/view?id=${id}`);
    }

    function Preferences() {
        // 
        return (
            <div id="preferences" style={{ height: "100vh", padding: "20%" }}>
                <Typography variant="body1" className='mealPlanPreferenceQuestions'>What preferences do you have (i.e. types of protein, spices, veggies)?</Typography>
                <ReactTags
                    tags={preferences.likes}
                    delimiters={delimiters}
                    handleDelete={handleLikesDelete}
                    handleAddition={handleLikesAddition}
                    inputFieldPosition="bottom"
                />
                <ScrollIntoView selector={"#dislikes"} style={{ padding: 15 }}>
                    <Button variant="contained">Next</Button>
                </ScrollIntoView>
            </div>
        )
    }

    function Dislikes() {
        return (
            <div id="dislikes" style={{ height: "100vh", padding: "20%" }}>
                <Typography variant="body1" className="mealPlanPreferenceQuestions">What do you not want to see in your recipes (i.e. ingredients, cooking methods)?</Typography>
                <ReactTags
                    tags={preferences.dislikes}
                    delimiters={delimiters}
                    handleDelete={handleDislikesDelete}
                    handleAddition={handleDislikesAddition}
                    inputFieldPosition="bottom"
                    autocomplete
                />
                <ScrollIntoView selector={"#generate-meal-plan"} style={{ padding: 15 }}>
                    <Button variant="contained">Next</Button>
                </ScrollIntoView>
            </div>
        )
    }

    const handleLikesAddition = (tag) => {
        setPreferences({ ...preferences, likes: [...preferences.likes, tag] });
    };

    const handleDislikesAddition = (tag) => {
        setPreferences({ ...preferences, dislikes: [...preferences.dislikes, tag] });
    }

    const handleLikesDelete = (i) => {
        setPreferences({ ...preferences, likes: preferences.likes.filter((tag, index) => index !== i) });
    };

    const handleDislikesDelete = (i) => {
        setPreferences({ ...preferences, dislikes: preferences.dislikes.filter((tag, index) => index !== i) });
    };

    // Could consider doing a wizard experience (i.e. Typeform-esque)
    return (
        <div className="App">
            <div className="container">
                <p>Create a new meal plan</p>
                <Preferences />
                <Dislikes />
                <Dislikes />


                <div id="generate-meal-plan" style={{ height: "100vh", padding: "20%" }}>
                    <LoadingButton loading={loading} variant="contained" style={{ margin: 30 }} onClick={generateMealPlan}>Generate meal plan</LoadingButton>
                </div>
            </div>
        </div>
    )
}

export default Create