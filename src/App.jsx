// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import Navbar    from "./components/Navbar";
import Login     from "./components/Login";
import Signup    from "./components/Signup";
import Profile   from "./components/Profile";
import Home      from "./components/Home";
import Blackjack from "./components/Blackjack";

// Global config per inviare cookie di sessione
axios.defaults.withCredentials = true;

export default function App() {
  const [user, setUser]               = useState(null);
  const [canOpenDrawer, setCanOpenDrawer] = useState(false);

  // Alla prima render, controlla se esiste già una sessione valida
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/blackjack/me");
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch {
        // utente non loggato
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/api/blackjack/logout");
    } catch {
      // ignora
    } finally {
      setUser(null);
      setCanOpenDrawer(false);
    }
  };

  return (
    <BrowserRouter>
      {user && (
        <Navbar
          user={user}
          onLogout={handleLogout}
          canOpenDrawer={canOpenDrawer}
        />
      )}

      <div className="pt-16">
        <Routes>
          <Route
            path="/login"
            element={<Login setUser={setUser} />}
          />

          <Route
            path="/signup"
            element={<Signup onRegistered={setUser} onCancel={() => {}} />}
          />

          <Route
            path="/"
            element={user ? <Home /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/profile"
            element={
              user
                ? <Profile user={user} setUser={setUser} />
                : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/blackjack"
            element={
              user
                ? (
                  <Blackjack
                    user={user}
                    onGameOver={isOver => setCanOpenDrawer(isOver)}
                  />
                )
                : <Navigate to="/login" replace />
            }
          />

          <Route
            path="*"
            element={<Navigate to={user ? "/" : "/login"} replace />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
