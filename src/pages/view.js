import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../constants/firebaseConfig"
import { useLocation } from "react-router-dom";
import { Pinwheel } from '@uiball/loaders'

import '../App.css';

function useQuery() {
    const { search } = useLocation();
    return React.useMemo(() => new URLSearchParams(search), [search]);
}

function MealPlan(mealPlan) {
    return <p style={{ color: 'black' }}>Meal Plan</p>
}

function View() {
    const [validId, setValidId] = useState(false)
    const [mealPlan, setMealPlan] = useState({})
    const [loading, setLoading] = useState(true);
    const query = useQuery();

    useEffect(() => {
        async function fetchMealPlan() {
            auth.onAuthStateChanged(async (authUser) => {
                const id = query.get("id")
                const docRef = doc(db, 'users', authUser.uid, 'mealplans', id)
                const mealPlanDoc = await getDoc(docRef);

                if (mealPlanDoc.exists()) {
                    setMealPlan({ id: mealPlanDoc.id, ...mealPlanDoc.data() });
                    setValidId(true)
                    setLoading(false)

                    console.log({ id: mealPlanDoc.id, ...mealPlanDoc.data() })
                } else {
                    setValidId(false)
                    setLoading(false)
                }
            });
        }

        fetchMealPlan()
    }, [])


    return loading ?
        (<div className="loadingContainer">
            <Pinwheel size={35} color="#231F20" />
        </div>)
        : validId ?
            (
                <div className="container">
                    <MealPlan mealPlan={mealPlan} />
                </div>
            ) :
            (
                <div className="loadingContainer">
                    <p style={{ color: 'black' }}>Meal Plan Doesn't Exist</p>
                </div>
            )
}

export default View