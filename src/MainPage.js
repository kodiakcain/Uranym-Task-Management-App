import React, { useState, useEffect, useCallback } from 'react';
import { googleLogout } from '@react-oauth/google';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import { PieChart } from '@mui/x-charts/PieChart';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function MainPage({ user, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputData, setInputData] = useState('');
  const [userDocumentId, setUserDocumentId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [taskStates, setTaskStates] = useState({});
  const [count, setCount] = useState(0);

  const handleCheckBox = async (taskId) => {
    try {
      const taskRef = doc(db, 'users', userDocumentId, 'data', taskId);
  
      // Use the state updater function to get the most recent state
      setTaskStates((prevStates) => {
        // Get the previous state for the current task
        const prevTaskState = prevStates[taskId];
  
        // Update the Firestore document with the new state
        updateDoc(taskRef, {
          isChecked: !prevTaskState,
        });
  
        // Increment or decrement the count based on the state change
        if (!prevTaskState) {
          setCount((prevCount) => prevCount + 1);
        } else {
          setCount((prevCount) => prevCount - 1);
        }
  
        // Return the updated state
        return {
          ...prevStates,
          [taskId]: !prevTaskState,
        };
      });
  
      console.log('Checkbox state updated successfully');
      await new Promise((resolve) => setTimeout(resolve, 0)); // Await the state update
      readUserData();
    } catch (error) {
      console.error('Error updating checkbox state: ', error);
      setAlertSeverity('error');
      setAlertMessage('Error updating checkbox state. Please try again.');
      setShowAlert(true);
    }
  };

  // Fetch initial data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users', userDocumentId, 'data'));
        const initialStates = {};

        // Map the initial states based on the data from Firestore
        querySnapshot.forEach((doc) => {
          initialStates[doc.id] = doc.data().isChecked || false;
        });

        setTaskStates(initialStates);
      } catch (error) {
        console.error('Error fetching initial checkbox states: ', error);
      }
    };

    if (userDocumentId) {
      fetchData();
    }
  }, [userDocumentId]);


  const readUserData = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users', userDocumentId, 'data'));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        inputData: doc.data().inputData,
        selectedDate: doc.data().selectedDate,
        isChecked: doc.data().isChecked,
      }));

        // Calculate the count of checked checkboxes
      const checkedCount = data.filter((item) => item.isChecked).length;

      // Update the checked count state variable
      setCount(checkedCount);
      setDocuments(data);
    } catch (error) {
      console.error('Error reading user data from Firestore: ', error);
    }
  }, [userDocumentId, setDocuments]);

  const handleDelete = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'users', userDocumentId, 'data', taskId));
      console.log('Document deleted successfully');
      readUserData();
    } catch (error) {
      console.error('Error deleting document: ', error);
      setAlertSeverity('error');
      setAlertMessage('Error deleting document. Please try again.');
      setShowAlert(true);
    }
  };

  const handleSubmit = async () => {
    try {
      if (userDocumentId) {
        // Validate inputData length
        if (inputData.length === 0) {
          setAlertSeverity('error');
          setAlertMessage('Task too short. Task must be more than 0 characters.');
          setShowAlert(true);
          return;
        } else if (inputData.length > 100) {
          setAlertSeverity('error');
          setAlertMessage('Task too long. Task must be under 100 characters.');
          setShowAlert(true);
          return;
        } else if (selectedDate === "") {
          setAlertSeverity('error');
          setAlertMessage('Must choose task due date.');
          setShowAlert(true);
          return;
        }
  
        // Check the current number of tasks for the user
        const querySnapshot = await getDocs(collection(db, 'users', userDocumentId, 'data'));
        const currentTaskCount = querySnapshot.size;
  
        if (currentTaskCount >= 11) {
          // Trigger alert if the user has reached the maximum limit of 10 tasks.
          setAlertSeverity('error');
          setAlertMessage('You have reached the maximum limit of 10 tasks.');
          setShowAlert(true);
        } else {
          // If the user has not reached the limit, add the new task
          const docRef = await addDoc(collection(db, 'users', userDocumentId, 'data'), {
            inputData,
            selectedDate,
            timestamp: new Date(),
            isChecked : false,
          });
  
          console.log('Document written with ID: ', docRef.id);
          setInputData('');
          setSelectedDate('');
          readUserData();
        }
      } else {
        console.error('User document ID is undefined or null.');
      }
    } catch (error) {
      console.error('Error adding document: ', error);
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
    <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column', }}>
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
        <CircularProgress color="inherit" />
      ) : (
        <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column', width: '100%' }}>
          <br />
          <br />
          
          <ul style={{ width: '100%', listStyleType: 'none', padding: 0 }}>
            {documents.map((doc) => (
              <li key={doc.id} style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <Paper elevation={12} style={{ padding: '10px', textAlign: 'center', width: '50%', flexDirection: 'column' }}>
                  <p>{`${doc.inputData}`}</p>
                  <p>Date: {doc.selectedDate}</p>
                  <div>
                  <input type="checkbox"
                id={`myCheckbox_${doc.id}`}
                name={`myCheckbox_${doc.id}`}
                checked={taskStates[doc.id] || false}
                onChange={() => handleCheckBox(doc.id)} ></input>
                  </div>
                  <Button
                    variant="contained"
                    style={{ backgroundColor: '#FF6666', color: 'white', marginTop: '10px', width: '4%', fontSize: '10px' }}
                    onClick={() => handleDelete(doc.id)}
                  >
                    Delete
                  </Button>
                </Paper>
              </li>
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
            rows={4}
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            variant="outlined"
            style={{ width: '50%', display: 'flex', flexDirection: 'column' }}
          />
          <div style={{ paddingTop: '30px', flexDirection: 'column', display: 'flex', justifyContent: 'center' }}>
            <div style={{ paddingBottom: '10px' }}>
              <p style={{paddingLeft: '10%', textDecorationLine: 'underline'}}>Task Due Date</p>
              <div>
              <input
                type="date"
                id="datepicker"
                name="datepicker"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              </div>
            </div>
            <br></br>
            <br></br>
            <Button
              variant="contained"
              style={{ backgroundColor: '#AFB3F7', color: 'black' }}
              onClick={handleSubmit}
            >
              Add Task
            </Button>
            <div style={{position: 'fixed',
              bottom: 0,
              right: 0,
              marginRight: '10px',
              marginBottom: '10px',
            }}>
            <PieChart
      series={[
        {
          data: [
            { id: 0, value: count, label: `Completed: ${count}`, color: 'green' },
            { id: 1, value: documents.length - count, label: `Incomplete: ${documents.length - count}`, color: 'red' },
            
          ],
        },
      ]}
      width={400}
      height={200}
      className='piechart'
      
    />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;