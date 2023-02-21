import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from "firebase/app";

const app = initializeApp({
    apiKey: "AIzaSyBKZoVId7Jqbny0frdhEI6hVEyPX_GWvu4",
    authDomain: "stirfrai-2d1d2.firebaseapp.com",
    projectId: "stirfrai-2d1d2",
    storageBucket: "stirfrai-2d1d2.appspot.com",
    messagingSenderId: "393505458106",
    appId: "1:393505458106:web:999317d41937929e9abf83",
    measurementId: "G-8YYF0391R3"
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
