import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import './App.css';

function Login({ onLogin }) {
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => onLogin(codeResponse),
    onError: (error) => console.log('Login Failed:', error),
  });

  return (
    <div className='App'>
      <AppBar position="static" sx={{ backgroundColor: '#171A21', width: '100%' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
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
    </div>
  );
}

export default Login;