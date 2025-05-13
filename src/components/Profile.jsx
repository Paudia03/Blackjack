// src/components/Profile.jsx
import React, { useState } from "react";
import axios from "axios";

export default function Profile({ user, setUser }) {
  // Ensure balance is number
  const balanceNum =
    typeof user.balance === "string"
      ? parseFloat(user.balance) || 0
      : typeof user.balance === "number"
      ? user.balance
      : 0;

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  // Simulated deposit/withdraw functions
  const handleTransaction = async (type) => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setMessage("Inserisci un importo valido");
      return;
    }
    try {
      // Qui potresti fare:
      // const res = await axios.post("/api/blackjack/transaction", { userId: user.id, type, amount: val });
      // setUser({ ...user, balance: res.data.newBalance });
      let newBal = balanceNum + (type === "deposit" ? val : -val);
      if (newBal < 0) {
        setMessage("Saldo insufficiente per prelievo");
        return;
      }
      setUser({ ...user, balance: newBal });
      setMessage(type === "deposit"
        ? `Depositato €${val.toFixed(2)}`
        : `Prelevato €${val.toFixed(2)}`);
      setAmount("");
    } catch {
      setMessage("Errore transazione");
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
