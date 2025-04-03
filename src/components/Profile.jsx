import React, { useState } from 'react';

function Profile({ user }) {
  const [balance, setBalance] = useState(user.balance || 0);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleTransaction = (type) => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setMessage("Inserisci un importo valido.");
      return;
    }
    const newBalance = type === 'deposit' ? balance + amt : balance - amt;
    setBalance(newBalance);
    setMessage(`Transazione ${type} completata!`);
    setAmount('');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-6">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-4 text-center text-white">Profilo Utente</h2>
        <p className="text-lg mb-4 text-gray-200">
          Benvenuto, <span className="font-semibold text-white">{user.name}</span>
        </p>
        <p className="text-xl mb-6 text-gray-200">
          Saldo Attuale: <span className="font-bold text-white">€{balance.toFixed(2)}</span>
        </p>
        <div className="mb-4">
          <input 
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Inserisci importo"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
          />
        </div>
        <div className="flex justify-between mb-4">
          <button 
            onClick={() => handleTransaction('deposit')}
            className="w-1/2 mr-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
            Deposita
          </button>
          <button 
            onClick={() => handleTransaction('withdraw')}
            className="w-1/2 ml-2 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
            Preleva
          </button>
        </div>
        {message && <p className="text-center text-blue-400">{message}</p>}
      </div>
    </div>
  );
}

export default Profile;
