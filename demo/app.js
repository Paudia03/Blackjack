import express, { json } from "express";
import cors from "cors";
import morgan from "morgan";
import {
  TestDeck,
  CreateDeck,
  ShuffleDeck,
  Value,
  Dealer_check,
  Win,
  Payment,
  Splitchecker
} from "./functions.js";
import connection from "./db_connection.js";

const PORT = 3000;
const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(json());

// Game state variables
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
let split_bet = 0;
let GameOver = true;
let Split_action = false;
let split_hand = [];
let split_second_hand = [];
let split_score_1 = 0;
let split_score_2 = 0;
let current_split = 1;
let isSplit = false;
let dealer_first_value = 0;

// Use a test deck for development
shuffled = TestDeck();

let responseData = {
  message: "",
  dealer_cards: [],
  dealer_score: 0,
  dealer_first_card_value: 0,
  player_cards: [],
  player_score: 0,
  your_balance: 100000000,
  your_bet: 0,
  remaining_cards: 0,
  Gameover: true,
  isSplit: false,
  first_hand: null,
  second_hand: null,
  active_hand: null,
  split_bet: 0,
  dealer_blackjack: false,
  player_blackjack: false
};

// Update all responseData fields safely
function updateResponseData() {
  responseData.remaining_cards = shuffled.length;

  // Guard against null dealer_card
  if (dealer_card) {
    responseData.dealer_first_card_value = Value(dealer_card);
  } else {
    responseData.dealer_first_card_value = 0;
  }

  // Set scores/defaults
  responseData.dealer_score     = dealer_score || 0;
  responseData.player_score     = player_score || 0;
  responseData.your_balance     = balance;
  responseData.dealer_cards     = dealer_cards || [];
  responseData.player_cards     = player_cards || [];
  responseData.Gameover         = GameOver;
  
  // Split state
  responseData.first_hand       = isSplit ? { cards: split_hand,       score: split_score_1 } : null;
  responseData.second_hand      = isSplit ? { cards: split_second_hand, score: split_score_2 } : null;
  responseData.active_hand      = isSplit ? current_split : null;
  responseData.isSplit          = isSplit;
  responseData.split_bet        = split_bet;

  responseData.dealer_blackjack = dealer_blackjack;
  responseData.player_blackjack = player_blackjack;
}

app.post("/api/blackjack/start", (req, res) => {
  const { bet } = req.body;
  if (!bet || bet <= 0) {
    return res.status(400).json({ message: "La puntata deve essere maggiore di 0!" });
  }
  if (bet > balance) {
    return res.status(400).json({ message: "Saldo insufficiente!" });
  }
  if (shuffled.length < 4) {
    return res.status(400).json({ message: "No more cards in the deck." });
  }

  GameOver        = false;
  player_bet      = bet;
  balance        -= bet;
  dealer_cards    = [];
  player_cards    = [];
  split_hand      = [];
  split_second_hand = [];
  dealer_card     = shuffled.shift();
  player_card     = shuffled.shift();
  dealer_second_card = shuffled.shift();
  player_second_card = shuffled.shift();
  dealer_cards.push(dealer_card, dealer_second_card);
  player_cards.push(player_card, player_second_card);
  dealer_blackjack = false;
  player_blackjack = false;
  Split_action     = Splitchecker(player_card, player_second_card);
  dealer_first_value = Value(dealer_card);

  const player_first_value = Value(player_card);
  const dealer_second_value = Value(dealer_second_card);
  const player_second_value = Value(player_second_card);

  player_score = player_first_value + player_second_value;
  dealer_score = dealer_first_value + dealer_second_value;

  updateResponseData();
  return res.json(responseData);
});

app.post("/api/blackjack/play", (req, res) => {
  const { action } = req.body;

  switch (action) {
    case "stand":
      if (isSplit) {
        if (current_split === 1) {
          current_split = 2;
          responseData.message = "Go on with the second hand";
          updateResponseData();
        } else {
          while (shuffled.length > 0 && Dealer_check(dealer_score)) {
            dealer_next_card = shuffled.shift();
            dealer_cards.push(dealer_next_card);
            dealer_score += Value(dealer_next_card);
            for (let card of dealer_cards) {
              if (card.value === "A" && dealer_score > 21) {
                dealer_score -= 10;
              }
            }
          }
          // Evaluate both hands...
          let result1 = Win(split_score_1, dealer_score, false, dealer_blackjack);
          let result2 = Win(split_score_2, dealer_score, false, dealer_blackjack);
          let msgs = [];
          if (result1 === 1) { balance += Payment(player_bet, false); msgs.push("First hand: Win!"); }
          else if (result1 === 2) { balance += player_bet;            msgs.push("First hand: Tie."); }
          else msgs.push("First hand: Lost.");
          if (result2 === 1) { balance += Payment(split_bet, false); msgs.push("Second hand: Win!"); }
          else if (result2 === 2) { balance += split_bet;            msgs.push("Second hand: Tie."); }
          else msgs.push("Second hand: Lost.");

          GameOver = true;
          isSplit  = false;
          responseData.message = msgs.join(" ");
          updateResponseData();
        }
      } else {
        if (dealer_score === 21 && dealer_cards.length === 2) dealer_blackjack = true;
        if (player_score === 21 && player_cards.length === 2) player_blackjack = true;
        while (shuffled.length > 0 && Dealer_check(dealer_score)) {
          dealer_next_card = shuffled.shift();
          dealer_cards.push(dealer_next_card);
          dealer_score += Value(dealer_next_card);
          for (let card of dealer_cards) {
            if (card.value === "A" && dealer_score > 21) dealer_score -= 10;
          }
        }
        const result = Win(player_score, dealer_score, player_blackjack, dealer_blackjack);
        switch (result) {
          case 1: balance += Payment(player_bet, player_blackjack); responseData.message = "You Won!"; break;
          case 2: balance += player_bet;                             responseData.message = "Tie!";      break;
          case 3:                                                     responseData.message = "You Lost!"; break;
        }
        GameOver = true;
        updateResponseData();
      }
      break;

    case "hit":
      // similar structure with updateResponseData() calls...
      // (omitted for brevity—apply same null-safety pattern)
      break;

    case "double":
      // double logic + updateResponseData()
      break;

    case "split":
      // split logic + updateResponseData()
      break;
  }

  return res.json(responseData);
});

app.post("/api/blackjack/reset", (req, res) => {
  // reset all variables...
  GameOver = true;
  // ...
  responseData.message = "Reset successful";
  updateResponseData();
  return res.json(responseData);
});

app.listen(PORT, () => console.log(`Server is online on port: ${PORT}`));
