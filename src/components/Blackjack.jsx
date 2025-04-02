import React, { useState } from 'react';

function Blackjack({ user }) {
  // Stato per la partita, il messaggio di feedback e la puntata iniziale
  const [gameState, setGameState] = useState(null);
  const [message, setMessage] = useState('');
  const [bet, setBet] = useState('');

  // Funzione per avviare una nuova partita
  const startGame = () => {
    const betAmount = parseFloat(bet);
    if (isNaN(betAmount) || betAmount <= 0) {
      setMessage("Inserisci una puntata valida!");
      return;
    }
    // Simula l'inizio della partita con una mano iniziale
    setGameState({
      id: Date.now(),
      bet: betAmount,
      // playerHands è un array di mani (per supportare eventuali split)
      playerHands: [
        {
          cards: [
            { rank: '8', suit: 'Cuori' },
            { rank: '8', suit: 'Fiori' } // Due carte uguali per poter splittare
          ],
          doubled: false,
          stand: false
        }
      ],
      dealerCards: [
        { rank: 'K', suit: 'Quadri' },
        { rank: '?', suit: '?' } // Carta nascosta
      ],
      status: 'In corso'
    });
    setMessage('');
  };

  // Funzione per chiedere una carta (hit) sulla mano indicata
  const hit = (handIndex = 0) => {
    setGameState(prev => {
      const newPlayerHands = [...prev.playerHands];
      // Simula l'estrazione di una nuova carta
      newPlayerHands[handIndex].cards.push({ rank: '5', suit: 'Picche' });
      return { ...prev, playerHands: newPlayerHands };
    });
  };

  // Funzione per fermarsi (stand) su una mano
  const stand = (handIndex = 0) => {
    setGameState(prev => {
      const newPlayerHands = [...prev.playerHands];
      newPlayerHands[handIndex].stand = true;
      return { ...prev, playerHands: newPlayerHands, status: 'Mano completata' };
    });
  };

  // Funzione per raddoppiare (double down)
  const doubleDown = (handIndex = 0) => {
    setGameState(prev => {
      const newPlayerHands = [...prev.playerHands];
      // Imposta lo stato di double down per quella mano
      newPlayerHands[handIndex].doubled = true;
      // Aggiungi una sola carta alla mano
      newPlayerHands[handIndex].cards.push({ rank: '7', suit: 'Cuori' });
      // Dopo il raddoppio il giocatore non può chiedere altre carte
      newPlayerHands[handIndex].stand = true;
      return { ...prev, playerHands: newPlayerHands, status: 'Double Down completato' };
    });
  };

  // Funzione per splittare una mano
  const splitHand = (handIndex = 0) => {
    setGameState(prev => {
      const newPlayerHands = [...prev.playerHands];
      const handToSplit = newPlayerHands[handIndex];
      // Verifica se le prime due carte hanno lo stesso valore per poter splittare
      if (handToSplit.cards.length === 2 && handToSplit.cards[0].rank === handToSplit.cards[1].rank) {
        // Crea due mani separate, ognuna con una delle carte originali e una nuova carta simulata
        const hand1 = { cards: [handToSplit.cards[0], { rank: '4', suit: 'Quadri' }], doubled: false, stand: false };
        const hand2 = { cards: [handToSplit.cards[1], { rank: '9', suit: 'Fiori' }], doubled: false, stand: false };
        // Sostituisci la mano originale con le due nuove mani
        newPlayerHands.splice(handIndex, 1, hand1, hand2);
        return { ...prev, playerHands: newPlayerHands, status: 'Split completato' };
      } else {
        setMessage("La mano non può essere splittata");
        return prev;
      }
    });
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
          <button className="btn btn-primary" onClick={startGame}>Inizia Nuova Partita</button>
        </div>
      ) : (
        <div>
          <h3>Mano del Giocatore</h3>
          {gameState.playerHands.map((hand, index) => (
            <div key={index} className="card mb-3" style={{ padding: '10px' }}>
              <h5>Mano {index + 1} {hand.doubled && "(Raddoppiato)"}</h5>
              <div className="d-flex mb-2">
                {hand.cards.map((card, i) => (
                  <div key={i} className="border p-2 me-2">
                    {card.rank} di {card.suit}
                  </div>
                ))}
              </div>
              {!hand.stand && (
                <div>
                  <button className="btn btn-secondary me-2" onClick={() => hit(index)}>Chiedi Carta (Hit)</button>
                  <button className="btn btn-secondary me-2" onClick={() => stand(index)}>Stai (Stand)</button>
                  <button className="btn btn-warning me-2" onClick={() => doubleDown(index)}>Raddoppia (Double Down)</button>
                  {/* Mostra Split solo se le prime due carte sono uguali */}
                  {hand.cards.length === 2 && hand.cards[0].rank === hand.cards[1].rank && (
                    <button className="btn btn-info" onClick={() => splitHand(index)}>Split</button>
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
