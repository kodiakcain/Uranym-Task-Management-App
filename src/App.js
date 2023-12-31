import React, { useState } from 'react';
import Login from './Login';
import MainPage from './MainPage';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (codeResponse) => {
    setUser(codeResponse);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div>
      {user ? (
        <MainPage user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;