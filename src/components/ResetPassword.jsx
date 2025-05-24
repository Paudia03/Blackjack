// src/components/ResetPassword.jsx
import React, { useState } from "react";
import axios from "axios";

export default function ResetPassword({ onCancel }) {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 1) Invio codice di reset
  const sendResetCode = async () => {
    if (!email.trim()) {
      setMessage("Inserisci un indirizzo email valido");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(
        "/api/blackjack/passwordreset",
        { email: email.trim() },
        { withCredentials: true }
      );
      if (res.data.success) {
        setOtpSent(true);
        setMessage("Codice OTP inviato alla tua email");
      } else {
        setMessage(res.data.message || "Errore durante l'invio del codice");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Errore di comunicazione");
    } finally {
      setLoading(false);
    }
  };

  // 2+3) Conferma reset e cambio password
  const handleChangePassword = async () => {
    if (!otp.trim()) {
      setMessage("Inserisci il codice OTP ricevuto");
      return;
    }
    if (newPassword !== repeatPassword) {
      setMessage("Le password non corrispondono");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(
        "/api/blackjack/confirmreset",
        { email: email.trim(), reset_code: otp.trim(), new_password: newPassword },
        { withCredentials: true }
      );
      if (res.data.success) {
        setMessage("Cambio password avvenuto con successo, riceverai una e-mail di conferma");
      } else {
        setMessage(res.data.message || "Errore durante il cambio password");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Errore di comunicazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md text-white space-y-6">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>

        {message && (
          <p className="text-yellow-400 text-center">{message}</p>
        )}

        {/* Step 1: invio email */}
        {!otpSent && (
          <>
            <div>
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
              onClick={sendResetCode}
              disabled={loading}
              className="w-full bg-green-600 py-2 rounded hover:bg-green-700 transition"
            >
              {loading ? "Invio in corso..." : "Invia codice di reset"}
            </button>
          </>
        )}

        {/* Steps 2+3: OTP + nuova password */}
        {otpSent && (
          <>
            <div>
              <label className="block text-gray-300 mb-2">Codice OTP:</label>
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
                onClick={sendResetCode}
                disabled={loading}
                className="flex-1 bg-yellow-600 py-2 rounded hover:bg-yellow-700 transition"
              >
                {loading ? "Reinvio..." : "Reinvia OTP"}
              </button>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="flex-1 bg-blue-600 py-2 rounded hover:bg-blue-700 transition"
              >
                {loading ? "Verifico..." : "Conferma Cambio"}
              </button>
            </div>
          </>
        )}
        
        <button
        onClick={onCancel}
        className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 transition mt-4"
  >
        Torna al login
      </button>

        <button
          onClick={onCancel}
          disabled={loading}
          className="w-full bg-gray-600 py-2 rounded hover:bg-gray-500 transition"
        >
          Annulla
        </button>
      </div>
    </div>
  );
}
