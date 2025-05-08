// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Blackjack from "./components/Blackjack";

export default function App() {
  const [user, setUser] = useState(null);
  // drawer disabilitato finché gameOver === false
  const [canOpenDrawer, setCanOpenDrawer] = useState(false);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      {user && (
        <Navbar 
          user={user} 
          onLogout={handleLogout}
          canOpenDrawer={canOpenDrawer}
        />
      )}

      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />

        <Route
          path="/profile"
          element={
            user 
              ? <Profile user={user} /> 
              : <Login setUser={setUser} />
          }
        />

        <Route
          path="/blackjack"
          element={
            user ? (
              <Blackjack 
                onGameOver={(isOver) => setCanOpenDrawer(isOver)} 
              />
            ) : (
              <Login setUser={setUser} />
            )
          }
        />

        <Route
          path="*"
          element={
            user 
              ? <Profile user={user} /> 
              : <Login setUser={setUser} />
          }
        />
      </Routes>
    </Router>
  );
}
