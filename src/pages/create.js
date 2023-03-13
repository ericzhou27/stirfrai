import React, { useState } from 'react';
import '../App.css';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import { doc, addDoc, collection, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../constants/firebaseConfig"
import axios from 'axios';
import { WithContext as ReactTags } from 'react-tag-input';
import { useHistory } from "react-router-dom";
import Slider from '@mui/material/Slider';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

import '../styles/react_tags.css'

function Create() {
    const [loading, setLoading] = useState(false);
    const history = useHistory()

    const [preferences, setPreferences] = useState({
        likes: [],
        dislikes: [],
        time: 30,
        cookingAbility: "beginner"
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

        // Discretize cooking ability to values 1-5
        var stars = "";
        if (preferences.cookingAbility) {
            stars = "&stars=";
            switch (preferences.cookingAbility) {
                case "beginner":
                    stars += "1";
                    break;

                case "experienced":
                    stars += "3";
                    break;

                default:
                    stars += "5";
                    break;
            }
        }

        const minutes = preferences.time ? `&minutes=${preferences.time}` : "";

        const url = `https://stirfrai.fly.dev/mealplan?carbs=${macrosData.carbs}&protein=${macrosData.protein}&fat=${macrosData.fat}&calories=${macrosData.calories}${likesUrl}${dislikesUrl}${minutes}${stars}`;

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
                <Typography variant='h3' style={{ fontFamily: 'Playfair Display' }}>Create a new meal plan</Typography>
                <Typography variant="body1" className='mealPlanPreferenceQuestions'>What preferences do you have (i.e. types of protein, spices, veggies)?</Typography>
                <ReactTags
                    tags={preferences.likes}
                    delimiters={delimiters}
                    handleDelete={handleLikesDelete}
                    handleAddition={handleLikesAddition}
                    inputFieldPosition="top"
                    autocomplete
                    allowDragDrop={false}
                />
                <Typography variant="body1" style={{ textAlign: 'center' }} className="mealPlanPreferenceQuestions">What do you not want to see in your recipes (i.e. ingredients, cooking methods)? If you are vegetarian or vegan, include "meat" or "animal products" as tags, respectively.</Typography>
                <ReactTags
                    tags={preferences.dislikes}
                    delimiters={delimiters}
                    handleDelete={handleDislikesDelete}
                    handleAddition={handleDislikesAddition}
                    inputFieldPosition="top"
                    autocomplete
                    allowDragDrop={false}
                />
                <Typography variant="body1" className="mealPlanPreferenceQuestions">How much time can you spend cooking (in minutes)?</Typography>
                <Slider
                    size="small"
                    defaultValue={30}
                    min={5}
                    max={90}
                    step={5}
                    style={{ width: "50%", marginTop: 15 }}
                    aria-label="Small"
                    valueLabelDisplay="auto"
                    onChange={(e) => setPreferences({ ...preferences, time: e.target.value })}
                    marks={[{value: 5, label: '5 minutes'}, {value: 90, label: '90 minutes'}]}
                />
                <Typography variant="body1" className="mealPlanPreferenceQuestions">How would you describe your cooking abilities?</Typography>
                <FormControl onChange={(e) => setPreferences({ ...preferences, cookingAbility: e.target.value })}>
                    <RadioGroup
                        row
                        name="row-radio-buttons-group"
                    >
                        <FormControlLabel value="beginner" control={<Radio />} label="Beginner" />
                        <FormControlLabel value="experienced" control={<Radio />} label="Experienced" />
                        <FormControlLabel value="expert" control={<Radio />} label="Expert" />
                    </RadioGroup>
                </FormControl>

                <LoadingButton loading={loading} variant="contained" style={{ margin: 30 }} onClick={generateMealPlan}>Generate meal plan</LoadingButton>
            </div>
        </div>
    )
}

export default Create