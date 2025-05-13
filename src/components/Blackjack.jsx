// src/components/Blackjack.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const IMG_BASE = "/img/Playing Cards/PNG-cards-1.3";
const RED_BACK  = `${IMG_BASE}/red_back.png`;
const BLUE_BACK = `${IMG_BASE}/blue_back.png`;

function getCardImage(card, isDealer, isHidden) {
  if (isHidden) return isDealer ? RED_BACK : BLUE_BACK;
  const map = { K: "king", Q: "queen", J: "jack", A: "ace" };
  const rank = map[card.value] || card.value.toLowerCase();
  const suit = card.suit.toLowerCase();
  return `${IMG_BASE}/${rank}_of_${suit}.png`;
}

export default function Blackjack({ user, onGameOver }) {
  const [gameState, setGameState] = useState(null);
  const [betInput, setBetInput]   = useState("");
  const [message, setMessage]     = useState("");
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

  const updateState = data => {
    setGameState(data);
    onGameOver(data.Gameover);
  };

  const startGame = async () => {
    // Se il saldo utente è zero, non si inizia: mostra tasto Ricarica
    if (user.balance === 0) {
      setMessage("Saldo 0: ricarica per giocare");
      return;
    }

    const bet = parseFloat(betInput);
    if (isNaN(bet) || bet <= 0) {
      setMessage("Inserisci una puntata valida!");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const { data } = await axios.post("/api/blackjack/start", { bet });
      data.dealer_cards = data.dealer_cards.map(c => ({ ...c, isDealer: true }));
      updateState(data);
      setMessage(data.message || "");
    } catch (err) {
      setMessage(err.response?.data?.message || "Errore avvio partita");
    } finally {
      setLoading(false);
    }
  };

  const playAction = async action => {
    if (!gameState || gameState.Gameover) return;
    setLoading(true);
    setMessage("");
    try {
      const { data } = await axios.post("/api/blackjack/play", { action });
      data.dealer_cards = data.dealer_cards.map(c => ({ ...c, isDealer: true }));
      updateState(data);
      setMessage(data.message || "");
    } catch (err) {
      setMessage(err.response?.data?.message || `Errore: ${action}`);
    } finally {
      setLoading(false);
    }
  };

  const replay = async () => {
    if (!gameState) return;
    setLoading(true);
    setMessage("");
    try {
      await axios.post("/api/blackjack/reset");
      await startGame();
    } catch {
      setMessage("Errore reset partita");
    } finally {
      setLoading(false);
    }
  };

  const renderCard = (card, idx) => {
    const isDealer = card.isDealer;
    const isHidden = isDealer && idx === 1 && !gameState.Gameover;
    return (
      <img
        key={idx}
        src={getCardImage(card, isDealer, isHidden)}
        alt={card.value || "?"}
        className="w-16 h-auto mx-1"
      />
    );
  };

  // Se il saldo utente è 0 mostriamo il tasto Ricarica
  const showRecharge = user.wallet === 0;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <header className="flex justify-center mb-6 text-white">
        <h1 className="text-3xl font-bold">Tavolo</h1>
      </header>

      {!gameState ? (
        <div className="max-w-sm mx-auto bg-gray-800 p-6 rounded shadow">
          <label className="block text-gray-300 mb-2">Puntata:</label>
          <input
            type="number"
            value={betInput}
            onChange={e => setBetInput(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 mb-4 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <button
            onClick={startGame}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Caricamento..." : "Inizia Partita"}
          </button>
          {message && <p className="text-red-500 mt-2">{message}</p>}
          {showRecharge && (
            <button
              onClick={() => navigate("/profile")}
              className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
            >
              Ricarica Saldo
            </button>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between mb-4 text-white">
            <span>Puntata: <strong>{gameState.your_bet}</strong></span>
            <span>Saldo: <strong>{gameState.your_balance}</strong></span>
            <span>Carte rimaste: <strong>{gameState.remaining_cards}</strong></span>
          </div>

          <section className="bg-gray-800 rounded shadow p-4 mb-6">
            <h2 className="text-xl text-white mb-2">Giocatore</h2>
            <div className="flex">{gameState.player_cards.map(renderCard)}</div>
            <p className="text-white mt-2">Punti: {gameState.player_score}</p>
          </section>

          <section className="bg-gray-800 rounded shadow p-4 mb-6">
            <h2 className="text-xl text-white mb-2">Banco</h2>
            <div className="flex">{gameState.dealer_cards.map(renderCard)}</div>
            {gameState.Gameover && (
              <p className="text-white mt-2">Punti: {gameState.dealer_score}</p>
            )}
          </section>

          {message && <p className="text-center text-yellow-400 mb-4">{message}</p>}

          {!gameState.Gameover ? (
            <div className="flex space-x-2 mb-4">
              <button onClick={() => playAction("hit")}    disabled={loading} className="flex-1 bg-green-600 py-2 rounded text-white hover:bg-green-700">Carta</button>
              <button onClick={() => playAction("stand")}  disabled={loading} className="flex-1 bg-red-600 py-2 rounded text-white hover:bg-red-700">Stai</button>
              <button onClick={() => playAction("double")} disabled={loading} className="flex-1 bg-yellow-600 py-2 rounded text-white hover:bg-yellow-700">Raddoppia</button>
              <button onClick={() => playAction("split")}  disabled={loading || !gameState.isSplit} className="flex-1 bg-blue-600 py-2 rounded text-white hover:bg-blue-700 disabled:opacity-50">Split</button>
            </div>
          ) : (
            <div className="flex space-x-2 mb-4">
              <button onClick={replay} disabled={loading} className="flex-1 bg-blue-600 py-2 rounded text-white hover:bg-blue-700">Rigioca</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
