
export function CreateDeck() {
    const suits = ['Hearts', 'Clubs', 'Diamonds', 'Spades']; 
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']; 

    let deck = [];
    let final_deck = [];

    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }

    for (let i = 0; i < 6; i++) {
        final_deck = final_deck.concat(deck);
    }

    return final_deck;
}
export function ShuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

export function Value(card) {
  const val = card.value;
  if (val === 'A') return 11;
  if (['K', 'Q', 'J'].includes(val)) return 10;
  const parsed = parseInt(val);
  if (isNaN(parsed)) {
    console.warn("Valore carta non valido:", val);
    return 0;
  }
  return parsed;
}


export function Dealer_check(val){
    if ( val < 17) {
        return true;
    }
    else return false;
}

export function Win(yourscore, dealerscore, yourblackjack, dealerblackjack) {
    if (yourblackjack && !dealerblackjack) return 1; 
    if (!yourblackjack && dealerblackjack) return 3;
    if (yourblackjack && dealerblackjack) return 2;  

    if (yourscore > 21) return 3; 
    if (dealerscore > 21) return 1; 

    if (yourscore > dealerscore) return 1;
    if (yourscore < dealerscore) return 3;
    
    return 2; 
}



export function Payment(bet, blackjack){
    if (blackjack == true){
      return (bet * 5)/2;
    }
    else {
        return bet * 2;
    }
}

export function adjustForAces(hand, score) {
    let aces = hand.filter(card => card.value === "A").length;
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    return score;
  }
  

export function Splitchecker(card, card_2){
    if (card.value == card_2.value) {
        return true;
    }
    else return false;
}

