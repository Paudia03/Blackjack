// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <div className="bg-gray-800 text-white flex items-center p-4">
        {/* Hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="mr-4 focus:outline-none"
        >
          <div className="w-6 h-0.5 bg-white mb-1"></div>
          <div className="w-6 h-0.5 bg-white mb-1"></div>
          <div className="w-6 h-0.5 bg-white"></div>
        </button>
        {/* Title / Home link */}
        <Link to="/" className="text-xl font-bold">
          Blackjack
        </Link>
        {/* Spacer */}
        <div className="flex-1" />
        {/* User info */}
        <div className="flex items-center space-x-4">
          <span>{user.name}</span>
          <span>💰 {user.balance.toFixed(2)}€</span>
          <button
            onClick={onLogout}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Overlay */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-200 z-50`}
      >
        <div className="p-4 flex justify-between items-center">
          <span className="text-lg font-bold">Menu</span>
          <button onClick={() => setDrawerOpen(false)} className="focus:outline-none">
            &times;
          </button>
        </div>
        <nav className="flex flex-col mt-4">
          <Link
            to="/"
            onClick={() => setDrawerOpen(false)}
            className="px-4 py-2 hover:bg-gray-800"
          >
            Home
          </Link>
          <Link
            to="/profile"
            onClick={() => setDrawerOpen(false)}
            className="px-4 py-2 hover:bg-gray-800"
          >
            Profilo
          </Link>
          <Link
            to="/blackjack"
            onClick={() => setDrawerOpen(false)}
            className="px-4 py-2 hover:bg-gray-800"
          >
            Tavolo
          </Link>
        </nav>
      </div>
    </>
  );
}
