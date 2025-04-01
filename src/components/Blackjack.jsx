import React, { useState } from 'react';
import axios from 'axios';

function Blackjack({ user }) {
  const [gameState, setGameState] = useState(null);
  const [message, setMessage] = useState('');

  const startGame = async () => {
    try {
      const response = await axios.post('/api/blackjack/start', { userId: user.id });
      setGameState(response.data);
      setMessage('');
    } catch (err) {
      setMessage('Errore durante l\'inizio della partita');
      console.error(err);
    }
  };

  const play = async (action) => {
    try {
      const response = await axios.post('/api/blackjack/play', { 
        userId: user.id,
        action, // "hit" oppure "stand"
        gameId: gameState.id
      });
      setGameState(response.data);
    } catch (err) {
      setMessage('Errore durante l\'azione di gioco');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Blackjack</h2>
      {!gameState ? (
        <button onClick={startGame}>Inizia Nuova Partita</button>
      ) : (
        <div>
          <p>Mano corrente:</p>
          <div>
            <h3>Giocatore</h3>
            <div style={{ display: 'flex' }}>
              {gameState.playerCards.map((card, index) => (
                <div key={index} style={{
                  border: '1px solid #000',
                  padding: '10px',
                  marginRight: '5px'
                }}>
                  {card.rank} di {card.suit}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3>Banco</h3>
            <div style={{ display: 'flex' }}>
              {gameState.dealerCards.map((card, index) => (
                <div key={index} style={{
                  border: '1px solid #000',
                  padding: '10px',
                  marginRight: '5px'
                }}>
                  {card.rank} di {card.suit}
                </div>
              ))}
            </div>
          </div>
          <div>
            <button onClick={() => play('hit')}>Chiedi Carta (Hit)</button>
            <button onClick={() => play('stand')}>Stai (Stand)</button>
          </div>
          {gameState.status && <p>Stato: {gameState.status}</p>}
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default Blackjack;
