import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../constants/firebaseConfig"
import '../App.css';

function View() {
    const [mealPlan, setMealPlan] = useState({})

    useEffect(() => {
        async function fetchData() {
            auth.onAuthStateChanged(async (authUser) => {
                const email = authUser.email
                const mealPlanDoc = await getDoc(doc(db, 'users', authUser.email, 'mealplans', 'values'));

                // Get user email from authdoc
                // Get mealplan ID from query params
                // save mealplan data to state

            });
        }

        fetchData()
    }, []);


    return (
        <div className="App">
            <div className="container">
                <p>View</p>
            </div>
        </div>
    )
}

export default View