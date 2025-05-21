import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Profile({ user, setUser }) {
  const navigate = useNavigate();

  // Numero di bilancio
  const balanceNum =
    typeof user.balance === "string"
      ? parseFloat(user.balance) || 0
      : typeof user.balance === "number"
      ? user.balance
      : 0;

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const handleTransaction = async (type) => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setMessage("Inserisci un importo valido");
      return;
    }
    try {
      const url = type === "deposit" ? "/api/blackjack/deposit" : "/api/blackjack/withdraw";
      const payload = type === "deposit" ? { deposit: val } : { withdraw: val };
      const res = await axios.post(url, payload, { withCredentials: true });
      const newBal = res.data.balance;
      setUser({ ...user, balance: newBal });
      setMessage(type === "deposit" ? `+€${val.toFixed(2)}` : `-€${val.toFixed(2)}`);
      setAmount("");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Errore transazione");
    }
  };

  const tabs = [
    { id: "profile", label: "Profilo" },
    { id: "history", label: "Storico" },
    { id: "finances", label: "Finanze" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-5xl mx-auto bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex bg-gray-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-center font-semibold transition ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white">Benvenuto, {user.username}</h2>
                <p className="text-gray-300">Gestisci il tuo profilo e il tuo saldo.</p>
                <div className="bg-gray-800 p-6 rounded-2xl shadow-inner">
                  <p className="text-gray-400">Saldo Disponibile</p>
                  <p className="text-4xl font-bold text-green-400 mt-2">€{balanceNum.toFixed(2)}</p>
                </div>
                <div className="mt-4">
                  <label className="block text-gray-300 mb-2">Importo</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Es. 50"
                    />
                    <button
                      onClick={() => handleTransaction("deposit")}
                      className="bg-purple-600 px-6 py-3 rounded-full text-white font-semibold hover:bg-purple-700 transition"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleTransaction("withdraw")}
                      className="bg-red-600 px-6 py-3 rounded-full text-white font-semibold hover:bg-red-700 transition"
                    >
                      -
                    </button>
                  </div>
                  {message && <p className="text-yellow-400 mt-2 animate-pulse">{message}</p>}
                </div>
                <button
                  onClick={() => navigate('/password-reset')}
                  className="mt-8 w-full bg-blue-600 py-3 rounded-full text-white font-semibold hover:bg-blue-700 transition"
                >
                  Cambia Password
                </button>
              </div>
              {/* Decorative placeholder instead of image */}
              <div className="flex items-center justify-center p-6 bg-gradient-to-tr from-purple-700 to-blue-500 rounded-2xl shadow-lg">
                <div className="text-center">
                  <svg className="w-20 h-20 text-white mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A3 3 0 017 16h10a3 3 0 011.879.804M12 12a5 5 0 100-10 5 5 0 000 10z" />
                  </svg>
                  <p className="text-white font-semibold">Il tuo spazio personale</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Storico Partite</h2>
              <div className="h-64 bg-gray-800 rounded-2xl flex items-center justify-center text-gray-500">
                {/* Grafico storico futuro */}
                Coming Soon: Grafico Partite
              </div>
            </div>
          )}

          {activeTab === "finances" && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Entrate & Uscite</h2>
              <div className="h-64 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-2xl p-4 flex items-center justify-center text-gray-500">
                  Grafico Entrate
                </div>
                <div className="bg-gray-800 rounded-2xl p-4 flex items-center justify-center text-gray-500">
                  Grafico Uscite
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}