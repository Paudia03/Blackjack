<<<<<<< Updated upstream
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
=======
import React, { useState } from "react";

// Base path sotto public/
const IMG_BASE = "/img/Playing Cards/PNG-cards-1.3";

// Percorsi dei dorsetti
const RED_BACK  = `${IMG_BASE}/red_back.png`;
const BLUE_BACK = `${IMG_BASE}/blue_back.png`;

function Blackjack({ setGameActive }) {
  const [betInput, setBetInput]   = useState("");
  const [gameState, setGameState] = useState(null);

  // Stato mock iniziale per la grafica
  const MOCK_INITIAL = {
    dealer_cards: [
      { rank: "king_of_clubs" },
      { rank: "?" }               // mano nascosta
    ],
    player_cards: [
      { rank: "jack_of_diamonds" },
      { rank: "ace_of_hearts" }
    ],
    player_score: 21,
    dealer_score: 17,
    your_bet: 0,
    your_balance: 1000,
    remaining_cards: 48,
    Gameover: false,
    isSplit: false,
    message: ""
  };

  // Avvia mock game
  const startMockGame = () => {
    const amt = parseFloat(betInput);
    if (isNaN(amt) || amt <= 0) return alert("Inserisci una puntata valida!");
    setGameState({
      ...MOCK_INITIAL,
      your_bet: amt,
      your_balance: MOCK_INITIAL.your_balance - amt
    });
  };

  // Torna alla schermata di puntata
  const exitGame = () => {
    setGameState(null);
    setBetInput("");
  };

  // Restituisce path .png in base a card.rank
  const getCardImage = (card) => {
    const fileName = card.rank.toLowerCase(); 
    return `${IMG_BASE}/${fileName}.png`;
  };

  // Render di una carta, con back colorato se rank="?"
  const renderCard = (card, i, isDealer) => {
    if (card.rank === "?") {
      return (
        <img
          key={i}
          src={isDealer ? RED_BACK : BLUE_BACK}
          alt="card back"
          className="w-16 h-auto mx-1"
        />
      );
    }
    return (
      <img
        key={i}
        src={getCardImage(card)}
        alt={card.rank}
        className="w-16 h-auto mx-1"
      />
    );
  };

  // Se non c’è gameState, mostra form puntata
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-sm">
          <label className="block text-gray-300 mb-2">Puntata di test:</label>
          <input
            type="number"
            value={betInput}
            onChange={e => setBetInput(e.target.value)}
            placeholder="Es. 786"
            className="w-full px-3 py-2 mb-4 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <button
            onClick={startMockGame}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Vai al Tavolo
          </button>
        </div>
      </div>
    );
  }

  // Schermata di gioco mock
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="flex justify-between items-center mb-6 text-white">
        <h2 className="text-3xl font-bold">Blackjack (Mock)</h2>
        <span>Saldo: {gameState.your_balance}</span>
      </div>

      <div className="flex justify-between mb-4 text-white">
        <span>Puntata: {gameState.your_bet}</span>
        <span>Rimanenti: {gameState.remaining_cards}</span>
      </div>

      {/* Player hand */}
      <div className="bg-gray-800 rounded shadow p-4 mb-6 flex flex-col items-center">
        <h3 className="text-xl text-white mb-2">Player</h3>
        <div className="flex">
          {gameState.player_cards.map((c, i) => renderCard(c, i, false))}
        </div>
        <p className="text-white mt-2">Score: {gameState.player_score}</p>
      </div>

      {/* Dealer hand */}
      <div className="bg-gray-800 rounded shadow p-4 mb-6 flex flex-col items-center">
        <h3 className="text-xl text-white mb-2">Dealer</h3>
        <div className="flex">
          {gameState.dealer_cards.map((c, i) => renderCard(c, i, true))}
>>>>>>> Stashed changes
        </div>
        <p className="text-white mt-2">Score: {gameState.dealer_score}</p>
      </div>

      {gameState.message && (
        <p className="text-center text-yellow-400 mb-4">{gameState.message}</p>
      )}
<<<<<<< Updated upstream
      {message && <p className="text-danger">{message}</p>}
=======

      <div className="flex space-x-2 justify-center mb-6">
        <button className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition">
          Carta
        </button>
        <button className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition">
          Stare
        </button>
        <button className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 transition">
          Double
        </button>
        <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
          Split
        </button>
      </div>

      <button
        onClick={exitGame}
        className="w-full bg-red-700 text-white py-2 rounded hover:bg-red-800 transition"
      >
        Cambia Puntata
      </button>
>>>>>>> Stashed changes
    </div>
  );
}

export default Blackjack;
