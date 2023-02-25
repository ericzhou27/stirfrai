import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useHistory } from "react-router-dom";
import { auth, db } from "../constants/firebaseConfig"
import { useState } from 'react'

export default function ButtonAppBar() {
  const [authState, setAuthState] = useState(null);

  function login() {
    const currentUser = auth.currentUser
    const provider = new GoogleAuthProvider();
    if (!currentUser) {
      signInWithPopup(auth, provider)
        .then((result) => {
          const user = result.user;
          console.log(user)
          setAuthState(user);
          // TODO - re-route to /home
        }).catch((error) => {
          console.log("ERROR - ", error)
        });
    } else {
      alert("Already logged in.")
      console.log(currentUser)
    }
  }

  function logout() {
    auth.signOut()
      .then(function () {
        setAuthState(null);
        console.log('Signout Succesfull')
      }, function (error) {
        console.log('Signout Failed')
      });
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <a href='/home'>stirfr.ai</a>
          </Typography>
          {auth.currentUser ?
            <Button color="inherit" onClick={logout}>Logout</Button> :

            <Button color="inherit" onClick={login}>Login</Button>}
        </Toolbar>
      </AppBar>
    </Box>
  );
}