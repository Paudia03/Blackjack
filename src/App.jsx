// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar    from "./components/Navbar";
import Login     from "./components/Login";
import Signup    from "./components/Signup";
import Profile   from "./components/Profile";
import Home      from "./components/Home";
import Blackjack from "./components/Blackjack";

function AppRoutes({ user, setUser, canOpenDrawer, setCanOpenDrawer }) {
  const location = useLocation();

  // Se siamo su /login o /signup non mostriamo Navbar
  const hideNav = ["/login", "/signup"].includes(location.pathname);

  return (
    <>
      {!hideNav && user && (
        <Navbar
          user={user}
          onLogout={() => {
            setUser(null);
            setCanOpenDrawer(true); // riabilitiamo la navbar
          }}
          canOpenDrawer={canOpenDrawer}
        />
      )}
      <div className={user ? "pt-16" : ""}>
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup onRegistered={setUser} onCancel={() => navigate("/login")} />} />

          <Route
            path="/"
            element={user ? <Home /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/profile"
            element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/blackjack"
            element={
              user ? (
                <Blackjack
                  onGameOver={isOver => setCanOpenDrawer(isOver)}
                  onExit={() => setCanOpenDrawer(true)} // al click “Esci” riabilita
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  // Inizialmente la navbar è abilitata (schermata di puntata / home)
  const [canOpenDrawer, setCanOpenDrawer] = useState(true);

  return (
    <BrowserRouter>
      <AppRoutes
        user={user}
        setUser={setUser}
        canOpenDrawer={canOpenDrawer}
        setCanOpenDrawer={setCanOpenDrawer}
      />
    </BrowserRouter>
  );
}
