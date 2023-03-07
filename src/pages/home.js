import React, { useEffect, useState } from 'react';
import { auth, db } from "../constants/firebaseConfig"
import { Pinwheel } from '@uiball/loaders'
import { useHistory } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import '../App.css';

function Home() {
    const [mealPlans, setMealPlans] = useState([]);
    const [loading, setLoading] = useState(true);


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


    return loading ?
        (<div className="loadingContainer">
            <Pinwheel size={35} color="#231F20" />
        </div>)
        : (
            <div className="container">
                {mealPlans.map((mealPlan) => {
                    return (
                        <div className="mealPlanContainer">
                            <p>{mealPlan.id}</p>
                        </div>
                    )
                })}
                <div className="button"><a href="/create" >Create</a></div>
            </div>
        )
}

export default Home