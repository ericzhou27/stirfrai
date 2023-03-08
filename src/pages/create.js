import React, { useState } from 'react';
import '../App.css';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import { doc, addDoc, collection, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../constants/firebaseConfig"
import axios from 'axios';
import { WithContext as ReactTags } from 'react-tag-input';
import { useHistory } from "react-router-dom";

import '../styles/react_tags.css'

function Create() {
    const [loading, setLoading] = useState(false);
    const history = useHistory()

    const [preferences, setPreferences] = useState({
        likes: [],
        dislikes: [],
    });

    const KeyCodes = {
        comma: 188,
        enter: 13
    };
    const delimiters = [KeyCodes.comma, KeyCodes.enter];
    const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER'];

    // Keeping this for reference

    // const generateRecipe = async (meal, ingredients) => {
    //     const url = `https://stirfrai.fly.dev/recipe?dish=${meal}&ingredient=${ingredients}`;

    //     const resp = await axios.get(url)
    //         .then((resp) => {
    //             console.log("queried for recipe", resp.data);
    //             return resp.data;
    //         })
    //         .catch((error) => console.log("received error when generating recipe", error));

    //     console.log("recipe", resp);
    //     return resp;
    // }

    // const generateIngredients = async (meal, carbs, protein, fat, calories, cost) => {
    //     const url = `https://stirfrai.fly.dev/ingredients?dish=${meal}&carbs=${carbs}&protein=${protein}&fat=${fat}&calories=${calories}&cost=${cost}`;

    //     const resp = await axios.get(url)
    //         .then((resp) => {
    //             console.log("queried for ingredients", resp.data);
    //             return resp.data;
    //         })
    //         .catch((error) => console.log("received error when generating ingredients", error));

    //     console.log("ingredients", resp);
    //     return resp;
    // }

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
                <Typography variant="body1" className='mealPlanPreferenceQuestions'>What preferences do you have (i.e. types of protein, spices, veggies)?</Typography>
                <ReactTags
                    tags={preferences.likes}
                    delimiters={delimiters}
                    handleDelete={handleLikesDelete}
                    handleAddition={handleLikesAddition}
                    inputFieldPosition="bottom"
                    autocomplete
                />
                <Typography variant="body1" className="mealPlanPreferenceQuestions">What do you not want to see in your recipes (i.e. ingredients, cooking methods)?</Typography>
                <ReactTags
                    tags={preferences.dislikes}
                    delimiters={delimiters}
                    handleDelete={handleDislikesDelete}
                    handleAddition={handleDislikesAddition}
                    inputFieldPosition="bottom"
                    autocomplete
                />
                <LoadingButton loading={loading} variant="contained" style={{ margin: 30 }} onClick={generateMealPlan}>Generate meal plan</LoadingButton>
            </div>
        </div>
    )
}

export default Create