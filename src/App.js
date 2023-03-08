import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./constants/firebaseConfig"
import Landing from "./pages/landing"
import Home from "./pages/home"
import Create from "./pages/create"
import Profile from "./pages/profile"
import View from "./pages/view"

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ButtonAppBar from './components/AppBar';

function App() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [setUp, setSetUp] = useState(true);


  useEffect(() => {
    function fetchUserSetUp() {
      auth.onAuthStateChanged(async (user) => {
        if (!!user) {
          const docRef = doc(db, 'users', user.uid)
          const userDoc = await getDoc(docRef);

          setLoggedIn(!!user)
          setSetUp(userDoc.exists())
        } else {
          setLoggedIn(false)
          setSetUp(false)
        }

      });
    }

    fetchUserSetUp();
  }, [])

  if (loggedIn && setUp) {
    return (
      <Router>
        <div className='AppContainer'>
          <Switch>
            <Route path="/profile">
              <ButtonAppBar loggedIn={loggedIn} />
              <Profile />
            </Route>
            <Route path="/create">
              <ButtonAppBar loggedIn={loggedIn} />
              <Create />
            </Route>
            <Route path="/view">
              <ButtonAppBar loggedIn={loggedIn} />
              <View />
            </Route>
            <Route path="/home">
              <ButtonAppBar loggedIn={loggedIn} />
              <Home />
            </Route>
            <Route path="/">
              <ButtonAppBar loggedIn={loggedIn} />
              <Landing />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  } else if (loggedIn && !setUp) {
    return (
      <Router>
        <div className='AppContainer'>
          <Switch>
            <Route path="/">
              <ButtonAppBar loggedIn={loggedIn} />
              <Profile />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  } else {
    return (
      <Router>
        <div>
          <Switch>
            <Route path="/">
              <ButtonAppBar loggedIn={loggedIn} />
              <Landing />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }

}

export default App;
