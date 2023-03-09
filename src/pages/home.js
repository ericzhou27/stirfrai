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

    return loading ?
        (<div className="loadingContainer">
            <Pinwheel size={35} color="#231F20" />
        </div>)
        : (
            <div className="container" style={{marginBottom: 25}}>
                {mealPlans.map((mealPlan) => {
                    return (
                        <div
                            key={mealPlan.id}
                            onClick={() => {
                                history.push(`/view?id=${mealPlan.id}`)
                            }}
                            className="mealPlanContainer">
                            <p className="mealPlanName">{mealPlan.name ? mealPlan.name : "Unnamed Mealplan"}</p>
                        </div>
                    )
                })}
                <div className="createButton" onClick={() => {
                    history.push(`/create`)
                }}><p style={{
                    fontSize: "2em",
                    margin: 0, color: 'black', fontFamily: 'Playfair Display', fontWeight: 400
                }}>+</p></div>
            </div >
        )
}

export default Home