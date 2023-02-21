import React from "react"
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Landing from "./pages/landing"
import Home from "./pages/home"
import Create from "./pages/create"
import './App.css';

function App() {
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
}

export default App;
