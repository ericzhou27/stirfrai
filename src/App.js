import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./constants/firebaseConfig"
import Landing from "./pages/landing"
import Home from "./pages/home"
import Create from "./pages/create"
import Profile from "./pages/profile"
import View from "./pages/view"

import './App.css';
import ButtonAppBar from './components/AppBar';

function App() {
  const [loggedIn, setLoggedIn] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user)
    });
  })

  if (loggedIn) {
    return (
      <Router>
        <div>
          <Switch>
            <Route path="/profile">
              <ButtonAppBar />
              <Profile />
            </Route>
            <Route path="/create">
              <ButtonAppBar />
              <Create />
            </Route>
            <Route path="/view">
              <ButtonAppBar />
              <View />
            </Route>
            <Route path="/home">
              <ButtonAppBar />
              <Home />
            </Route>
            <Route path="/">
              <ButtonAppBar />
              <Landing />
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
              <ButtonAppBar />
              <Landing />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }

}

export default App;
