// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Navbar({ user, onLogout, canOpenDrawer }) {
  // Assicuriamoci che balance sia un numero
  const balanceNum =
    typeof user.balance === "string"
      ? parseFloat(user.balance)
      : user.balance ?? 0;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-800 text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* pulsante menu a tendina */}
        <button
          disabled={!canOpenDrawer}
          className={`p-2 rounded hover:bg-gray-700 transition ${
            !canOpenDrawer ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          &#9776;
        </button>

        <div className="flex items-center space-x-6">
          <span>{user.username}</span>
          <span>Saldo: €{balanceNum.toFixed(2)}</span>
          <Link to="/profile" className="hover:underline">
            Profilo
          </Link>
          <Link to="/blackjack" className="hover:underline">
            Tavolo
          </Link>
          <button
            onClick={onLogout}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
