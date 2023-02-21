import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./constants/firebaseConfig"
import Landing from "./pages/landing"
import Home from "./pages/home"
import Create from "./pages/create"
import './App.css';

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
            <Route path="/create">
              <Create />
            </Route>
            <Route path="/home">
              <Home />
            </Route>
            <Route path="/">
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
              <Landing />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }

}

export default App;
