// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar    from "./components/Navbar";
import Home      from "./components/Home";
import Login     from "./components/Login";
import Signup    from "./components/Signup";
import Profile   from "./components/Profile";
import Blackjack from "./components/Blackjack";

export default function App() {
  // Stato per l'utente autenticato
  const [user, setUser] = useState(null);
  // Stato per abilitare/disabilitare il drawer in Navbar
  const [canOpenDrawer, setCanOpenDrawer] = useState(false);

  // Funzione di logout: resetta lo user e chiude il drawer
  const handleLogout = () => {
    setUser(null);
    setCanOpenDrawer(false);
  };

  return (
    <BrowserRouter>
      {/* Navbar fissa in alto, visibile solo se user è loggato */}
      {user && (
        <Navbar
          user={user}
          onLogout={handleLogout}
          canOpenDrawer={canOpenDrawer}
        />
      )}

      {/* Padding-top per non coprire il contenuto sotto la Navbar */}
      <div className="pt-16">
        <Routes>
          {/* Login */}
          <Route
            path="/login"
            element={<Login setUser={setUser} />}
          />

          {/* Signup */}
          <Route
            path="/signup"
            element={
              <Signup
                onRegistered={newUser => {
                  setUser(newUser);
                }}
                onCancel={() => {
                  // rimanda a login se annulli la registrazione
                  window.location.href = "/login";
                }}
              />
            }
          />

          {/* Home: scelta giochi */}
          <Route
            path="/"
            element={
              user
                ? <Home />
                : <Navigate to="/login" replace />
            }
          />

          {/* Profilo */}
          <Route
            path="/profile"
            element={
              user
                ? <Profile user={user} />
                : <Navigate to="/login" replace />
            }
          />

          {/* Tavolo Blackjack */}
          <Route
            path="/blackjack"
            element={
              user
                ? (
                  <Blackjack
                    onGameOver={isOver => setCanOpenDrawer(isOver)}
                  />
                )
                : <Navigate to="/login" replace />
            }
          />

          {/* Qualunque altro percorso reindirizza */}
          <Route
            path="*"
            element={<Navigate to={user ? "/" : "/login"} replace />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
