import React, { useState } from 'react';
import axios from 'axios';

function Profile({ user }) {
  const [balance, setBalance] = useState(user.balance || 0);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleTransaction = async (type) => {
    try {
      const response = await axios.post('/api/transaction', { 
        userId: user.id,
        type, // "deposit" oppure "withdraw"
        amount: parseFloat(amount)
      });
      setBalance(response.data.newBalance);
      setMessage(`Transazione ${type} completata con successo!`);
    } catch (err) {
      setMessage('Errore nella transazione');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Profilo Utente</h2>
      <p>Benvenuto, {user.name}</p>
      <p>Saldo attuale: €{balance.toFixed(2)}</p>
      <div>
        <input 
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Importo" />
        <button onClick={() => handleTransaction('deposit')}>Deposita</button>
        <button onClick={() => handleTransaction('withdraw')}>Preleva</button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}


export default Profile;
