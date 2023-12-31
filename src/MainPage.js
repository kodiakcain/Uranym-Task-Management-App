import React, { useState, useEffect, useCallback } from 'react';
import { googleLogout } from '@react-oauth/google';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert'; // Add this import
import './App.css';
import TextField from '@mui/material/TextField';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

function MainPage({ user, onLogout }) {
  const [profile, setProfile] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputData, setInputData] = useState('');
  const [userDocumentId, setUserDocumentId] = useState('');
  const [documents, setDocuments] = useState([]);
  
  // New state for alert
  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('success'); // success, error, warning, info
  const [alertMessage, setAlertMessage] = useState('');

  const readUserData = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users', userDocumentId, 'data'));
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, inputData: doc.data().inputData });
      });
      setDocuments(data);
    } catch (error) {
      console.error('Error reading user data from Firestore: ', error);
    }
  }, [userDocumentId, setDocuments]);

  const handleSubmit = async () => {
    try {
      if (userDocumentId) {
        // Check the current number of tasks for the user
        const querySnapshot = await getDocs(collection(db, 'users', userDocumentId, 'data'));
        const currentTaskCount = querySnapshot.size;

        if (currentTaskCount >= 11) {
          // Trigger alert if the user has reached the maximum limit of 10 tasks.
          setAlertSeverity('error');
          setAlertMessage('You have reached the maximum limit of 10 tasks.');
          setShowAlert(true);
        } else if (inputData.length > 100) {
          setAlertSeverity('error');
          setAlertMessage('Task Too long. Task must be under 100 characters.');
          setShowAlert(true); 
        } else {
          // If the user has not reached the limit, add the new task
          const docRef = await addDoc(collection(db, 'users', userDocumentId, 'data'), {
            inputData,
            timestamp: new Date(),
          });

          console.log('Document written with ID: ', docRef.id);
          setInputData('');
          readUserData();
        }
      } else {
        console.error('User document ID is undefined or null.');
      }
    } catch (error) {
      console.error('Error adding document: ', error);
      // You can also trigger an error alert here if needed
      setAlertSeverity('error');
      setAlertMessage('Error adding document. Please try again.');
      setShowAlert(true);
    }
  };

  const logOut = () => {
    googleLogout();
    setProfile(null);
    setUserDocumentId('');
    setDocuments([]);
    onLogout();
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: 'application/json',
          },
        })
        .then((res) => {
          console.log('Google UserInfo Response:', res.data);
          setProfile(res.data);
          setLoading(false);
          setUserDocumentId(res.data.id || '');
        })
        .catch((err) => {
          console.error('Error fetching user info:', err);
          setLoading(false);
        });
    }
  }, [user]);

  useEffect(() => {
    if (userDocumentId) {
      readUserData();
    }
  }, [userDocumentId, readUserData]);

  return (
    <div style={{justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column',}}>
      <AppBar position="static" sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#171A21', width: '100%' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ paddingLeft: '30px' }}>
              Dashboard
            </Typography>
          </div>
          {profile && <img src={profile.picture} alt="user profile" style={{ width: '50px', height: '50px', borderRadius: '30px' }} />}
          <div style={{ paddingRight: '30px' }}>
            <Button
              variant="contained"
              style={{ backgroundColor: '#AFB3F7', color: 'black' }}
              onClick={() => logOut()}
            >
              Sign Out
            </Button>
          </div>
        </Toolbar>
      </AppBar>
      
      {showAlert && (
        <Alert severity={alertSeverity} onClose={() => setShowAlert(false)}>
          {alertMessage}
        </Alert>
      )}
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{justifyContent: 'center', alignItems: 'center'}}>
          <br />
          <br />
          <ul>
            {documents.map((doc) => (
              <p key={doc.id}>{`${doc.inputData}`}</p>
            ))}
          </ul>
          <br />
          <br />
          <br />
          <br />
          <TextField
        id="outlined-multiline-static"
        label="Enter Task"
        multiline
        rows={4} // Set the number of rows to determine the initial height
        value={inputData}
        onChange={(e) => setInputData(e.target.value)}
        variant="outlined"
        style={{width: '500px'}}
      />
      <div style={{paddingLeft: '225px', paddingTop: '30px'}}>
      <button onClick={handleSubmit}>Add Task</button>
      </div>
        </div>
        
      )}
    </div>
  );
}

export default MainPage;