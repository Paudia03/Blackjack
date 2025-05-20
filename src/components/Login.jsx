// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Signup from "./Signup";
import axios from "axios";

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [error, setError]           = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading]       = useState(false);

  // Fake credentials
  const FAKE_EMAIL    = "test@example.com";
  const FAKE_PASSWORD = "1234";

  const handleRegistered = user => {
    setShowSignup(false);
    setError("Registrazione completata! Effettua il login.");
    setEmail(user.email || "");
  };

  const handleLogin = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // prima il login
      let userData;
      if (email === FAKE_EMAIL && password === FAKE_PASSWORD) {
        userData = { username: "Demo User", balance: 1000 };
      } else {
        const res = await axios.post("/api/blackjack/login", {
          identifier: email,
          password,
        });
        if (!res.data.success) {
          setError(res.data.message);
          setLoading(false);
          return;
        }
        userData = res.data.user;
      }

      // inizializzo la sessione sul server
      await axios.post("/api/blackjack/init");

      // salvo lo user in App.jsx e navigo
      setUser(userData);
      navigate("/", { replace: true });

    } catch (err) {
      setError(err.response?.data?.message || "Errore login");
    } finally {
      setLoading(false);
    }
  };

  if (showSignup) {
    return (
      <Signup
        onRegistered={handleRegistered}
        onCancel={() => setShowSignup(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Accedi a Blackjack
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Caricamento..." : "Accedi"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-400">
            Non hai un account?{" "}
            <button
              onClick={() => setShowSignup(true)}
              disabled={loading}
              className="text-blue-400 hover:underline"
            >
              Registrati
            </button>
          </p>
          <p className="mt-2 text-gray-500 text-sm">
            Oppure usa <code>test@example.com</code> / <code>1234</code>
          </p>
        </div>
      </div>
    </div>
  );
}
