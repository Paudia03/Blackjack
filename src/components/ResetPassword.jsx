// src/components/ResetPassword.jsx
import React, { useState } from "react";
import axios from "axios";

export default function ResetPassword({ onCancel }) {
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async e => {
    e.preventDefault();
    setMessage("");
    const mail = email.trim();
    if (!mail) {
      setMessage("Inserisci un indirizzo email valido");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/blackjack/passwordreset",
        { email: mail },
        { withCredentials: true }
      );
      if (res.data.success) {
        setMessage("Codice inviato alla tua email");
      } else {
        setMessage(res.data.message || "Errore durante l'invio del codice");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Errore di comunicazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        {message && <p className="text-yellow-400 mb-4">{message}</p>}
        <form onSubmit={handleReset}>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="esempio@dominio.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mb-4"
          >
            {loading ? "Invio in corso..." : "Invia codice di reset"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-500"
          >
            Annulla
          </button>
        </form>
      </div>
    </div>
  );
}
