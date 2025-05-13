// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar    from "./components/Navbar";
import Login     from "./components/Login";
import Signup    from "./components/Signup";
import Profile   from "./components/Profile";
import Home      from "./components/Home";
import Blackjack from "./components/Blackjack";

export default function App() {
  const [user, setUser]               = useState(null);
  const [canOpenDrawer, setCanOpenDrawer] = useState(false);

  const handleLogout = async () => {
    // Chiamata logout al backend (opzionale)
    await fetch("/api/blackjack/logout", { method: "POST" });
    setUser(null);
    setCanOpenDrawer(false);
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
          <Route path="/login" element={<Login setUser={setUser} />} />

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
                ? <Profile user={user} />
                : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/blackjack"
            element={
              user
                ? (
                  <Blackjack
                    user={user}                   // <— PASSIAMO QUI user
                    onGameOver={isOver => setCanOpenDrawer(isOver)}
                  />
                )
                : <Navigate to="/login" replace />
            }
          />

          <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
