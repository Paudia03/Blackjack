import express, { json } from "express";
import cors from "cors";
import morgan from "morgan";
import { TestDeck, CreateDeck, ShuffleDeck, Value, Dealer_check, Win, Payment, Splitchecker, adjustForAces } from './functions.js';
import connection from "./db_connection.js";
import crypto from 'crypto';
import validator from "validator";
import nodemailer from 'nodemailer';

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
const pendingVerifications = new Map();
let IsLogged = null;


deck = CreateDeck();
shuffled = ShuffleDeck(deck);
// shuffled = TestDeck(); // usare SOLO per test

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'blackjackunipr@gmail.com',
      pass: 'yovrzqgeendusqja'
    }
  });

  function generate6DigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateShortID() {
    return crypto.randomBytes(8).toString('hex');
  }

function checkAndReshuffleDeck() {
    if (shuffled.length < 10) {
        deck = CreateDeck();
        shuffled = ShuffleDeck(deck);
        console.log("Deck reshuffled automatically.");
    }
}

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
    player_blackjack: false,
};

function updateResponseData() {
    responseData.remaining_cards = shuffled.length;
    responseData.dealer_first_card_value = dealer_cards.length > 0 ? Value(dealer_cards[0]) : 0;
    responseData.dealer_score = dealer_score;
    responseData.player_score = player_score;
    responseData.your_balance = balance;
    responseData.dealer_cards = dealer_cards;
    responseData.player_cards = player_cards;
    responseData.Gameover = GameOver;
    responseData.first_hand = isSplit ? { cards: split_hand, score: split_score_1 } : null;
    responseData.second_hand = isSplit ? { cards: split_second_hand, score: split_score_2 } : null;
    responseData.active_hand = isSplit ? current_split : null;
    responseData.isSplit = isSplit;
    responseData.split_bet = split_bet;
    responseData.dealer_blackjack = dealer_blackjack;
    responseData.player_blackjack = player_blackjack;
}

app.post("/api/blackjack/signup", (req, res) => {
    const {email, username, password, repeat_password } = req.body;

    if (!validator.isEmail(email)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid email format." 
        });
    }

    if (password !== repeat_password) {
        return res.status(400).json({ 
            success: false, 
            message: "The two passwords don't match." 
        });
    }

    const checkSql = "SELECT * FROM user WHERE email = ? OR username = ?";
    connection.query(checkSql, [email, username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Database error while checking existing users."
            });
        }

        if (results.length > 0) {
            const duplicateField = results.find(user => user.email === email) ? 'Email' : 'Username';
            return res.status(409).json({
                success: false,
                message: `${duplicateField} already in use.`
            });
        }
        else {
            let code = generate6DigitCode();
            pendingVerifications.set(email, {
                username,
                password,
                code
            });
            const mailOptions = {
                from: 'blackjackunipr@gmail.com',
                to: email,
                subject: 'Your Authentication code',
                text: `Hi ${username},

Thank you for signing up for Blackjack Unipr!

To complete your registration, please enter the following 6-digit verification code:

${code}

This code is valid forever and is required to activate your account.

If you didn't request this, please ignore this message.

Best regards,  
The Blackjack Unipr Team`

            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  return console.log(error);
                }
                console.log('Email sent: ' + info.response);
            });

            return res.status(201).json({ 
                success: true,
                message: "Almost there. Submit the authentication code you received.",
                user: {
                    username: username,
                    email: email
                }
            });
        }
    });

});

app.post("/api/blackjack/authentication", (req, res) => {
    const { email, code } = req.body;

    const pending = pendingVerifications.get(email);

    if (!pending) {
        return res.status(400).json({
            success: false,
            message: "No pending verification found for this email."
        });
    }

    if (pending.code !== code) {
        return res.status(401).json({
            success: false,
            message: "Invalid verification code."
        });
    }

    const userId = generateShortID();
    const sql = "INSERT INTO user (user_id, username, password, wallet, games_won, games_played, email) VALUES (?, ?, ?, ?, ?, ?, ?)";

    connection.query(sql, [userId, pending.username, pending.password, 0, 0, 0, email], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Database error. User could not be created."
            });
        }

        const mailOptions2 = {
            from: 'blackjackunipr@gmail.com',
            to: email,
            subject: '🎉 Welcome to Blackjack Unipr!',
            text: `Hi ${pending.username},
        
Your account has been successfully created — welcome aboard!

You can now log in and start playing Blackjack on our platform.
We're excited to have you as part of the Blackjack Unipr community.

If you ever have questions, feedback, or need help, feel free to reach out.

Good luck, and may the cards be ever in your favor! 🃏

Cheers,  
The Blackjack Unipr Team`

        };

        transporter.sendMail(mailOptions2, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log('Second Email sent: ' + info.response);
        });

        pendingVerifications.delete(email);

        return res.status(201).json({
            success: true,
            message: "User created successfully.",
            user: {
                id: userId,
                username: pending.username,
                email: email
            }
        });
    });
});

app.post("/api/blackjack/login", (req, res) => {

    const {identifier, password} = req.body;
    const LoginQuery = "SELECT user_id, username, password, wallet FROM user WHERE email = ? OR username = ?";
    connection.query(LoginQuery, [identifier, identifier], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
    
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "User not found." });
        }
    
        const real_password = results[0].password;
        if (password == real_password){
            balance = results[0].wallet;
            IsLogged = results[0].user_id;
            return res.status(201).json({
                success: true,
                message: "Login successful.",
                user: {
                    username: results[0].username,
                    balance: balance
                }
            });
        }
        else return res.status(500).json({
            success: false,
            message: `wrong username or password`
        });
    });

});

app.post("/api/blackjack/logout", (req, res) => {
    IsLogged = null;
    return res.status(200).json({ success: true, message: "Logout successful" });
});

app.post("/api/blackjack/passwordreset", (req, res)=> {
    const{password_tochange}=req.body;
    if (IsLogged != null){
        const ResetQuery = "SELECT username, email, password FROM user WHERE user_id = ?";
        connection.query(ResetQuery, [IsLogged], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Database error." });
            }
            if (password_tochange == results[0].password){
                let reset_code = generate6DigitCode();
                pendingVerifications.set(results[0].email, {
                    username: results[0].username,
                    password: results[0].password,
                    reset_code
                });
                const mailOptions3 = {
                    from: 'blackjackunipr@gmail.com',
                    to: results[0].email,
                    subject: 'Password Reset',
                    text: `Hi ${results[0].username},
    
    We're sorry that you lost your password :(
    
    To complete your password reset, please enter the following 6-digit verification code:
    
    ${reset_code}
    
    This code is valid forever and is required to reset your password.
    
    If you didn't request this, please ignore this message.
    
    Best regards,  
    The Blackjack Unipr Team`
    
                };
    
                transporter.sendMail(mailOptions3, (error, info) => {
                    if (error) {
                      return console.log(error);
                    }
                    console.log('Password Reset Email sent: ' + info.response);
                });
    
                return res.status(201).json({ 
                    success: true,
                    message: "Almost there. Submit the authentication code you received.",
                    user: {
                        username: results[0].username,
                        email: results[0].email
                    }
                });
            }
            else return res.status(401).json({ success: false, message: "Wrong Password." });
        });
    }
});

app.post("/api/blackjack/confirmreset", (req, res) => {
    const { email, reset_code, new_password } = req.body;

    const pending = pendingVerifications.get(email);

    if (!pending) {
        return res.status(400).json({
            success: false,
            message: "No pending verification found for this email."
        });
    }

    if (pending.reset_code !== reset_code) {
        return res.status(401).json({
            success: false,
            message: "Invalid verification code."
        });
    }
    const updatePasswordQuery = "UPDATE user SET password = ? WHERE user_id = ?";

    connection.query(updatePasswordQuery, [new_password, IsLogged], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        return res.status(200).json({ success: true, message: "Password updated successfully." });
    });

    const mailOptions4 = {
        from: 'blackjackunipr@gmail.com',
        to: email,
        subject: 'Password Reset',
        text: `Hi ${pending.username},

Your password has been reset successfully and you are now able to play!

Please, try to remember it from now on. Write it somewhere, or maybe get it tattooed on your body :)

Best regards,  
The Blackjack Unipr Team`

    };

    transporter.sendMail(mailOptions4, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Second Password Reset Email sent: ' + info.response);
    });

    pendingVerifications.delete(email);

    return res.status(201).json({ 
        success: true,
        message: "Password reset succesfully.",
        user: {
            username: results[0].username,
            email: results[0].email
        }
    });
    
});

app.post("/api/blackjack/start", (req, res) => {
    if (IsLogged != null){
        return res.status(400).json({ message: "No user is playing" });
    }
    else {
        checkAndReshuffleDeck();
        const { bet } = req.body;
        if (!bet || bet <= 0) return res.status(400).json({ message: "Place a bet before starting" });
        if (bet > balance) return res.status(400).json({ message: "Not enough money!" });
    
        if (GameOver) {
            Split_action = false;
            GameOver = false;
            player_bet = bet;
            balance -= bet;
            dealer_cards = [];
            player_cards = [];
            split_hand = [];
            split_second_hand = [];
            dealer_card = shuffled.shift();
            player_card = shuffled.shift();
            dealer_second_card = shuffled.shift();
            player_second_card = shuffled.shift();
            dealer_cards.push(dealer_card, dealer_second_card);
            player_cards.push(player_card, player_second_card);
            dealer_blackjack = false;
            player_blackjack = false;
            Split_action = Splitchecker(player_card, player_second_card);
            dealer_first_value = Value(dealer_card);
            const player_first_value = Value(player_card);
            const dealer_second_value = Value(dealer_second_card);
            const player_second_value = Value(player_second_card);
            player_score = player_first_value + player_second_value;
            dealer_score = dealer_first_value + dealer_second_value;
            player_blackjack = (player_score === 21);
            dealer_blackjack = (dealer_score === 21);
            if (player_blackjack || dealer_blackjack) {
                if (player_blackjack && !dealer_blackjack) {
                    balance += Payment(player_bet, true);
                    responseData.message = "Blackjack! You won!";
                } else if (!player_blackjack && dealer_blackjack) {
                    responseData.message = "Blackjack dealer! You lost";
                } else {
                    balance += player_bet;
                    responseData.message = "Both Blackjack. Tie.";
                }
                updateResponseData();
                return res.json(responseData);
            }
        } else {
            return res.status(400).json({ message: "Finish this hand" });
        }
    
        responseData.message = "Game started";
        updateResponseData();
        return res.json(responseData);
    }
});

app.post("/api/blackjack/play", (req, res) => {
    checkAndReshuffleDeck();
    const { action } = req.body;

    switch (action) {
        case "stand":
            if (isSplit) {
                if (current_split === 1) {
                    current_split = 2;
                    updateResponseData();
                    responseData.message = "Go on with the second hand";
                } else {
                    while (Dealer_check(dealer_score)) {
                        checkAndReshuffleDeck();
                        dealer_next_card = shuffled.shift();
                        dealer_cards.push(dealer_next_card);
                        dealer_score += Value(dealer_next_card);
                        dealer_score = adjustForAces(dealer_cards, dealer_score);
                    }
                    let result1 = Win(split_score_1, dealer_score, false, dealer_blackjack);
                    let result2 = Win(split_score_2, dealer_score, false, dealer_blackjack);
                    let result_messages = [];
                    if (result1 === 1) {
                        balance += Payment(player_bet, false);
                        result_messages.push("First hand: Win!");
                    } else if (result1 === 2) {
                        balance += player_bet;
                        result_messages.push("First hand: Tie.");
                    } else {
                        result_messages.push("First hand: Lost.");
                    }
                    if (result2 === 1) {
                        balance += Payment(split_bet, false);
                        result_messages.push("Second hand: Win!");
                    } else if (result2 === 2) {
                        balance += split_bet;
                        result_messages.push("Second hand: Tie.");
                    } else {
                        result_messages.push("Second hand: Lost.");
                    }
                    GameOver = true;
                    isSplit = false;
                    responseData.message = result_messages.join(" ");
                    updateResponseData();
                }
            } else {
                if (dealer_score === 21 && dealer_cards.length === 2) dealer_blackjack = true;
                if (player_score === 21 && player_cards.length === 2) player_blackjack = true;
                while (Dealer_check(dealer_score)) {
                    checkAndReshuffleDeck();
                    dealer_next_card = shuffled.shift();
                    dealer_cards.push(dealer_next_card);
                    dealer_score += Value(dealer_next_card);
                    dealer_score = adjustForAces(dealer_cards, dealer_score);
                }
                const result = Win(player_score, dealer_score, player_blackjack, dealer_blackjack);
                switch (result) {
                    case 1:
                        balance += Payment(player_bet, player_blackjack);
                        responseData.message = "You Won!";
                        break;
                    case 2:
                        balance += player_bet;
                        responseData.message = "Tie!";
                        break;
                    case 3:
                        responseData.message = "You Lost!";
                        break;
                }
                GameOver = true;
                updateResponseData();
            }
            break;

        case "hit":
            if (isSplit) {
                const activeHand = current_split === 1 ? split_hand : split_second_hand;
                let activeScore = current_split === 1 ? split_score_1 : split_score_2;
                player_next_card = shuffled.shift();
                activeHand.push(player_next_card);
                activeScore += Value(player_next_card);
                activeScore = adjustForAces(activeHand, activeScore)
                if (current_split === 1) split_score_1 = activeScore;
                else split_score_2 = activeScore;
                updateResponseData();
                if (activeScore > 21) {
                    if (current_split === 1) {
                        current_split = 2;
                        responseData.message = "First hand out of bounds. Going on with the second hand";
                        updateResponseData();
                    } else {
                        while (Dealer_check(dealer_score)) {
                            checkAndReshuffleDeck();
                            dealer_next_card = shuffled.shift();
                            dealer_cards.push(dealer_next_card);
                            dealer_score += Value(dealer_next_card);
                            dealer_score = adjustForAces(dealer_cards, dealer_score);
                        }
                        let result1 = Win(split_score_1, dealer_score, false, dealer_blackjack);
                        let result2 = Win(split_score_2, dealer_score, false, dealer_blackjack);
                        let result_messages = [];
                        if (result1 === 1) balance += Payment(player_bet, false), result_messages.push("First hand: Win!");
                        else if (result1 === 2) balance += player_bet, result_messages.push("First hand: Tie.");
                        else result_messages.push("First hand: Lost.");
                        if (result2 === 1) balance += Payment(split_bet, false), result_messages.push("Second hand: Win!");
                        else if (result2 === 2) balance += split_bet, result_messages.push("Second hand: Tie.");
                        else result_messages.push("Second hand: Lost.");
                        GameOver = true;
                        isSplit = false;
                        responseData.message = result_messages.join(" ");
                        updateResponseData();
                    }
                }
            } else {
                player_next_card = shuffled.shift();
                player_cards.push(player_next_card);
                player_score += Value(player_next_card);
                player_score = adjustForAces(player_cards, player_score);
                updateResponseData();
                if (player_score > 21) {
                    GameOver = true;
                    responseData.message = "Out of bounds";
                    updateResponseData();
                }
            }
            break;

        case "double":
            if (player_cards.length > 2) return res.status(400).json({ message: "Cannot double after drawing!" });
            if (balance < player_bet) return res.status(400).json({ message: "You don't have enough money!" });
            balance -= player_bet;
            player_bet *= 2;
            player_next_card = shuffled.shift();
            player_cards.push(player_next_card);
            player_score += Value(player_next_card);
            player_score = adjustForAces(player_cards, player_score);
            updateResponseData();
            if (player_score > 21) {
                GameOver = true;
                responseData.message = "You Lost! (Double bet)";
                updateResponseData();
                return res.json(responseData);
            }
            while (Dealer_check(dealer_score)) {
                checkAndReshuffleDeck();
                dealer_next_card = shuffled.shift();
                dealer_cards.push(dealer_next_card);
                dealer_score += Value(dealer_next_card);
                dealer_score = adjustForAces(dealer_cards, dealer_score);
            }
            const result_double = Win(player_score, dealer_score, player_blackjack, dealer_blackjack);
            switch (result_double) {
                case 1:
                    balance += Payment(player_bet, player_blackjack);
                    responseData.message = "You Won!";
                    break;
                case 2:
                    balance += player_bet;
                    responseData.message = "Tie!";
                    break;
                case 3:
                    responseData.message = "You Lost!";
                    break;
            }
            GameOver = true;
            updateResponseData();
            break;

        case "split":
            if (!Split_action) return res.status(400).json({ message: "You can't split this hand" });
            let split_one_first_card = player_cards.shift();
            let split_two_first_card = player_cards.shift();
            let split_one_second_card = shuffled.shift();
            let split_two_second_card = shuffled.shift();
            split_hand.push(split_one_first_card, split_one_second_card);
            split_second_hand.push(split_two_first_card, split_two_second_card);
            split_score_1 = Value(split_one_first_card) + Value(split_one_second_card);
            split_score_2 = Value(split_two_first_card) + Value(split_two_second_card);
            isSplit = true;
            current_split = 1;
            split_bet = player_bet;
            balance -= split_bet;
            responseData.message = "Hand split. Playing first hand:";
            updateResponseData();
            break;
    }

    return res.json(responseData);
});

app.post("/api/blackjack/reset", (req, res) => {
    deck = CreateDeck();
    shuffled = ShuffleDeck(deck);
    dealer_card = null;
    player_card = null;
    dealer_first_value = null;
    dealer_second_card = null;
    player_second_card = null;
    player_next_card = null;
    player_score = 0;
    dealer_score = 0;
    dealer_cards = [];
    player_cards = [];
    dealer_blackjack = false;
    player_blackjack = false;
    player_bet = 0;
    GameOver = true;
    split_hand = [];
    split_second_hand = [];
    split_score_1 = 0;
    split_score_2 = 0;
    isSplit = false;
    current_split = 1;
    Split_action = false;
    GameOver = true;
    responseData.message = "Reset successful";
    updateResponseData();
    return res.json(responseData);
});

app.listen(PORT, () => console.log(`Server is online on port: ${PORT}`));
