import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Profile from './components/Profile';
import Blackjack from './components/Blackjack';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blackjack</h1>
        {user && (
          <nav>
            <Link className="mr-4 hover:underline" to="/profile">Profilo</Link>
            <Link className="mr-4 hover:underline" to="/blackjack">Tavolo</Link>
            <button onClick={() => setUser(null)} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition">
              Logout
            </button>
          </nav>
        )}
      </header>
      <main>
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
