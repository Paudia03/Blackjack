// src/components/Blackjack.jsx
import React, { useState } from 'react';
import axios from 'axios';

function Blackjack({ user }) {
  const [gameState, setGameState] = useState(null);
  const [message, setMessage] = useState('');
  const [bet, setBet] = useState('');

  // Avvia una nuova partita
  const startGame = async () => {
    const betAmount = parseFloat(bet);
    if (isNaN(betAmount) || betAmount <= 0) {
      setMessage("Inserisci una puntata valida!");
      return;
    }
    try {
      const response = await axios.post('/api/blackjack/start', {
        userId: user.id,
        bet: betAmount,
      });
      // Il backend dovrebbe restituire lo stato iniziale della partita
      setGameState(response.data);
      setMessage('');
    } catch (error) {
      console.error(error);
      setMessage("Errore durante l'inizio della partita");
    }
  };

  // Chiedi carta (hit) per la mano specificata
  const hit = async (handIndex = 0) => {
    try {
      const response = await axios.post('/api/blackjack/play', {
        userId: user.id,
        action: 'hit',
        gameId: gameState.id,
        handIndex: handIndex,
      });
      // Il backend restituisce lo stato aggiornato della partita
      setGameState(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Errore durante l'azione Hit");
    }
  };

  // Ferma (stand) per la mano specificata
  const stand = async (handIndex = 0) => {
    try {
      const response = await axios.post('/api/blackjack/play', {
        userId: user.id,
        action: 'stand',
        gameId: gameState.id,
        handIndex: handIndex,
      });
      setGameState(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Errore durante l'azione Stand");
    }
  };

  // Raddoppia (double down) per la mano specificata
  const doubleDown = async (handIndex = 0) => {
    try {
      const response = await axios.post('/api/blackjack/play', {
        userId: user.id,
        action: 'doubleDown',
        gameId: gameState.id,
        handIndex: handIndex,
      });
      setGameState(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Errore durante il raddoppio");
    }
  };

  // Effettua lo split della mano specificata
  const splitHand = async (handIndex = 0) => {
    try {
      const response = await axios.post('/api/blackjack/play', {
        userId: user.id,
        action: 'split',
        gameId: gameState.id,
        handIndex: handIndex,
      });
      setGameState(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Errore durante lo split");
    }
  };

  return (
    <div>
      <h2>Blackjack</h2>
      {!gameState ? (
        <div>
          <div className="mb-3">
            <label className="form-label">Puntata:</label>
            <input
              type="number"
              className="form-control"
              value={bet}
              onChange={(e) => setBet(e.target.value)}
              placeholder="Inserisci puntata"
            />
          </div>
          <button className="btn btn-primary" onClick={startGame}>
            Inizia Nuova Partita
          </button>
        </div>
      ) : (
        <div>
          <h3>Mano del Giocatore</h3>
          {gameState.playerHands.map((hand, index) => (
            <div key={index} className="card mb-3" style={{ padding: '10px' }}>
              <h5>
                Mano {index + 1} {hand.doubled && "(Raddoppiato)"}
              </h5>
              <div className="d-flex mb-2">
                {hand.cards.map((card, i) => (
                  <div key={i} className="border p-2 me-2">
                    {card.rank} di {card.suit}
                  </div>
                ))}
              </div>
              {!hand.stand && (
                <div>
                  <button className="btn btn-secondary me-2" onClick={() => hit(index)}>
                    Chiedi Carta (Hit)
                  </button>
                  <button className="btn btn-secondary me-2" onClick={() => stand(index)}>
                    Stai (Stand)
                  </button>
                  <button className="btn btn-warning me-2" onClick={() => doubleDown(index)}>
                    Raddoppia (Double Down)
                  </button>
                  {hand.cards.length === 2 && hand.cards[0].rank === hand.cards[1].rank && (
                    <button className="btn btn-info" onClick={() => splitHand(index)}>
                      Split
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          <h3>Mano del Banco</h3>
          <div className="d-flex mb-3">
            {gameState.dealerCards.map((card, index) => (
              <div key={index} className="border p-2 me-2">
                {card.rank} di {card.suit}
              </div>
            ))}
          </div>
          <p>Stato: {gameState.status}</p>
        </div>
      )}
      {message && <p className="text-danger">{message}</p>}
    </div>
  );
}

export default Blackjack;
