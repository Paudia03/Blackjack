import React, { useState } from "react";
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
        {
          email: form.email,
          username,
          password: form.password,
          repeat_password: form.repeatPassword,
        },
        { withCredentials: true }
      );
      // avanzamento alla schermata di conferma
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Registrazione fallita");
    } finally {
      setLoading(false);
    }
  };

  // Schermata finale: istruzioni e torna al login

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 p-6 rounded shadow-md text-white">
        {step === 1 ? (
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
                className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700"
              >
                {loading ? "Invio..." : "Registrati"}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button onClick={onCancel} disabled={loading} className="text-gray-400 hover:underline">
                Torna al login
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Benvenuto!</h2>
            <p className="mb-6">
              Ti arriverà a breve una mail di conferma con il codice per completare la registrazione.
            </p>
            <button
              onClick={onCancel}
              className="w-full bg-green-600 py-2 rounded hover:bg-green-700"
            >
              Torna al login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
