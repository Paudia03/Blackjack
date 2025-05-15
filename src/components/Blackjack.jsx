// src/components/Blackjack.jsx
import React, { useState } from "react";
import axios from "axios";

export default function Blackjack({ onGameOver }) {
  const [gameState, setGameState] = useState(null);
  const [betInput, setBetInput]   = useState("");
  const [message, setMessage]     = useState("");
  const [loading, setLoading]     = useState(false);

  // Quando il gioco finisce o si esce, notifico al genitore
  // se può aprire la navbar/drawer di nuovo
  const notifyGameOver = (over) => {
    onGameOver(over);
  };

  // Exit della partita: torno alla schermata di puntata
  const exitGame = () => {
    setGameState(null);
    setBetInput("");
    setMessage("");
    setLoading(false);
    notifyGameOver(true);
  };

  const startGame = async () => {
    const bet = parseFloat(betInput);
    if (isNaN(bet) || bet <= 0) {
      setMessage("Inserisci una puntata valida!");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const { data } = await axios.post("/api/blackjack/start", { bet });
      // aggiungo il flag isDealer alle carte del dealer
      data.dealer_cards = data.dealer_cards.map(c => ({ ...c, isDealer: true }));
      setGameState(data);
      setMessage(data.message || "");
      notifyGameOver(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Errore avvio partita");
    } finally {
      setLoading(false);
    }
  };

  const playAction = async (action) => {
    if (!gameState || gameState.Gameover) return;
    setLoading(true);
    setMessage("");
    try {
      const { data } = await axios.post("/api/blackjack/play", { action });
      data.dealer_cards = data.dealer_cards.map(c => ({ ...c, isDealer: true }));
      setGameState(data);
      setMessage(data.message || "");
      if (data.Gameover) notifyGameOver(true);
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
      //await axios.post("/api/blackjack/reset");
      await startGame();
    } catch {
      setMessage("Errore reset partita");
    } finally {
      setLoading(false);
    }
  };

  const renderCard = (card, idx) => {
    const isDealer = card.isDealer;
    const hidden   = isDealer && idx === 1 && !gameState.Gameover;
    const src = hidden
      ? "/img/Playing Cards/PNG-cards-1.3/red_back.png"
      : `/img/Playing Cards/PNG-cards-1.3/${(  
          { K:"king", Q:"queen", J:"jack", A:"ace" }[card.value] || card.value.toLowerCase()
        )}_of_${card.suit.toLowerCase()}.png`;
    return <img key={idx} src={src} alt="" className="w-16 h-auto mx-1" />;
  };

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
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {/* Info puntata/saldo/carte rimaste */}
          <div className="flex justify-between mb-4 text-white">
            <span>Puntata: <strong>{gameState.your_bet}</strong></span>
            <span>Saldo: <strong>{gameState.your_balance}</strong></span>
            <span>Carte rimaste: <strong>{gameState.remaining_cards}</strong></span>
          </div>

          {/* Mano giocatore */}
          <section className="bg-gray-800 rounded shadow p-4 mb-6">
            <h2 className="text-xl text-white mb-2">Giocatore</h2>
            <div className="flex">{gameState.player_cards.map(renderCard)}</div>
            <p className="text-white mt-2">Punti: {gameState.player_score}</p>
          </section>

          {/* Mano dealer */}
          <section className="bg-gray-800 rounded shadow p-4 mb-6">
            <h2 className="text-xl text-white mb-2">Banco</h2>
            <div className="flex">{gameState.dealer_cards.map(renderCard)}</div>
            {gameState.Gameover && (
              <p className="text-white mt-2">Punti: {gameState.dealer_score}</p>
            )}
          </section>

          {message && <p className="text-center text-yellow-400 mb-4">{message}</p>}

          {/* Bottoni di azione */}
          {!gameState.Gameover ? (
            <div className="flex space-x-2 mb-4">
              <button onClick={() => playAction("hit")}    disabled={loading} className="flex-1 bg-green-600 py-2 rounded text-white hover:bg-green-700">Carta</button>
              <button onClick={() => playAction("stand")}  disabled={loading} className="flex-1 bg-red-600 py-2 rounded text-white hover:bg-red-700">Stai</button>
              <button onClick={() => playAction("double")} disabled={loading} className="flex-1 bg-yellow-600 py-2 rounded text-white hover:bg-yellow-700">Raddoppia</button>
              <button onClick={() => playAction("split")}  disabled={loading || !gameState.Split_action} className="flex-1 bg-blue-600 py-2 rounded text-white hover:bg-blue-700 disabled:opacity-50">Split</button>
            </div>
          ) : (
            <div className="flex space-x-2 mb-4">
              <button onClick={replay} disabled={loading} className="flex-1 bg-blue-600 py-2 rounded text-white hover:bg-blue-700">Rigioca Puntata</button>
              <button onClick={exitGame} className="flex-1 bg-red-600 py-2 rounded text-white hover:bg-red-700">Cambia Puntata</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
