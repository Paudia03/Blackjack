import React, { useState } from "react";
import axios from "axios";

function Blackjack({ setGameActive, setUser }) {
  const [gameState, setGameState] = useState(null);
  const [message, setMessage] = useState("");
  const [bet, setBet] = useState("");
  const [balance, setBalance] = useState(100000000); // initial credit

  // Start a new game via API
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
      console.error(error);
      setMessage("Errore durante l'inizio della partita");
    }
  };

  // Hit action: draw a new card
  const hit = async () => {
    try {
      // Only allow actions if game is not over
      if (gameState.gameOver) return;
      const response = await axios.post("http://localhost:3000/api/blackjack/play", { action: "hit" });
      setGameState(response.data);
      if (response.data.message === "Out of bounds") {
        setMessage("Hai sballato! 😵");
      }
    } catch (error) {
      console.error(error);
      setMessage("Errore nel pescare una carta");
    }
  };

  // Stand action: stop drawing cards
  const stand = async () => {
    try {
      if (gameState.gameOver) return;
      const response = await axios.post("http://localhost:3000/api/blackjack/play", { action: "stand" });
      setGameState(response.data);
      setMessage(response.data.message);
      setBalance(response.data.your_balance);
    } catch (error) {
      console.error(error);
      setMessage("Errore nell'azione Stand");
    }
  };

  // Double Down action
  const doubleDown = async () => {
    try {
      if (gameState.gameOver) return;
      const response = await axios.post("http://localhost:3000/api/blackjack/play", { action: "double" });
      setGameState(response.data);
      setMessage("Double Down effettuato");
      setBalance(response.data.your_balance);
    } catch (error) {
      console.error(error);
      setMessage("Errore durante il raddoppio");
    }
  };

  // Split action: allowed only if the first two cards have the same rank
  const splitHand = async () => {
    try {
      if (gameState.gameOver) return;
      if (gameState && gameState.playerHands && gameState.playerHands[0].cards.length === 2) {
        const [card1, card2] = gameState.playerHands[0].cards;
        if (card1.rank !== card2.rank) {
          setMessage("Lo split non è possibile: le carte non sono uguali");
          return;
        }
      } else {
        setMessage("Split non disponibile");
        return;
      }
      const response = await axios.post("http://localhost:3000/api/blackjack/play", { action: "split" });
      setGameState(response.data);
      setMessage("Split effettuato");
      setBalance(response.data.your_balance);
    } catch (error) {
      console.error(error);
      setMessage("Errore durante lo split");
    }
  };

  // Replay game: reset the current game state (without altering the credit)
  const replayGame = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/blackjack/reset");
      setGameState(null);
      setBet("");
      setMessage(response.data.message || "Gioco resettato. Inserisci una nuova puntata.");
    } catch (error) {
      console.error(error);
      setMessage("Errore nel reset del gioco");
    }
  };

  // Exit game: return to the profile page
  const exitGame = () => {
    // Navigate back to the profile page using parent's function if provided
    if (typeof setGameActive === "function") {
      setGameActive(false);
    } else {
      // Otherwise, simulate exit by resetting the game state and logging out the user.
      setGameState(null);
      setBet("");
      setMessage("");
      if (typeof setUser === "function") {
        setUser(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Blackjack</h2>
        <p className="text-white">Credito: {balance}</p>
      </div>

      {!gameState ? (
        // Start game screen
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
          <div className="mt-4 flex justify-between">
            <button onClick={exitGame} className="w-1/2 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
              Esci
            </button>
          </div>
        </div>
      ) : (
        // Game screen
        <div className="max-w-4xl mx-auto">
          {/* If game is not over, show action buttons; disable actions when game is over */}
          {!gameState.gameOver ? (
            <div className="flex flex-col mb-4">
              <div className="flex justify-between items-center mb-4">
                <div className="space-x-2">
                  <button onClick={hit} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition">
                    Carta 🃏
                  </button>
                  <button onClick={stand} className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition">
                    Stare ✋
                  </button>
                  <button onClick={doubleDown} className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 transition">
                    Raddoppio
                  </button>
                  <button onClick={splitHand} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
                    Split
                  </button>
                </div>
              </div>
              {/* Replay button always visible during an active game */}
              <div className="mt-4">
                <button onClick={replayGame} className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition">
                  Rigioca (Reset)
                </button>
              </div>
            </div>
          ) : (
            // When game is over, only show Replay and Exit buttons
            <div className="flex justify-between mt-4">
              <button onClick={replayGame} className="w-1/2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mr-2">
                Rigioca
              </button>
              <button onClick={exitGame} className="w-1/2 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition ml-2">
                Esci
              </button>
            </div>
          )}

          {/* Display player's cards */}
          <div className="bg-gray-800 rounded shadow p-4 mb-6">
            <h4 className="text-xl font-bold text-white mb-2">Carte del Giocatore:</h4>
            <div className="flex space-x-4">
              {(gameState.your_cards || (gameState.playerHands && gameState.playerHands[0].cards))?.map((card, i) => (
                <div key={i} className="border border-gray-600 rounded p-2 bg-gray-700">
                  <p className="font-bold text-white">{card.rank}</p>
                  <p className="text-gray-300">{card.suit}</p>
                </div>
              ))}
            </div>
            {gameState.your_score && <p className="text-white mt-2">Punteggio: {gameState.your_score}</p>}
          </div>

          {/* Display dealer's cards */}
          <div className="bg-gray-800 rounded shadow p-4 mb-6">
            <h4 className="text-xl font-bold text-white mb-2">Carte del Dealer:</h4>
            <div className="flex space-x-4">
              {gameState.gameOver
                ? // If game is over, show all dealer cards
                  gameState.dealer_cards?.map((card, i) => (
                    <div key={i} className="border border-gray-600 rounded p-2 bg-gray-700">
                      <p className="font-bold text-white">{card.rank}</p>
                      <p className="text-gray-300">{card.suit}</p>
                    </div>
                  ))
                : // If game is active, show only the first dealer card and hide the rest
                  gameState.dealer_cards && gameState.dealer_cards.length > 0 && (
                    <div className="border border-gray-600 rounded p-2 bg-gray-700">
                      <p className="font-bold text-white">{gameState.dealer_cards[0].rank}</p>
                      <p className="text-gray-300">{gameState.dealer_cards[0].suit}</p>
                    </div>
                  )}
            </div>
            {gameState.dealer_score && gameState.gameOver && (
              <p className="text-white mt-2">Punteggio: {gameState.dealer_score}</p>
            )}
          </div>

          {message && <p className="text-center text-red-500 mt-4">{message}</p>}
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-white">Credito: {balance}</p>
      </div>
    </div>
  );
}

export default Blackjack;
