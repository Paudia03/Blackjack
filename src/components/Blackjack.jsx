import React, { useState } from 'react';
import axios from 'axios';

function Blackjack({ user }) {
  const [gameState, setGameState] = useState(null);
  const [message, setMessage] = useState('');
  const [bet, setBet] = useState('');

  // Avvia una nuova partita tramite API
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
      setGameState(response.data);
      setMessage('');
    } catch (error) {
      console.error(error);
      setMessage("Errore durante l'inizio della partita");
    }
  };

  // Funzioni per le azioni di gioco
  const hit = async (handIndex = 0) => {
    try {
      const response = await axios.post('/api/blackjack/play', {
        userId: user.id,
        action: 'hit',
        gameId: gameState.id,
        handIndex,
      });
      setGameState(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Errore durante l'azione Hit");
    }
  };

  const stand = async (handIndex = 0) => {
    try {
      const response = await axios.post('/api/blackjack/play', {
        userId: user.id,
        action: 'stand',
        gameId: gameState.id,
        handIndex,
      });
      setGameState(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Errore durante l'azione Stand");
    }
  };

  const doubleDown = async (handIndex = 0) => {
    try {
      const response = await axios.post('/api/blackjack/play', {
        userId: user.id,
        action: 'doubleDown',
        gameId: gameState.id,
        handIndex,
      });
      setGameState(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Errore durante il raddoppio");
    }
  };

  const splitHand = async (handIndex = 0) => {
    try {
      const response = await axios.post('/api/blackjack/play', {
        userId: user.id,
        action: 'split',
        gameId: gameState.id,
        handIndex,
      });
      setGameState(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Errore durante lo split");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-white">Tavolo da Gioco - Blackjack</h2>
      {!gameState ? (
        <div className="max-w-md mx-auto bg-gray-800 p-6 rounded shadow">
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Puntata:</label>
            <input
              type="number"
              value={bet}
              onChange={(e) => setBet(e.target.value)}
              placeholder="Inserisci puntata"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>
          <button 
            onClick={startGame} 
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Inizia Nuova Partita
          </button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4 text-white">Mano del Giocatore</h3>
          {gameState.playerHands.map((hand, index) => (
            <div key={index} className="bg-gray-800 rounded shadow p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xl font-bold text-white">
                  Mano {index + 1} {hand.doubled && <span className="text-yellow-400">(Raddoppiato)</span>}
                </h4>
                {!hand.stand && (
                  <div>
                    <button onClick={() => hit(index)} className="bg-gray-700 text-white px-3 py-1 rounded mr-2 hover:bg-gray-600 transition">
                      Hit
                    </button>
                    <button onClick={() => stand(index)} className="bg-gray-700 text-white px-3 py-1 rounded mr-2 hover:bg-gray-600 transition">
                      Stand
                    </button>
                    <button onClick={() => doubleDown(index)} className="bg-yellow-600 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-700 transition">
                      Double Down
                    </button>
                    {hand.cards.length === 2 && hand.cards[0].rank === hand.cards[1].rank && (
                      <button onClick={() => splitHand(index)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                        Split
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex space-x-4">
                {hand.cards.map((card, i) => (
                  <div key={i} className="border border-gray-600 rounded p-2 bg-gray-700">
                    <p className="font-bold text-white">{card.rank}</p>
                    <p className="text-gray-300">{card.suit}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <h3 className="text-2xl font-semibold mb-4 text-white">Mano del Banco</h3>
          <div className="flex space-x-4 mb-6">
            {gameState.dealerCards.map((card, index) => (
              <div key={index} className="border border-gray-600 rounded p-2 bg-gray-700">
                <p className="font-bold text-white">{card.rank}</p>
                <p className="text-gray-300">{card.suit}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xl font-semibold text-white">Stato: {gameState.status}</p>
        </div>
      )}
      {message && <p className="text-center text-red-500 mt-4">{message}</p>}
    </div>
  );
}

export default Blackjack;
