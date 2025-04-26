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
export function TestDeck(){
    return [
        { suit: "Spades", value: "A" },    // Dealer prima carta -> 11
        { suit: "Hearts", value: "8" },    // Player prima carta -> 8
        { suit: "Spades", value: "K" },    // Dealer seconda carta -> 10 -> dealer 21 (blackjack)
        { suit: "Hearts", value: "8" },    // Player seconda carta -> 8 -> player 16 (poi si splitta)
    
        // Split 1 - nuova carta
        { suit: "Clubs", value: "3" },     // Prima mano split -> 8 + 3 = 11
    
        // Split 2 - nuova carta
        { suit: "Diamonds", value: "3" },  // Seconda mano split -> 8 + 3 = 11
    
        // Draw per la prima mano split
        { suit: "Spades", value: "K" },    // 11 + 10 = 21
    
        // Draw per la seconda mano split
        { suit: "Spades", value: "9" },    // 11 + 9 = 20
    
        // Dealer pesca dopo split
        { suit: "Hearts", value: "5" },    // 21 + 5 = 26 -> bust dealer
    
        // Carte per test double
        { suit: "Diamonds", value: "5" },  // Player carta 5
        { suit: "Clubs", value: "6" },     // Player carta 6
        { suit: "Spades", value: "9" },    // Dealer prima carta
        { suit: "Hearts", value: "7" },    // Dealer seconda carta
    
        { suit: "Diamonds", value: "K" },  // Player draw dopo double
    
        // Carte per test bust player
        { suit: "Spades", value: "9" },    // Player carta 9
        { suit: "Diamonds", value: "8" },  // Player carta 8
        { suit: "Clubs", value: "5" },     // Player carta 5
    
        { suit: "Spades", value: "7" },    // Dealer carta 7
        { suit: "Hearts", value: "6" },    // Dealer carta 6
      ];
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

export function Splitchecker(card, card_2){
    if (card.value == card_2.value) {
        return true;
    }
    else return false;
}
