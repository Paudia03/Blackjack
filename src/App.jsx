import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ResetPassword from "./components/ResetPassword";  // Added reset password import
import Profile from "./components/Profile";
import Home from "./components/Home";
import Blackjack from "./components/Blackjack";
import ChangePassword from "./components/ChangePassword";


function AppRoutes({ user, setUser, canOpenDrawer, setCanOpenDrawer }) {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNav = ["/login", "/signup", "/password-reset"].includes(location.pathname);

  return (
    <>
      {!hideNav && user && (
        <Navbar
          user={user}
          setUser={setUser}
          onLogout={() => {
            axios
              .post("/api/blackjack/logout", {}, { withCredentials: true })
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
          {/* New reset password route */}
          <Route
            path="/password-reset"
            element={
              <ResetPassword onCancel={() => navigate("/login")} />
            }
          />
          <Route
            path="/"
            element={user ? <Home /> : <Navigate to="/login" replace />}
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
           <Route path="/change-password" element={user ? <ChangePassword userEmail={user.email} /> : <Navigate to="/login" replace />}/>
        </Routes>
       
      </div>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [canOpenDrawer, setCanOpenDrawer] = useState(true);
  const [loadingSession, setLoadingSession] = useState(true);

  // 1) Carica sessione all'avvio
  useEffect(() => {
    axios
      .get("/api/blackjack/me", {
        withCredentials: true,
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
        params: { t: Date.now() },
      })
      .then((res) => {
        if (res.data.success) setUser(res.data.user);
      })
      .catch(() => setUser(null))
      .finally(() => setLoadingSession(false));
  }, []);

  // 2) Logout solo alla chiusura vera della finestra (non su refresh)
  useEffect(() => {
    const handleUnload = () => {
      const navEntries = performance.getEntriesByType("navigation");
      const navType = navEntries.length > 0 ? navEntries[0].type : null;
      if (navType !== "reload") {
        navigator.sendBeacon(
          "/api/blackjack/logout",
          new Blob([], { type: "application/json" })
        );
      }
    };
    window.addEventListener("unload", handleUnload);
    return () => window.removeEventListener("unload", handleUnload);
  }, []);

  // 3) Registrazione del Service Worker per Background Sync
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered with scope:", reg.scope))
        .catch((err) => console.error("SW registration failed:", err));
    }
  }, []);

  // Early return dopo tutti gli hook
  if (loadingSession) return null;

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
