// src/components/Signup.jsx
import React, { useState } from "react";
import axios from "axios";

export default function Signup({ onRegistered, onCancel }) {
  // step: 1 = signup form, 2 = code verification
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async e => {
    e.preventDefault();
    setError("");
    if (form.password !== form.repeatPassword) {
      setError("Le password non corrispondono");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/api/blackjack/signup", {
        email: form.email,
        username: `${form.firstName} ${form.lastName}`,
        password: form.password,
        repeat_password: form.repeatPassword,
      });
      setUserId(res.data.user.id);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Registrazione fallita");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async e => {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code)) {
      setError("Il codice deve essere di 6 cifre");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/api/blackjack/verify", {
        userId,
        code,
      });
      onRegistered();
    } catch (err) {
      setError(err.response?.data?.message || "Verifica fallita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 p-6 rounded shadow-md">
        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">Registrazione</h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-gray-300">Nome</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300">Cognome</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300">Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300">Ripeti Password</label>
                <input
                  name="repeatPassword"
                  type="password"
                  value={form.repeatPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {loading ? "Caricamento..." : "Registrati"}
              </button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-gray-400">
                Hai già un account?{' '}
                <button
                  onClick={onCancel}
                  className="text-blue-400 hover:underline"
                >
                  Torna al login
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">Verifica Email</h2>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-gray-300">Codice a 6 cifre</label>
                <input
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  maxLength={6}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                {loading ? "Verifica..." : "Verifica"}
              </button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-gray-400">
                Hai già un account?{' '}
                <button
                  onClick={onCancel}
                  className="text-blue-400 hover:underline"
                >
                  Torna al login
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
