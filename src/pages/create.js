import React, { useState, useEffect } from 'react';
import '../App.css';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { addDoc, doc, setDoc, collection, getDoc } from "firebase/firestore";
import { auth, db } from "../constants/firebaseConfig"

function Create() {
    const [preferences, setPreferences] = useState({
        likes: '',
        dislikes: '',
    });

    const [mealPlan, setMealPlan] = useState([]);

    const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const generateMealPlan = async () => {
        // const url = "https://stirfrai.fly.dev/macros?height=6%27&weight=155%20lbs&goal=gain%20muscle"

        const url = "https://stirfrai.fly.dev/mealplan?carbs=30&protein=20&fat=10&calories=540&meal1=hot%20chocolate&meal2=hot%20chocolate&meal3=hot%20chocolate"

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }).then((data) => {
            console.log("successfully queried macros api");
            return data;
        })

        // const json_response = await response.json().then((value) => {
        //     return value;
        // });

        const json_response = [["Oatmeal with banana, 3 scrambled eggs, and 2 slices of bacon", "Grilled chicken breast and steamed vegetables", "Whole grain pasta with ground beef and vegetables"],
        ["Greek yogurt with fruit, peanut butter and celery sticks, and hard-boiled eggs", "Tuna sandwich on whole wheat bread and grapes", "Salmon with sweet potato and steamed broccoli"],
        ["Scrambled eggs with bell pepper and spinach, banana, and toast with avocado", "Bean quesadilla and salad", "Turkey burger and sweet potato fries"],
        ["Whole wheat pancakes with berries, cottage cheese and an orange", "Grilled shrimp and vegetable stir fry", "Salmon salad with couscous and almonds"],
        ["Strawberry yogurt smoothie and an apple", "Grilled chicken and quinoa salad", "Roast beef sandwich and steamed carrots"],
        ["Oatmeal with nuts and raisins, boiled egg, and cheese stick", "Taco salad with ground beef and avocado", "Tilapia with spinach and mushrooms"],
        ["Egg white omelette with mushrooms, banana and toast with peanut butter", "Turkey breast and roasted potatoes", "Veggie wrap with hummus and salad"]];


        setMealPlan(json_response);
        console.log('json response', json_response);

        // Unfortunately have to enumerate through all manually
        await setDoc(doc(db, 'users', auth.currentUser.email, 'mealplans', 'values'), {
            0: json_response[0],
            1: json_response[1],
            2: json_response[2],
            3: json_response[3],
            4: json_response[4],
            5: json_response[5],
            6: json_response[6],
        }).then(() => {
            console.log("saved mealplans data");
            // history.push("/home");
        })

    }


    // Could consider doing a wizard experience (i.e. Typeform-esque)
    return (
        <div className="App">
            <div className="container">
                <p>Create a new meal plan</p>
                <TextField id="outlined-basic" label="What preferences do you have (i.e. types of protein, spices, veggies)?" variant="outlined" style={{ width: 600, margin: 30 }} multiline rows={2} onChange={(val) => setPreferences({ ...preferences, likes: val.target.value })} />
                <TextField id="outlined-basic" label="What do you not want to see in your recipes (i.e. ingredients, cooking methods)?" variant="outlined" style={{ width: 600, margin: 30 }} multiline rows={2} onChange={(val) => setPreferences({ ...preferences, dislikes: val.target.value })} />
                <Button variant="contained" onClick={generateMealPlan}>Generate meal plan</Button>

                {mealPlan.length ? (
                    <div className="container" style={{padding: 30}}>
                        <Typography variant="h4">Tada! Your next delicious meal plan!</Typography>

                        <table className="table table-striped table-bordered" style={{ padding: 30 }}>
                            <thead>
                                <tr>
                                    {/* Shift headers over by one column */}
                                    <th></th>
                                    <th>Breakfast</th>
                                    <th>Lunch</th>
                                    <th>Dinner</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mealPlan && mealPlan.map((meal, index) =>

                                    <tr key={index}>
                                        <th>{DAYS_OF_WEEK[index]}</th>
                                        <td>{meal[0]}</td>
                                        <td>{meal[1]}</td>
                                        <td>{meal[2]}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : <div></div>}
            </div>


        </div>
    )
}

export default Create