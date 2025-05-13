// src/components/Profile.jsx
import React, { useState } from "react";
import axios from "axios";

export default function Profile({ user, setUser }) {
  // Assicuriamoci che balance sia un numero
  const balanceNum =
    typeof user.balance === "string"
      ? parseFloat(user.balance) || 0
      : typeof user.balance === "number"
      ? user.balance
      : 0;

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  // Funzione generica per depositi/prelievi
  const handleTransaction = async (type) => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setMessage("Inserisci un importo valido");
      return;
    }
    try {
      let url;
      let payload;
      if (type === "deposit") {
        url = "/api/blackjack/deposit";
        payload = { deposit: val };
      } else {
        url = "/api/blackjack/withdraw";
        payload = { withdraw: val };
      }
      const res = await axios.post(url, payload);
      // Supponiamo che la risposta contenga il nuovo balance in res.data.balance
      const newBal = res.data.balance;
      setUser({ ...user, balance: newBal });
      setMessage(type === "deposit"
        ? `Depositati €${val.toFixed(2)}`
        : `Prelevati €${val.toFixed(2)}`);
      setAmount("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Errore transazione");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-16 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md text-white space-y-4">
        <h2 className="text-2xl font-bold">Profilo Utente</h2>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Saldo:</strong> €{balanceNum.toFixed(2)}</p>

        {/* Deposit/Withdraw */}
        <div>
          <label className="block mb-1">Importo:</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white mb-2"
            placeholder="Es. 50"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => handleTransaction("deposit")}
              className="flex-1 bg-green-600 py-2 rounded hover:bg-green-700"
            >
              Deposita
            </button>
            <button
              onClick={() => handleTransaction("withdraw")}
              className="flex-1 bg-red-600 py-2 rounded hover:bg-red-700"
            >
              Preleva
            </button>
          </div>
        </div>

        {message && <p className="text-yellow-400">{message}</p>}
      </div>
    </div>
  );
}
