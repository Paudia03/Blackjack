import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup({ onRegistered, onCancel }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Persistenza step e form
  useEffect(() => {
    const savedStep = sessionStorage.getItem("signupStep");
    const savedForm = sessionStorage.getItem("signupForm");
    if (savedStep) setStep(Number(savedStep));
    if (savedForm) setForm(JSON.parse(savedForm));
  }, []);

  useEffect(() => {
    sessionStorage.setItem("signupStep", step);
    sessionStorage.setItem("signupForm", JSON.stringify(form));
  }, [step, form]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Invio dati iniziali
  const handleSignup = async e => {
    e.preventDefault();
    if (form.password !== form.repeatPassword) {
      setError("Le password non corrispondono");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const username = `${form.firstName} ${form.lastName}`;
      await axios.post(
        "/api/blackjack/signup",
        { email: form.email, username, password: form.password, repeat_password: form.repeatPassword },
        { withCredentials: true }
      );
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Registrazione fallita");
    } finally {
      setLoading(false);
    }
  };

  // Verifica OTP
  const handleVerify = async e => {
  e.preventDefault();
  if (!otp) {
    setError("Inserisci il codice ricevuto");
    return;
  }
  setError("");
  setLoading(true);

  try {
    const res = await axios.post(
      "/api/blackjack/authentication",
      { email: form.email, code: otp },
      { withCredentials: true }
    );

    if (res.data.success) {
      onRegistered(res.data.user);
      sessionStorage.clear();
      setStep(3);
    } else {
      // Response con 200 ma success=false
      console.warn("Verify failed (200):", res.data);
      setError(res.data.message || "Verifica fallita");
      setOtp("");           // pulisco il campo
    }
  } catch (err) {
    // Errore HTTP (es. 401, 500, timeout...)
    console.error("Verify error:", err.response || err);
    const msg = err.response?.data?.message || "Errore durante la verifica";
    setError(msg);
    setOtp("");
  } finally {
    setLoading(false);
  }
};


  // Reinvia codice
  const handleResendOTP = async () => {
    setError("");
    setLoading(true);
    try {
      await axios.post(
        "/api/blackjack/resend-code",
        { email: form.email },
        { withCredentials: true }
      );
    } catch {
      setError("Errore invio codice. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 p-6 rounded shadow-md text-white">
        {step === 1 && (
          <>  
            <h2 className="text-2xl font-bold mb-4">Registrazione</h2>
            <form onSubmit={handleSignup} className="space-y-4">
              {[
                { name: "firstName", label: "Nome", type: "text" },
                { name: "lastName", label: "Cognome", type: "text" },
                { name: "email", label: "Email", type: "email" },
                { name: "password", label: "Password", type: "password" },
                { name: "repeatPassword", label: "Ripeti Password", type: "password" }
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-gray-300 mb-1">{field.label}</label>
                  <input
                    name={field.name}
                    type={field.type}
                    value={form[field.name]}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    required
                  />
                </div>
              ))}
              {error && <p className="text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 py-2 rounded hover:bg-green-700"
              >
                {loading ? "Invio..." : "Registrati"}
              </button>
            </form>
            <div className="mt-4 text-center">
               <button
        onClick={onCancel}
        className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 transition mt-4"
  >
    Torna al login
  </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Verifica Codice</h2>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">Codice OTP</label>
                <input
                  name="otp"
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  required
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 py-2 rounded hover:bg-green-700"
              >
                {loading ? "Verifica..." : "Verifica"}
              </button>
            </form>
            <button
              onClick={handleResendOTP}
              disabled={loading}
              className="w-full mt-3 bg-yellow-600 py-2 rounded hover:bg-yellow-700"
            >
              {loading ? "Invio..." : "Reinvia codice"}
            </button>
            <div className="mt-4 text-center">
              <button onClick={onCancel} disabled={loading} className="text-gray-400 hover:underline">
                Annulla e torna al login
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Benvenuto!</h2>
            <p className="mb-4">Registrazione completata con successo!</p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700"
            >
              Vai alla Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
