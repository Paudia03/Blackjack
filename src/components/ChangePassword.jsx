// src/components/ChangePassword.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ChangePassword({ userEmail }) {
  const navigate = useNavigate();

  // Stato
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 1) Funzione hoisted per inviare/reinviare OTP
  async function sendOtp() {
    if (!userEmail) return;
    setMessage("");
    setLoading(true);
    try {
      await axios.get("/api/blackjack/me");
      const res = await axios.post(
        "/api/blackjack/passwordreset",
        { email: userEmail },
        { withCredentials: true }
      );
      if (res.data.success) {
        setOtpSent(true);
        setMessage("OTP inviato sulla tua email");
      } else {
        setMessage(res.data.message || "Errore durante l'invio dell'OTP");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Errore invio OTP");
    } finally {
      setLoading(false);
    }
  }

  // 2) Invio OTP automatico all'avvio, se c'è userEmail
  useEffect(() => {
    if (userEmail) sendOtp();
  }, [userEmail]);

  // 3) Verifica OTP e cambio password
  async function handleConfirm() {
    if (!otp.trim()) {
      setMessage("Inserisci l'OTP ricevuto");
      return;
    }
    if (newPassword !== repeatPassword) {
      setMessage("Le password non corrispondono");
      return;
    }
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/blackjack/confirmreset",
        {
          email: userEmail,
          reset_code: otp.trim(),
          new_password: newPassword
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        setMessage("Cambio password avvenuto con successo, riceverai una e-mail di conferma");
      } else {
        setMessage(res.data.message || "Errore durante il cambio password");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Errore comunicazione");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md text-white space-y-6">
        <h2 className="text-2xl font-bold text-center">Cambia Password</h2>
        <p className="text-gray-400">
          Email associata: <span className="text-white">{userEmail}</span>
        </p>
        {message && (
          <p className="text-yellow-400 text-center">{message}</p>
        )}

        <div>
          <label className="block text-gray-300 mb-2">OTP:</label>
          <input
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            placeholder="Inserisci codice"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Nuova Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            placeholder="Nuova password"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Ripeti Password:</label>
          <input
            type="password"
            value={repeatPassword}
            onChange={e => setRepeatPassword(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            placeholder="Ripeti nuova password"
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={sendOtp}
            disabled={loading}
            className="flex-1 bg-yellow-600 py-2 rounded hover:bg-yellow-700 transition"
          >
            {loading ? "Reinvio..." : "Reinvia OTP"}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-green-600 py-2 rounded hover:bg-green-700 transition"
          >
            {loading ? "Confermo..." : "Conferma Cambio"}
          </button>
        </div>

        <button
          onClick={() => navigate(-1)}
          disabled={loading}
          className="w-full bg-gray-600 py-2 rounded hover:bg-gray-500 transition"
        >
          Annulla
        </button>
      </div>
    </div>
  );
}
