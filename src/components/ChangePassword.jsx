// src/components/ChangePassword.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ChangePassword({ userEmail: propUserEmail }) {
  const navigate = useNavigate();

  // Stati
  const [email, setEmail] = useState(propUserEmail || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Funzione per inviare/reinviare OTP
  async function sendOtp(mail) {
    if (!mail) return;
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/blackjack/passwordreset",
        { email: mail },
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

  // Al mount, recupero email se non passata e invio OTP
  useEffect(() => {
    (async () => {
      let mail = propUserEmail;
      if (!mail) {
        try {
          const res = await axios.get("/api/blackjack/me", { withCredentials: true });
          mail = res.data.user.email;
        } catch {
          setMessage("Impossibile recuperare email");
          return;
        }
      }
      setEmail(mail);
      await sendOtp(mail);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Conferma OTP e cambio password
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
          email,
          reset_code: otp.trim(),
          new_password: newPassword
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        setMessage("Cambio password avvenuto con successo");
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
          Email associata: <span className="text-white">{email}</span>
        </p>
        {message && <p className="text-yellow-400 text-center">{message}</p>}

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

        <div className="flex space-x-2">
          <button
            onClick={() => sendOtp(email)}
            disabled={loading}
            className="flex-1 bg-yellow-600 py-2 rounded hover:bg-yellow-700 transition"
          >
            {loading ? "Reinvio..." : "Reinvia OTP"}
          </button>
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

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-green-600 py-2 rounded hover:bg-green-700 transition"
        >
          {loading ? "Confermo..." : "Conferma Cambio"}
        </button>

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
