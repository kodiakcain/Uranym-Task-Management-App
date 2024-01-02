import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import './App.css';

import Alert from '@mui/material/Alert';

function Login({ onLogin }) {
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => onLogin(codeResponse),
    onError: (error) => console.log('Login Failed:', error),
  });

  return (
    <div style={{height: '100vh', backgroundColor: '#f4f6f6', alignItems: 'center', justifyContent: 'center'}}>
      <AppBar position="static" sx={{ backgroundColor: '#171A21', width: '100%' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, paddingLeft: '47%' }}>
            Uranym
          </Typography>
          <Button
            variant="contained"
            style={{ backgroundColor: '#AFB3F7', color: 'black' }}
            onClick={() => login()}
          >
            Sign in/Sign up
          </Button>
        </Toolbar>
      </AppBar>
      <Alert severity="warning" sx={{textAlign: 'center', justifyContent: 'center', alignItems: 'center'}}>
          DO NOT ENTER ANY PERSONAL INFORMATION, DATA NOT SECURED. SIGN UP IS SECURE.
        </Alert>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '5%', textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{fontSize: '50px', textDecoration: 'underline'}}>Uranym Task Management Application</h1>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', width: '50%' }}>
        <div style={{width: '50%'}}>
          <h6 style={{textDecoration: 'underline',  fontSize: '30px'}}>Why Use Uranym?</h6>
          <p>We are THE best task management app out there. Not only can you add, delete, and check tasks off, 
            there are charts that show you how close you are to completing all of your tasks.
          </p>
        </div>
        <div style={{width: '50%', padding: '10px'}}>
        <h6 style={{textDecoration: 'underline',  fontSize: '30px'}}>Disclaimer!!</h6>
          <p>This is a personal project Full-Stack Web Application. Due to project structuring and learning
            as i go, the data is not fully secured in the database. Do not enter any personal or private information.
            Signing up is okay and secure, just do not enter and private information in tasks.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Login;