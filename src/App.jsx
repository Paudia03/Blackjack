// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import Home from "./components/Home";
import Blackjack from "./components/Blackjack";

function AppRoutes({ user, setUser, canOpenDrawer, setCanOpenDrawer }) {
  const location = useLocation();
  const hideNav = ["/login", "/signup"].includes(location.pathname);

  return (
    <>
      {!hideNav && user && (
        <Navbar
          user={user}
          onLogout={() => {
            // logout backend session
            axios.post("/api/blackjack/logout", {}, { withCredentials: true })
              .then(() => setUser(null));
            setCanOpenDrawer(true);
          }}
          canOpenDrawer={canOpenDrawer}
        />
      )}
      <div className={user ? "pt-16" : ""}>
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route
            path="/signup"
            element={<Signup onRegistered={setUser} onCancel={() => navigate("/login")} />}
          />

          <Route
            path="/"
            element={
              user ? <Home /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/profile"
            element={
              user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/blackjack"
            element={
              user ? (
                <Blackjack
                  onGameOver={(isOver) => setCanOpenDrawer(isOver)}
                  onExit={() => setCanOpenDrawer(true)}
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
  const [canOpenDrawer, setCanOpenDrawer] = useState(true);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
  axios
    .get("/api/blackjack/me", {
      withCredentials: true,
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
      params: { t: Date.now() }, // evita cache aggiungendo timestamp
    })
    .then((res) => {
      if (res.data.success) {
        setUser(res.data.user);
      }
    })
    .catch(() => {
      setUser(null);
    })
    .finally(() => setLoadingSession(false));
}, []);


  if (loadingSession) {
    return null; // oppure uno spinner
  }

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
