import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Profile from './components/Profile';
import Blackjack from './components/Blackjack';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <h1>Blackjack</h1>
        {user && (
          <nav>
            <Link to="/profile" style={{ marginRight: '1rem' }}>Profilo</Link>
            <Link to="/blackjack" style={{ marginRight: '1rem' }}>Blackjack</Link>
            <button onClick={() => setUser(null)}>Logout</button>
          </nav>
        )}
      </header>
      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/profile" /> : <Login setUser={setUser} />} />
          <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
          <Route path="/blackjack" element={user ? <Blackjack user={user} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
