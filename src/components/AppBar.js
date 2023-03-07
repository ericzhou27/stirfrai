import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../constants/firebaseConfig"

export default function ButtonAppBar(props) {
  function login() {
    const currentUser = auth.currentUser
    const provider = new GoogleAuthProvider();
    if (!currentUser) {
      signInWithPopup(auth, provider)
        .then((result) => {
          const user = result.user;
          console.log(user)
        }).catch((error) => {
          console.log("ERROR - ", error)
        });
    } else {
      alert("Already logged in.")
    }
  }

  function logout() {
    console.log(auth.currentUser)
    auth.signOut()
      .then(function () {
        console.log('Signout Succesfull')
      }, function (error) {
        console.log('Signout Failed')
      });
  }

  return (
    <Box >
      <AppBar position="static" style={{ background: '#000' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <a href='/home'>stirfr.ai</a>
          </Typography>
          <Button ><a href="/profile">Profile</a></Button>
          {props.loggedIn ?
            <Button color="inherit" onClick={logout}>Logout</Button> :
            <Button color="inherit" onClick={login}>Login</Button>}
        </Toolbar>
      </AppBar>
    </Box>
  );
}