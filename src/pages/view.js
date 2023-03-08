import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../constants/firebaseConfig"
import { useLocation } from "react-router-dom";
import { Pinwheel } from '@uiball/loaders'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';

import { EditText, EditTextarea } from 'react-edit-text';
import 'react-edit-text/dist/index.css';

import '../App.css';

function useQuery() {
    const { search } = useLocation();
    return React.useMemo(() => new URLSearchParams(search), [search]);
}

function Meal(props) {
    const recipe = props.meal.recipe
    const ingredients = props.meal.ingredients
    const name = props.meal.name

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
            <div className='mealContainer' onClick={() => {
                props.setSelectedMeal({ meal: "BREAKFAST", index: props.index, m2: lunch.name, m3: dinner.name, ...breakfast, })
                props.handleModal(true)
            }}>
                <p className='mealTitle'>Breakfast</p>
                <div className='divider' />
                <Meal meal={breakfast} />
            </div>
            <div className='mealContainer' onClick={() => {
                props.setSelectedMeal({ meal: "LUNCH", index: props.index, m2: breakfast.name, m3: dinner.name, ...lunch })
                props.handleModal(true)
            }}>
                <p className='mealTitle'>Lunch</p>
                <div className='divider' />
                <Meal meal={lunch} />
            </div>
            <div className='mealContainer' onClick={() => {
                props.setSelectedMeal({ meal: "DINNER", index: props.index, m2: lunch.name, m3: breakfast.name, ...dinner })
                props.handleModal(true)
            }}>
                <p className='mealTitle'>Dinner</p>
                <div className='divider' />
                <Meal meal={dinner} />
            </div>
        </div>
    )
}

function MealPlan(props) {
    const days = props.mealPlan.values
    return (
        days.map((day, index) => {
            return (
                <div className='mealPlanSection'>
                    <Day day={day} index={index}
                        handleModal={props.handleModal}
                        setSelectedMeal={props.setSelectedMeal}
                    />
                </div>
            )
        })
    )
}

function View() {
    const [validId, setValidId] = useState(false)
    const [mealPlan, setMealPlan] = useState({})
    const [loading, setLoading] = useState(true);
    const [macros, setMacros] = useState({});
    const [selectedMeal, setSelectedMeal] = useState({})
    const [showModal, setShowModal] = useState(false)
    const [loadingRecipe, setLoadingRecipe] = useState(false)


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

                    console.log("MEAL PLAN - ", { id: mealPlanDoc.id, ...mealPlanDoc.data() })
                } else {
                    setValidId(false)
                    setLoading(false)
                }
            });
        }

        fetchMealPlan()
    }, [])

    useEffect(() => {
        async function fetchMacros() {
            auth.onAuthStateChanged(async (authUser) => {
                const macrosDoc = await getDoc(doc(db, 'users', authUser.uid, 'macros', 'values'));
                if (macrosDoc.exists()) {
                    setMacros(macrosDoc.data());
                }
            });
        }

        fetchMacros()
    }, [])

    async function generateRecipe(selectedMeal) {
        setLoadingRecipe(true)
        let currentMealPlan = mealPlan

        const macrosURL = encodeURI(`https://stirfrai.fly.dev/mealmacros?carbs=${macros.carbs}&protein=${macros.protein}&fat=${macros.fat}&calories=${macros.calories}&meal1=${selectedMeal.name}&meal2=${selectedMeal.m2}&meal3=${selectedMeal.m3}`);
        const genMacros = await axios.get(macrosURL)
            .then((resp) => {
                return resp.data;
            })
            .catch((error) => console.log("received error when querying for meal plans", error));
        const tMacros = genMacros[0]

        const recipeURL = encodeURI(`https://stirfrai.fly.dev/recipe?carbs=${tMacros.carbs}&protein=${tMacros.protein}&fat=${tMacros.fat}&calories=${tMacros.calories}&dish=${selectedMeal.name}`);
        const recipe = await axios.get(recipeURL)
            .then((resp) => {
                return resp.data;
            })
            .catch((error) => console.log("received error when querying for meal plans", error));

        const ingredientsURL = encodeURI(`https://stirfrai.fly.dev/ingredients?recipe=${recipe}`);
        const ingredients = await axios.get(ingredientsURL)
            .then((resp) => {
                return resp.data;
            })
            .catch((error) => console.log("received error when querying for meal plans", error));

        // update local state
        currentMealPlan.values[selectedMeal.index][selectedMeal.meal].ingredients = Object.assign({}, ingredients)
        currentMealPlan.values[selectedMeal.index][selectedMeal.meal].recipe = recipe

        // update remote state
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'mealplans', mealPlan.id), {
            ...currentMealPlan
        });

        setSelectedMeal(currentMealPlan.values[selectedMeal.index][selectedMeal.meal])
        setMealPlan(currentMealPlan)
        setLoadingRecipe(false)
    }

    async function swapRecipe(selectedMeal) {
        setLoadingRecipe(true)
        let currentMealPlan = mealPlan

        console.log('SWAPPING - ', currentMealPlan, selectedMeal)

        const likesUrl = mealPlan.likes ? "&like=" + mealPlan.likes.map(x => x.text).join("&like=") : "";
        const dislikesUrl = mealPlan.dislikes ? "&dislike=" + mealPlan.dislikes.map(x => x.text).join("&dislike=") : "";

        // localhost:8080/mealreplacement?meal=Lemon Pepper Pork with Brown Rice&dislike=chicken&dislike=tomato&dislike=peppers&like=beef&like=lemon pepper&like=pork
        const replaceURL = encodeURI(`https://stirfrai.fly.dev/mealreplacement?meal=${selectedMeal.name}${likesUrl}${dislikesUrl}`);
        const newMeal = await axios.get(replaceURL)
            .then((resp) => {
                return resp.data;
            })
            .catch((error) => console.log("received error when querying for meal plans", error));

        currentMealPlan.values[selectedMeal.index][selectedMeal.meal].name = newMeal

        // update remote state
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'mealplans', mealPlan.id), {
            ...currentMealPlan
        });

        let newSelectedMeal = selectedMeal
        newSelectedMeal.name = newMeal

        setSelectedMeal(newSelectedMeal)
        setMealPlan(currentMealPlan)
        setLoadingRecipe(false)

        console.log(newMeal)
    }

    async function updateMealPlanName(e) {
        const docRef = doc(db, 'users', auth.currentUser.uid, 'mealplans', mealPlan.id)
        await updateDoc(docRef, {
            name: e.value
        })
    }

    let recipeStrings = '';
    if (selectedMeal && selectedMeal.recipe) {
        recipeStrings = selectedMeal.recipe.split('\n').filter(v => v);
    }

    const ingredients = selectedMeal && selectedMeal.ingredients ? Object.values(selectedMeal.ingredients) : [];
    const ingredientStrings = ingredients.map(i => `${i[0]} (${i[1]})`)

    return loading ?
        (<div className="loadingContainer">
            <Pinwheel size={35} color="#231F20" />
        </div>)
        : validId ?
            (
                <div className="container" style={{marginTop: 25}}>
                    <Modal
                        size="lg"
                        centered
                        show={showModal}
                        onHide={() => {
                            setShowModal(false)
                        }}>
                        <Modal.Header closeButton>
                            <Modal.Title>{selectedMeal.name ? selectedMeal.name : "Unnamed recipe"}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {loadingRecipe ? <Pinwheel size={35} color="#231F20" />
                                :
                                selectedMeal.recipe ?
                                    (
                                        <>
                                            {recipeStrings.map(line => <div>{line}</div>)}
                                            {ingredientStrings.map(line => <div>{line}</div>)}
                                        </>
                                    )
                                    :
                                    <>
                                        <Button variant="secondary" style={{ marginRight: 10 }} onClick={() => { swapRecipe(selectedMeal) }}>
                                            Swap Recipe
                                        </Button>
                                        <Button variant="primary" onClick={() => { generateRecipe(selectedMeal) }}>
                                            Generate Recipe
                                        </Button>
                                    </>
                            }
                        </Modal.Body>
                    </Modal>

                    {/* <p className="mealPlanTitle">{mealPlan.name || 'Unnamed Meal Plan'}</p> */}
                    <EditText showEditButton className="mealPlanTitle" inputClassName='mealPlanTitle' defaultValue={mealPlan.name || 'Unnamed Meal Plan'} onSave={updateMealPlanName}/>
                    <MealPlan mealPlan={mealPlan} handleModal={setShowModal} setSelectedMeal={setSelectedMeal} />
                </div>
            ) :
            (
                <div className="loadingContainer">
                    <p style={{ color: 'black' }}>Meal Plan Doesn't Exist</p>
                </div>
            )
}

export default View