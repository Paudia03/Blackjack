import React, { useState } from "react";
import axios from "axios";

function Blackjack() {
  const [gameState, setGameState] = useState(null);
  const [message, setMessage] = useState("");
  const [bet, setBet] = useState("");
  const [balance, setBalance] = useState(100000000);  // Aggiungi bilancio iniziale qui

  // Avvia il gioco
  const startGame = async () => {
    const betAmount = parseFloat(bet);
    if (isNaN(betAmount) || betAmount <= 0) {
      setMessage("Inserisci una puntata valida!");
      return;
    }
    try {
      const response = await axios.post("http://localhost:3000/api/blackjack/start", { bet: betAmount });
      setGameState(response.data);
      setMessage("");
      setBalance(response.data.your_balance);
    } catch (error) {
      setMessage("Errore durante l'inizio della partita");
    }
  };

  // Giocare la mossa "hit" (pescare una carta)
  const hit = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/blackjack/play", { action: "hit" });
      setGameState(response.data);
      if (response.data.message === "Out of bounds") {
        setMessage("Hai sballato! 😵");
      }
    } catch (error) {
      setMessage("Errore nel pescare una carta");
    }
  };

  // Giocare la mossa "stand" (stare)
  const stand = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/blackjack/play", { action: "stand" });
      setGameState(response.data);
      setMessage(response.data.message);
      setBalance(response.data.your_balance);
    } catch (error) {
      setMessage("Errore nel fermarsi");
    }
  };

  // Resetta il gioco
  const resetGame = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/blackjack/reset");
      setGameState(null);
      setMessage(response.data.message);
      setBalance(100000000); // Resetta il bilancio iniziale
    } catch (error) {
      setMessage("Errore nel reset del gioco");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-white">Blackjack</h2>

      {!gameState ? (
        <div className="max-w-md mx-auto bg-gray-800 p-6 rounded shadow">
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Puntata:</label>
            <input
              type="number"
              value={bet}
              onChange={(e) => setBet(e.target.value)}
              placeholder="Inserisci puntata"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>
          <button onClick={startGame} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Inizia Nuova Partita
          </button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4 text-white">Mano del Giocatore</h3>
          <div className="bg-gray-800 rounded shadow p-4 mb-6">
            <h4 className="text-xl font-bold text-white">Carte:</h4>
            <div className="flex space-x-4">
              {gameState.your_cards?.map((card, i) => (
                <div key={i} className="border border-gray-600 rounded p-2 bg-gray-700">
                  <p className="font-bold text-white">{card.rank} di {card.suit}</p>
                </div>
              ))}
            </div>
            <p className="text-white mt-2">Punteggio: {gameState.your_score}</p>
          </div>

          <h3 className="text-2xl font-semibold mb-4 text-white">Mano del Dealer</h3>
          <div className="bg-gray-800 rounded shadow p-4 mb-6">
            <h4 className="text-xl font-bold text-white">Carte:</h4>
            <div className="flex space-x-4">
              {gameState.dealer_cards?.map((card, i) => (
                <div key={i} className="border border-gray-600 rounded p-2 bg-gray-700">
                  <p className="font-bold text-white">{card.rank} di {card.suit}</p>
                </div>
              ))}
            </div>
            <p className="text-white mt-2">Punteggio: {gameState.dealer_score}</p>
          </div>

          {!gameState.gameOver && (
            <div className="flex space-x-4">
              <button onClick={hit} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition">
                Carta 🃏
              </button>
              <button onClick={stand} className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition">
                Stare ✋
              </button>
            </div>
          )}

          {message && <p className="text-center text-red-500 mt-4">{message}</p>}

          <div className="mt-6 text-center">
            <button onClick={resetGame} className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition">
              Reset Gioco
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-white">Bilancio: {balance}</p>
      </div>
    </div>
  );
}

export default Blackjack;
