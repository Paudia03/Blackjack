// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Navbar({ user, setUser, onLogout, canOpenDrawer }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Do not show navbar on login/signup

const hidePaths = ["/login", "/signup"];
if (hidePaths.includes(location.pathname)) return null;

  // Refresh user balance
  const refreshBalance = async () => {
    try {
      const { data } = await axios.get("/api/blackjack/me", { withCredentials: true });
      if (data.success) {
        setUser(data.user);
      } else {
        onLogout();
        navigate("/login", { replace: true });
      }
    } catch {
      onLogout();
      navigate("/login", { replace: true });
    }
  };

  // disable Home link when game in progress
  const homeDisabled = !canOpenDrawer;
  const homeClass = homeDisabled
    ? "text-gray-500 cursor-not-allowed text-2xl font-extrabold font-sans"
    : "text-white hover:text-blue-400 text-2xl font-extrabold font-sans";

  // disable profile in dropdown when game in progress
  const profileDisabled = !canOpenDrawer;
  const profileClass = profileDisabled
    ? "block px-4 py-2 text-gray-500 cursor-not-allowed"
    : "block px-4 py-2 text-gray-700 hover:bg-gray-100";

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Home */}
          {homeDisabled ? (
            <span className={homeClass}>Home</span>
          ) : (
            <Link to="/" className={homeClass}>Home</Link>
          )}

          {/* Balance */}
          <div className="hidden md:flex md:items-center">
            <span className="text-lg font-medium text-gray-200">
              Saldo: <strong className="text-white">€{user.balance}</strong>
            </span>
            <button
              onClick={refreshBalance}
              className="ml-2 p-1 hover:bg-gray-700 rounded"
              title="Aggiorna saldo"
            >
              🔄
            </button>
          </div>

          {/* User Dropdown */}
          <div className="ml-4 relative">
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center text-white focus:outline-none"
            >
              <img
                src="https://images.emojiterra.com/google/noto-emoji/unicode-16.0/color/1024px/1f464.png"
                alt="User"
                className="w-8 h-8 rounded-full mr-2"
              />
              <span className="font-medium font-sans">{user.username}</span>
            </button>

            {open && (
              <div
                className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                onMouseLeave={() => setOpen(false)}
              >
                <div className="py-1">
                  {canOpenDrawer && (
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setOpen(false)}
                    >
                      Profilo
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setOpen(false);
                      onLogout();
                      navigate('/login', { replace: true });
                    }}
                    className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
