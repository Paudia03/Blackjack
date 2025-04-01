import React, { useState } from 'react';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    // Simula una chiamata API con un ritardo di 500 ms
    setTimeout(() => {
      // Controlla se le credenziali corrispondono ai valori fittizi
      if (email === 'test@example.com' && password === '1234') {
        // Risposta fittizia: dati utente
        const fakeResponse = {
          id: 1,
          name: "Utente di Test",
          balance: 100,
        };
        setUser(fakeResponse);
      } else {
        setError("Credenziali non valide");
      }
    }, 500);
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required />
        </div>
        <button type="submit">Accedi</button>
      </form>
    </div>
  );
}

export default Login;
