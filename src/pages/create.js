import React, { useState } from 'react';
import '../App.css';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../constants/firebaseConfig"
import axios from 'axios';

function Create() {
    const [preferences, setPreferences] = useState({
        likes: '',
        dislikes: '',
    });

    const [mealPlan, setMealPlan] = useState([]);

    const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const generateMealPlan = async () => {
        const macros_doc = await getDoc(doc(db, 'users', auth.currentUser.email, 'macros', 'values'));
        if (macros_doc.exists()) {
            console.log("macros data", macros_doc.data());
        } else {
            console.log("no existing macros data");
        }

        const url = `https://stirfrai.fly.dev/mealplan?carbs=${macros_doc.data().carbs}&protein=${macros_doc.data().protein}&fat=${macros_doc.data().fat}&calories=${macros_doc.data().calories}`;

        const resp = await axios.get(url)
            .then((resp) => {
                console.log("queried for meal plans", resp.data);
                return resp.data;
            })
            .catch((error) => console.log("received error when querying for meal plans", error));

        setMealPlan(resp);

        await setDoc(doc(db, 'users', auth.currentUser.email, 'mealplans', 'values'),
            Object.assign({}, ...resp.map((x, index) => ({ [index]: x })))
        ).then(() => {
            console.log("saved mealplans data");
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
                    <div className="container" style={{ padding: 30 }}>
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