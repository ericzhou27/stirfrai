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

function Meal(props) {
    const recipe = props.meal.recipe
    const ingredients = props.meal.ingredients
    const name = props.meal.name

    console.log(recipe, ingredients, name)

    return (
        <p className='mealContents'>{name}</p>
    )
}

function Day(props) {
    const breakfast = props.day.BREAKFAST
    const lunch = props.day.LUNCH
    const dinner = props.day.DINNER
    const dayDict = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    return (
        <div className='dayContainer'>
            <div className='dayContainerTitle'>{dayDict[props.index]}</div>
            <div className='mealContainer'>
                <p className='mealTitle'>Breakfast</p>
                <div className='divider' />
                <Meal meal={breakfast} />
            </div>
            <div className='mealContainer'>
                <p className='mealTitle'>Lunch</p>
                <div className='divider' />
                <Meal meal={lunch} />
            </div>
            <div className='mealContainer'>
                <p className='mealTitle'>Dinner</p>
                <div className='divider' />
                <Meal meal={dinner} />
            </div>
        </div>
    )
}

function MealPlan(props) {
    const days = props.mealPlan.values
    console.log("DATA - ", props.mealPlan, days)
    return (
        days.map((day, index) => {
            return (
                <div className='mealPlanSection'>
                    <Day day={day} index={index} />
                </div>
            )
        })
    )
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
                    <p className="mealPlanTitle">{mealPlan.id}</p>
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