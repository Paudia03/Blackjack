import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Blackjack({ onGameOver }) {
  const [gameState, setGameState] = useState(null);
  const [betInput, setBetInput]   = useState("");
  const [message, setMessage]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [showLowBalanceModal, setShowLowBalanceModal] = useState(false);

useEffect(() => {
  (async () => {
    try {
      await axios.post("/api/blackjack/init", {}, { withCredentials: true });
      notifyGameOver(true);
    } catch (err) {
      console.error("Init failed:", err);
    }
  })();

  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = "Sei sicuro di aggiornare la pagina? Perderai la mano.";
    notifyGameOver(true);
  };
  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, []);

  const notifyGameOver = (over) => onGameOver(over);

  const exitGame = () => {
    setGameState(null);
    setBetInput("");
    setMessage("");
    setLoading(false);
    notifyGameOver(true);
  };

  const initializeGame = async () => {
  setLoading(true);
  setMessage("");
  try {
    await axios.post("/api/blackjack/deck");
    await startGame();
  } catch (err) {
    setMessage("Errore inizializzazione mazzo");
  } finally {
    setLoading(false);
  }
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
      if (Array.isArray(data.dealer_cards)) {
        data.dealer_cards = data.dealer_cards.map(c => ({ ...c, isDealer: true }));
      }
      setGameState(data);
      setMessage(data.message || "");
      notifyGameOver(false);
    } catch (err) {
      const errMsg = err.response?.data?.message;
      if (errMsg === "Not enough money!") setShowLowBalanceModal(true);
      else setMessage(errMsg || "Errore avvio partita");
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
      if (Array.isArray(data.dealer_cards)) {
        data.dealer_cards = data.dealer_cards.map(c => ({ ...c, isDealer: true }));
      }
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
      await startGame();
    } catch {
      setMessage("Errore reset partita");
    } finally {
      setLoading(false);
    }
  };

  const renderCard = (card, idx) => {
    const isDealer = card.isDealer;
    const hidden = isDealer && idx === 1 && !gameState.Gameover;
    const src = hidden
      ? "/img/Playing Cards/PNG-cards-1.3/red_back.png"
      : `/img/Playing Cards/PNG-cards-1.3/${({ K:"king", Q:"queen", J:"jack", A:"ace" }[card.value] || card.value.toLowerCase())}_of_${card.suit.toLowerCase()}.png`;
    return <img key={idx} src={src} alt="" className="w-16 h-auto mx-1" />;
  };

  // Rendering player hands: single or split (even after gameover)
  const renderPlayerHands = () => {
    if (!gameState) return null;
    if (gameState.first_hand && gameState.second_hand) {
      return [gameState.first_hand, gameState.second_hand].map((handData, idx) => (
        <section key={idx} className="bg-gray-800 rounded shadow p-4 mb-6">
          <h2 className="text-xl text-white mb-2">Giocatore Mano {idx + 1}</h2>
          <div className="flex">
            {handData.cards.map((card, i) => renderCard({ ...card, isDealer: false }, i))}
          </div>
          <p className="text-white mt-2">Punti: {handData.score}</p>
        </section>
      ));
    }
    return (
      <section className="bg-gray-800 rounded shadow p-4 mb-6">
        <h2 className="text-xl text-white mb-2">Giocatore</h2>
        <div className="flex">
          {gameState.player_cards.map(renderCard)}
        </div>
        <p className="text-white mt-2">Punti: {gameState.player_score}</p>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {showLowBalanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-80 text-center">
            <h2 className="text-xl font-bold mb-4">Saldo Esaurito</h2>
            <p className="mb-6">Non hai credito sufficiente per giocare.</p>
            <div className="flex space-x-2">
              <button onClick={() => { setShowLowBalanceModal(false); exitGame(); }} className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700">Esci</button>
              <button onClick={() => { setShowLowBalanceModal(false); window.location.href = "/profile"; }} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Vai al Profilo</button>
            </div>
          </div>
        </div>
      )}

      <header className="flex justify-center mb-6 text-white">
        <h1 className="text-3xl font-bold">Tavolo</h1>
      </header>

      {!gameState ? (
        <div className="max-w-sm mx-auto bg-gray-800 p-6 rounded shadow">
          <label className="block text-gray-300 mb-2">Puntata:</label>
          <input type="number" value={betInput} onChange={e => setBetInput(e.target.value)} disabled={loading} className="w-full px-3 py-2 mb-4 bg-gray-700 border border-gray-600 rounded text-white" />
          <button onClick={initializeGame} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">{loading ? "Caricamento..." : "Inizia Partita"}</button>
          {message && <p className="text-red-500 mt-2">{message}</p>}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between mb-4 text-white">
            <span>Puntata: <strong>{gameState.your_bet}</strong></span>
            <span>Saldo: <strong>{gameState.your_balance}</strong></span>
            <span>Carte rimaste: <strong>{gameState.remaining_cards}</strong></span>
          </div>

          {renderPlayerHands()}

          <section className="bg-gray-800 rounded shadow p-4 mb-6">
            <h2 className="text-xl text-white mb-2">Banco</h2>
            <div className="flex">{gameState.dealer_cards.map(renderCard)}</div>
            {gameState.Gameover && <p className="text-white mt-2">Punti: {gameState.dealer_score}</p>}
          </section>

          {message && <p className="text-center text-yellow-400 mb-4">{message}</p>}

          {!gameState.Gameover ? (
            <div className="flex space-x-2 mb-4">
              <button onClick={() => playAction("hit")} disabled={loading} className="flex-1 bg-green-600 py-2 rounded text-white hover:bg-green-700">Carta</button>
              <button onClick={() => playAction("stand")} disabled={loading} className="flex-1 bg-red-600 py-2 rounded text-white hover:bg-red-700">Stai</button>
              <button onClick={() => playAction("double")} disabled={loading} className="flex-1 bg-yellow-600 py-2 rounded text-white hover:bg-yellow-700">Raddoppia</button>
              <button onClick={() => playAction("split")} disabled={loading || !gameState.Split_action} className="flex-1 bg-blue-600 py-2 rounded text-white hover:bg-blue-700 disabled:opacity-50">Split</button>
            </div>
          ) : (
            <div className="flex space-x-2 mb-4">
              <button onClick={replay} disabled={loading} className="flex-1 bg-blue-600 py-2 rounded text-white hover:bg-blue-700">Rigioca Puntata</button>
              <button onClick={exitGame} className="flex-1 bg-red-600 py-2.rounded text-white hover:bg-red-700">Cambia Puntata</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}