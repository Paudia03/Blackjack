import express, { json } from "express";
import cors from "cors";
import morgan from "morgan";
import { Bet, Split, CreateDeck, ShuffleDeck, Value, Dealer_check, Win, Payment} from './functions.js';

const PORT = 3000;
const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(json());


let deck = [];
let shuffled = [];
let dealer_card = null;
let player_card = null;
let dealer_second_card = null;
let player_second_card = null;
let dealer_next_card = null;
let player_next_card = null;
let player_score = 0;
let dealer_score = 0;
let dealer_cards = [];
let player_cards = [];
let player_blackjack = false;
let dealer_blackjack = false;
let balance = 100000000;
let player_bet = 0;

deck = CreateDeck();
shuffled = ShuffleDeck(deck);


app.post("/api/blackjack/start", (req, res) => {
    const { bet } = req.body;
    if (!bet || bet <= 0) {
        return res.status(400).json({ message: "La puntata deve essere maggiore di 0!" });
    }

    if (bet > balance) {
        return res.status(400).json({ message: "Saldo insufficiente!" });
    }
    else {
        player_bet = bet;
        balance -= bet;
        dealer_cards = [];
        player_cards = []; 
        dealer_card = shuffled.shift();
        player_card = shuffled.shift();
        dealer_second_card = shuffled.shift();
        player_second_card = shuffled.shift();
        dealer_cards.push(dealer_card);
        dealer_cards.push(dealer_second_card);
        player_cards.push(player_card);
        player_cards.push(player_second_card);
        dealer_blackjack=false;
        player_blackjack=false;


        const dealer_first_value = Value(dealer_card);
        const player_first_value = Value(player_card);
        const dealer_second_value = Value(dealer_second_card);
        const player_second_value = Value(player_second_card);

        player_score = player_first_value + player_second_value;
        dealer_score = dealer_first_value + dealer_second_value;

        res.json({
            your_bet: player_bet,
            your_balance: balance,
            dealer_card: dealer_card, 
            player_card: player_card, 
            player_second_card: player_second_card,
            your_score: player_score
        });

        console.log(`Remaining cards: ${shuffled.length}`);
        console.log(`Dealer's first card: ${JSON.stringify(dealer_card)}`);
        console.log(`Dealer's second card: ${JSON.stringify(dealer_second_card)}`);
        console.log(`Dealer score: ${dealer_score}`);
    }
    
});

app.post("/api/blackjack/play", (req, res) => {
    const { action } = req.body; 

    switch(action) {
        case 'stand':
            const responseData = {
                message: "",
                dealer_cards: dealer_cards,
                dealer_score: dealer_score,
                your_score: player_score,
                your_balance: balance,
                remaining_cards: shuffled.length
            };
            while (Dealer_check(dealer_score)) {
                dealer_next_card = shuffled.shift();  
                dealer_cards.push(dealer_next_card);  
                let dealer_next_value = Value(dealer_next_card);  
                dealer_score += dealer_next_value; 
                for (let card of dealer_cards) {  
                    if (card.value === "A" && dealer_score > 21) {
                        dealer_score -= 10;  
                    }
                }
                if (dealer_score == 21){
                    if (dealer_cards.length == 2){
                        dealer_blackjack=true;
                    }
                }
                
                if (player_score == 21){
                    if (player_cards.length == 2){
                        player_blackjack =true;
                    }
                } 

                if (dealer_score > 21) {
                    responseData.message = "Dealer's score exceeded 21. You Won!";
                    responseData.dealer_score = dealer_score;
                    responseData.remaining_cards = shuffled.length;
                    return res.json(responseData);
                }
            }
            const result = Win(player_score, dealer_score, player_blackjack, dealer_blackjack);
            switch (result) {
                case 1:
                    responseData.message = "You Won!";
                    let payout = Payment(player_bet, player_blackjack); 
                    console.log(`Pagamento dovuto: ${payout}`); // DEBUG
                    balance += payout;
                    responseData.your_balance = balance;
                    console.log(`Nuovo balance: ${balance}`); // DEBUG
                    break;
                case 2:
                    responseData.message = "Tie!";
                    balance += player_bet;
                    responseData.your_balance = balance;
                    break;
                case 3:
                    responseData.message = "You Lost!";
                    responseData.your_balance = balance;
                    break;
                default:
                    responseData.message = "Unexpected result";
            }
            console.log(`Remaining cards: ${shuffled.length}`);
            responseData.dealer_score = dealer_score;
            responseData.remaining_cards = shuffled.length;
            return res.json(responseData);

        case 'hit':
            if (player_score <= 21) {
                player_next_card = shuffled.shift();
                player_cards.push(player_next_card); 
                let player_next_value = Value(player_next_card);
                player_score += player_next_value;  
                for (let card of player_cards) {  
                    if (card.value === "A" && player_score > 21) {
                        player_score -= 10;  
                    }
                }
                
                if (player_score > 21) {
                    
                    return res.json({ 
                        your_cards: player_cards,
                        your_score: player_score,
                        message: "Out of bounds"
                    });
                }

                res.json({
                    your_cards: player_cards,
                    your_score: player_score
                });

                console.log(`Remaining cards: ${shuffled.length}`);
            } else {
                res.json({ message: "Out of bounds" });
            }
            break;

        default:
            res.json({ message: "Azione non valida" });
    }
});


app.post("/api/data", (req, res) => {
    const { code } = req.body; 

    console.log("Dato ricevuto:", code); 
    switch(code) {
        case 0:
            Bet(res);
            break;
        case 1:
            Split(res);
            break;
        default:
            res.json({ message: "Dato non riconosciuto", received: code });
    }
});

app.post("/api/blackjack/reset", (req, res) => {
    deck = [];
    shuffled = [];
    dealer_card = null;
    player_card = null;
    dealer_second_card = null;
    player_second_card = null;
    player_next_card = null;
    player_score = 0;
    dealer_score = 0;
    dealer_cards = [];
    player_cards = [];
    dealer_blackjack=false;
    player_blackjack=false;
    player_bet=0;

    res.json({ message: "Gioco resettato con successo" });

    console.log("Il gioco è stato resettato!");
});

app.listen(PORT, () => console.log(`Il server è in ascolto sulla porta ${PORT}`));

