// src/components/Login.jsx
import React, { useState } from 'react';
import Signup from './Signup';

export default function Login({ setUser }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [showSignup, setShowSignup] = useState(false);

  // Called when Signup completes
  const handleRegistered = () => {
    setShowSignup(false);
    setError('Registrazione completata! Effettua il login.');
  };

  // Simulated login
  const handleLogin = e => {
    e.preventDefault();
    setError('');
    setTimeout(() => {
      if (email === 'test@example.com' && password === '1234') {
        setUser({
          id:      1,
          name:    'Utente di Test',
          balance: 100,
        });
      } else {
        setError('Credenziali non valide');
      }
    }, 500);
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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Accedi a Blackjack
        </h2>

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
          >
            Accedi
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-400">
            Non hai un account?{' '}
            <button
              onClick={() => setShowSignup(true)}
              className="text-blue-400 hover:underline"
            >
              Registrati
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
