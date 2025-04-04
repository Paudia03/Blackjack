export function Bet(res) {
    console.log("Client asked to bet");
    res.json({ message: "You asked to bet" });
}

export function Split(res) {
    console.log("Client asked to split");
    res.json({ message: "You asked to split" });
}

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

export function Value(deck_card){
    let value;
    let card = deck_card.value;
    if (card == "J" || card == "Q" || card == "K" ) {
        value = 10;
    }
    else if (card == "A") {
        value = 11;
    }
    else {
        value = parseInt(card);
    }

    return value;
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

    if (yourscore > dealerscore && yourscore < 21) return 1;
    if (yourscore < dealerscore && dealerscore < 21) return 3;
    
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
