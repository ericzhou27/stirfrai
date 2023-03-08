import React, { useEffect, useState } from 'react';
import { auth, db } from "../constants/firebaseConfig"
import { Pinwheel } from '@uiball/loaders'
import { useHistory } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import '../App.css';

function Home() {
    const [mealPlans, setMealPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const history = useHistory()

    useEffect(() => {
        async function fetchMealPlans() {
            auth.onAuthStateChanged(async (authUser) => {
                const mealPlanCollection = collection(db, 'users', authUser.uid, 'mealplans')
                const querySnapshot = await getDocs(mealPlanCollection);
                let mealPlansTemp = []
                querySnapshot.forEach((doc) => {
                    mealPlansTemp.push({ id: doc.id, ...doc.data() })
                });
                console.log(mealPlansTemp)
                setMealPlans(mealPlansTemp)
                setLoading(false)
            });
        }

        fetchMealPlans()
    }, [])

    console.log(mealPlans)


    return loading ?
        (<div className="loadingContainer">
            <Pinwheel size={35} color="#231F20" />
        </div>)
        : (
            <div className="container">
                {mealPlans.map((mealPlan) => {
                    return (
                        <div
                            key={mealPlan.id}
                            onClick={() => {
                                history.push(`/view?id=${mealPlan.id}`)
                            }}
                            className="mealPlanContainer">
                            {mealPlan.name || 'Unnamed Meal Plan'}
                        </div>
                    )
                })}
                <div className="button" onClick={() => {
                    history.push(`/create`)
                }}><p style={{ margin: 0 }}>Create</p></div>
            </div>
        )
}

export default Home