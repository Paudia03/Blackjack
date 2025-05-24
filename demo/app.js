import express, { json } from "express";
import cors from "cors";
import morgan from "morgan";
import { CreateDeck, ShuffleDeck, Value, Dealer_check, Win, Payment, Splitchecker, adjustForAces} from './functions.js';
import connection from "./db_connection.js";
import crypto from 'crypto';
import validator from "validator";
import nodemailer from 'nodemailer';
import sessionMiddleware from "./session.js";

const PORT = 3000;
const app = express();
app.use(morgan("dev"));
app.use(json());
app.use(sessionMiddleware);

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true                
}));

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

function checkAndReshuffleDeck(req) {
  if (!req || !req.session) {
    console.error("Error: req or req.session undefined");
    return;
  }
  if (!Array.isArray(req.session.shuffled)) {
    req.session.deck = CreateDeck();
    req.session.shuffled = ShuffleDeck(req.session.deck);
    console.log("Session deck e shuffled initialized.");
  } else if (req.session.shuffled.length < 10) {
    req.session.deck = CreateDeck();
    req.session.shuffled = ShuffleDeck(req.session.deck);
    console.log("req.session.deck reshuffled automatically.");
  }
}

function updateResponseData(req) {
  return {
    message: req.session.message,
    dealer_cards: req.session.dealer_cards,
    dealer_score: req.session.dealer_score,
    dealer_first_card_value: req.session.dealer_cards.length > 0 ? Value(req.session.dealer_cards[0]) : 0,
    player_cards: req.session.player_cards,
    player_score: req.session.player_score,
    your_balance: req.session.balance,
    your_bet: req.session.player_bet,
    remaining_cards: req.session.shuffled.length,
    Gameover: req.session.GameOver,
    isSplit: req.session.isSplit,
    first_hand: req.session.isSplit ? { cards: req.session.split_hand, score: req.session.split_score_1 } : null,
    second_hand: req.session.isSplit ? { cards: req.session.split_second_hand, score: req.session.split_score_2 } : null,
    active_hand: req.session.isSplit ? req.session.current_split : null,
    split_bet: req.session.split_bet,
    dealer_blackjack: req.session.dealer_blackjack,
    player_blackjack: req.session.player_blackjack,
    Split_action: req.session.Split_action
  };
}


function updateBalance(connection, new_balance, userId) {
  connection.query(
    "UPDATE user SET wallet = ? WHERE user_id = ?",
    [new_balance, userId],
    (err) => {
      if (err) console.error("Errore durante l'aggiornamento del balance:", err);
      else console.log("Balance aggiornato a:", new_balance);
    }
  );
}

function SendMail(mailoptions) {
  transporter.sendMail(mailoptions, (error) => {
    if (error) console.log(error);
  });
}




app.post("/api/blackjack/init", (req, res) => {
    console.log("INIT chiamato");
    console.log("Session:", req.session);
    if (!req.session.IsLogged){
        return res.status(401).json({ error: "No user logged" });
    }
    else {
        req.session.deck = [];
        req.session.shuffled = [];
        req.session.dealer_card = null;
        req.session.player_card = null; 
        req.session.dealer_second_card = null;
        req.session.player_second_card = null;
        req.session.next_card = null;
        req.session.player_next_card = null;
        req.session.player_score = 0;
        req.session.dealer_score = 0;
        req.session.dealer_cards = [];
        req.session.player_cards = [];
        req.session.player_blackjack = false;
        req.session.dealer_blackjack = false;
        req.session.player_bet = 0;
        req.session.split_bet = 0;
        req.session.Split_action = false;
        req.session.split_hand = [];
        req.session.split_second_hand = [];
        req.session.split_score_1 = 0;
        req.session.split_score_2 = 0;
        req.session.current_split = 1;
        req.session.isSplit = false;
        req.session.dealer_first_value = 0;
        req.session.deck = CreateDeck();
        req.session.shuffled = ShuffleDeck(req.session.deck);
        req.session.message = "";
        return res.status(200).json({ message: "Sessione inizializzata" });
    }
});

app.post("/api/blackjack/signup", (req, res) => {
  const { email, username, password, repeat_password } = req.body;

  // 1. Validazioni di formato
  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format." });
  }
  if (password !== repeat_password) {
    return res.status(400).json({ success: false, message: "The two passwords don't match." });
  }

  connection.query(
    "SELECT * FROM user WHERE email = ? OR username = ?",
    [email, username],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Database error while checking existing users." });
      }
      if (results.length > 0) {
        const duplicateField = results.find(u => u.email === email) ? 'Email' : 'Username';
        return res.status(409).json({ success: false, message: `${duplicateField} already in use.` });
      }

      const code = generate6DigitCode();
      const sql = `
        INSERT INTO pending_verifications 
          (email, username, password, code, action_type)
        VALUES (?, ?, ?, ?, 'signup')
        ON DUPLICATE KEY UPDATE
          username = VALUES(username),
          password = VALUES(password),
          code = VALUES(code)
      `;
      connection.query(
        sql,
        [email, username, password, code],
        (err2) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ success: false, message: "Database error while saving verification." });
          }


          const mailOptions = {
            from: 'blackjackunipr@gmail.com',
            to: email,
            subject: 'Your Authentication code',
            text: `Hi ${username},\n\n` +
                  `Thank you for signing up for Blackjack Unipr!\n\n` +
                  `To complete your registration, please enter the following 6-digit verification code:\n\n` +
                  `${code}\n\n` +
                  `This code is valid forever and is required to activate your account.\n\n` +
                  `If you didn't request this, please ignore this message.\n\n` +
                  `Best regards,\nThe Blackjack Unipr Team`
          };
          SendMail(mailOptions);

          return res.status(201).json({
            success: true,
            message: "Almost there. Submit the authentication code you received.",
            user: { username, email }
          });
        }
      );
    }
  );
});


app.post("/api/blackjack/authentication", (req, res) => {
  const { email, code } = req.body;

  connection.query(
    "SELECT * FROM pending_verifications WHERE email = ? AND action_type = 'signup' AND code = ?",
    [email, code],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Database error while fetching verification." });
      }

      if (results.length === 0) {
        return res.status(401).json({ success: false, message: "Invalid verification code or no pending signup." });
      }

      const pending = results[0];

      const userId = generateShortID();
      const sqlInsertUser =
        "INSERT INTO user (user_id, username, password, wallet, games_won, games_played, email) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?)";
      connection.query(
        sqlInsertUser,
        [userId, pending.username, pending.password, 0, 0, 0, email],
        (err2) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ success: false, message: "Database error. User could not be created." });
          }

          connection.query(
            "DELETE FROM pending_verifications WHERE email = ? AND action_type = 'signup'",
            [email],
            (err3) => {
              if (err3) {
                console.error(err3);
              }

              const mailOptions2 = {
                from: 'blackjackunipr@gmail.com',
                to: email,
                subject: '🎉 Welcome to Blackjack Unipr!',
                text: `Hi ${pending.username},\n\n` +
                      `Your account has been successfully created — welcome aboard!\n\n` +
                      `You can now log in and start playing Blackjack on our platform.\n` +
                      `We're excited to have you as part of the Blackjack Unipr community.\n\n` +
                      `If you ever have questions, feedback, or need help, feel free to reach out.\n\n` +
                      `Good luck, and may the cards be ever in your favor! 🃏\n\n` +
                      `Cheers,\nThe Blackjack Unipr Team`
              };
              SendMail(mailOptions2);

              return res.status(201).json({
                success: true,
                message: "User created successfully.",
                user: { id: userId, username: pending.username, email }
              });
            }
          );
        }
      );
    }
  );
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

    const user = results[0];

    if (password == user.password){
      req.session.balance = user.wallet;
      req.session.IsLogged = user.user_id;
      req.session.GameOver = true;
      return res.status(201).json({
        success: true,
        message: "Login successful.",
        user: {
          LoggedUser: req.session.IsLogged,
          username: user.username,
          balance: req.session.balance
        }
      });
    } else return res.status(500).json({
      success: false,
      message: "wrong username or password"
    });
  });

});

app.post("/api/blackjack/logout", (req, res) => {
  req.session.IsLogged = null;
  req.session.balance = 0;
  return res.status(200).json({ success: true, message: "Logout successful", LoggedUser: req.session.IsLogged });
});

function commonMailText(username, code, isChange) {
  const action = isChange ? 'change' : 'reset';
  return `Hi ${username},

Here’s the 6-digit code to ${action} your password:

${code}

Enter this code in the app to continue. If you didn’t request this, just ignore this message.

Thank you,  
The Blackjack Unipr Team`;
}

app.post("/api/blackjack/passwordreset", (req, res) => {
  const isLoggedIn = !!req.session.IsLogged;
  const userId     = req.session.IsLogged;

  // Recupera username ed email in base allo stato di login
  if (isLoggedIn) {
    const query = "SELECT username, email FROM user WHERE user_id = ?";
    connection.query(query, [userId], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Database error." });
      if (results.length === 0) return res.status(404).json({ success: false, message: "User not found." });

      const { username, email } = results[0];
      const code = generate6DigitCode();

      const sql = `
        INSERT INTO pending_verifications (email, username, code, action_type)
        VALUES (?, ?, ?, 'reset_password')
        ON DUPLICATE KEY UPDATE
          code        = VALUES(code),
          username    = VALUES(username),
          action_type = 'reset_password'
      `;
      connection.query(sql, [email, username, code], (err2) => {
        if (err2) return res.status(500).json({ success: false, message: "Database error storing code." });

        const mailOptions = {
          from: 'blackjackunipr@gmail.com',
          to: email,
          subject: 'Your Verification Code',
          text: commonMailText(username, code, true)
        };
        SendMail(mailOptions);

        return res.status(201).json({
          success: true,
          message: "Almost there. Submit the authentication code you received.",
          user: { username, email }
        });
      });
    });

  } else {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });

    const query = "SELECT username, email FROM user WHERE email = ?";
    connection.query(query, [email], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Database error." });
      if (results.length === 0) return res.status(404).json({ success: false, message: "Email not found." });

      const { username, email: foundEmail } = results[0];
      const code = generate6DigitCode();

      const sql = `
        INSERT INTO pending_verifications (email, username, code, action_type)
        VALUES (?, ?, ?, 'reset_password')
        ON DUPLICATE KEY UPDATE
          code        = VALUES(code),
          username    = VALUES(username),
          action_type = 'reset_password'
      `;
      connection.query(sql, [foundEmail, username, code], (err2) => {
        if (err2) return res.status(500).json({ success: false, message: "Database error storing code." });

        const mailOptions = {
          from: 'blackjackunipr@gmail.com',
          to: foundEmail,
          subject: 'Your Verification Code',
          text: commonMailText(username, code, false)
        };
        SendMail(mailOptions);

        return res.status(201).json({
          success: true,
          message: "Almost there. Submit the authentication code you received.",
          user: { username, email: foundEmail }
        });
      });
    });
  }
});


app.post("/api/blackjack/confirmreset", (req, res) => {
  const { email, reset_code, new_password } = req.body;

  // 1. Cerco la pending reset nel DB
  connection.query(
    "SELECT * FROM pending_verifications WHERE email = ? AND code = ? AND action_type = 'reset_password'",
    [email, reset_code],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Database error while fetching verification." });
      }

      if (results.length === 0) {
        return res.status(400).json({ success: false, message: "No pending verification found for this email or invalid code." });
      }

      const pending = results[0];

      const updatePasswordQuery = "UPDATE user SET password = ? WHERE email = ?";
      connection.query(updatePasswordQuery, [new_password, email], (err2, results2) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ success: false, message: "Database error during password update." });
        }

        connection.query(
          "DELETE FROM pending_verifications WHERE email = ? AND action_type = 'reset_password'",
          [email],
          (err3) => {
            if (err3) {
              console.error(err3);
              // Non blocchiamo la risposta, l'aggiornamento è fatto
            }

            // 4. Invio mail di conferma
            const mailOptions4 = {
              from: 'blackjackunipr@gmail.com',
              to: email,
              subject: 'Password Reset Was Successful!',
              text: `Hi ${pending.username},

Your password has been reset successfully and you are now able to play!

Best regards,  
The Blackjack Unipr Team`
            };
            SendMail(mailOptions4);

            // 5. Risposta al client
            return res.status(200).json({ success: true, message: "Password updated successfully." });
          }
        );
      });
    }
  );
});


app.post('/api/blackjack/deposit', (req, res) => {
  if (!req.session.IsLogged) {
    return res.status(401).json({ message: "No Logged user." });
  }
  let responseData = updateResponseData(req);
  const {deposit} = req.body;
  const amount = parseFloat(deposit);

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: "Not a valid amount." });
  }
  const query = `UPDATE user SET wallet = wallet + ? WHERE user_id = ?`;
  connection.query(query, [amount, req.session.IsLogged], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(401).json({ message: "Updating error." });
    }

    connection.query("SELECT wallet FROM user WHERE user_id = ?", [req.session.IsLogged], (err2, results) => {
      if (err2) {
        console.error("DB error:", err2);
        return res.status(401).json({ message: "Error." });
      }

      req.session.balance = results[0].wallet; 
      responseData = updateResponseData(req);

      return res.status(200).json({
        message: `Ricarica completata: €${amount}`,
        balance: req.session.balance
      });
    });
  });
});

app.get("/api/blackjack/me", (req, res) => {
  const userId = req.session.IsLogged;   // ora contiene l’ID utente o null
  if (!userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  const sql = `
    SELECT
      user_id   AS id,
      username,
      email,
      wallet    AS balance,
      games_won,
      games_played
    FROM user
    WHERE user_id = ?
    LIMIT 1
  `;

  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("DB error in /me:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    if (results.length === 0) {
      // sessione inconsistente: rimuovo userId
      req.session.IsLogged = null;
      return res.status(401).json({ success: false, message: "User not found" });
    }
    // restituisco i dati utente
    return res.json({
      success: true,
      user: results[0]
    });
  });
});


app.post("/api/blackjack/start", (req, res) => {
  if (!req.session.IsLogged){
    return res.status(400).json({ message: "No user is playing" });
  } else {
    let responseData = updateResponseData(req);
    connection.query("SELECT wallet FROM user WHERE user_id = ?", [req.session.IsLogged], (err, results) => {
      if (err) {
        console.error("Unable to find balance:", err);
        return res.status(500).json({ message: "Server error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      req.session.balance = results[0].wallet;
      checkAndReshuffleDeck(req);
      const { bet } = req.body;
      if (!bet || bet <= 0) return res.status(400).json({ message: "Place a bet before starting" });
      if (bet > req.session.balance) return res.status(400).json({ message: "Not enough money!" });

      if (req.session.GameOver) {
        req.session.GameOver = false;
        req.session.player_bet = bet;
        req.session.balance -= bet;
        updateBalance(connection, req.session.balance, req.session.IsLogged);

        req.session.dealer_cards = [];
        req.session.player_cards = [];
        req.session.dealer_card = req.session.shuffled.shift();
        req.session.player_card = req.session.shuffled.shift();
        req.session.dealer_second_card = req.session.shuffled.shift();
        req.session.player_second_card = req.session.shuffled.shift();
        req.session.dealer_cards.push(req.session.dealer_card, req.session.dealer_second_card);
        req.session.player_cards.push(req.session.player_card, req.session.player_second_card);
        req.session.Split_action = Splitchecker(req.session.player_card, req.session.player_second_card);
        req.session.dealer_first_value = Value(req.session.dealer_card);
        req.session.player_score = Value(req.session.player_card) + Value(req.session.player_second_card);
        req.session.dealer_score = req.session.dealer_first_value + Value(req.session.dealer_second_card);
        req.session.player_blackjack = (req.session.player_score === 21);
        req.session.dealer_blackjack = (req.session.dealer_score === 21);
        responseData = updateResponseData(req);

        if (req.session.player_blackjack || req.session.dealer_blackjack) {
          if (req.session.player_blackjack && !req.session.dealer_blackjack) {
            req.session.balance += Payment(req.session.player_bet, true);
            updateBalance(connection, req.session.balance, req.session.IsLogged);
            req.session.message = "Blackjack! You won!";
          } else if (!req.session.player_blackjack && req.session.dealer_blackjack) {
            req.session.message = "Blackjack dealer! You lost";
          } else {
            req.session.balance += req.session.player_bet;
            updateBalance(connection, req.session.balance, req.session.IsLogged);
            req.session.message = "Both Blackjack. Tie.";
          }
          req.session.GameOver = true;
          responseData = updateResponseData(req);
          return res.json(responseData);
        }
      } else {
        return res.status(400).json({ message: "Finish this hand" });
      }

      req.session.message = "Game started";
      responseData = updateResponseData(req);
      return res.json(responseData);
    });
  }
});

app.post("/api/blackjack/play", (req, res) => {
    checkAndReshuffleDeck(req);
    const { action } = req.body;
    let responseData = updateResponseData(req);
    switch (action) {
        case "stand":
            if (req.session.isSplit) {
                if (req.session.current_split === 1) {
                    req.session.current_split = 2;
                    responseData = updateResponseData(req);
                    req.session.message = "Go on with the second hand";
                } else {
                    while (Dealer_check(req.session.dealer_score)) {
                        checkAndReshuffleDeck(req);
                        req.session.dealer_next_card = req.session.shuffled.shift();
                        req.session.dealer_cards.push(req.session.dealer_next_card);
                        req.session.dealer_score += Value(req.session.dealer_next_card);
                        req.session.dealer_score = adjustForAces(req.session.dealer_cards, req.session.dealer_score);
                    }
                    let result1 = Win(req.session.split_score_1, req.session.dealer_score, false, req.session.dealer_blackjack);
                    let result2 = Win(req.session.split_score_2, req.session.dealer_score, false, req.session.dealer_blackjack);
                    let result_messages = [];
                    if (result1 === 1) {
                        req.session.balance += Payment(req.session.player_bet, false);
                        updateBalance(connection, req.session.balance, req.session.IsLogged);
                        result_messages.push("First hand: Win!");
                    } else if (result1 === 2) {
                        req.session.balance += req.session.player_bet;
                        updateBalance(connection, req.session.balance, req.session.IsLogged);
                        result_messages.push("First hand: Tie.");
                    } else {
                        updateBalance(connection, req.session.balance, req.session.IsLogged);
                        result_messages.push("First hand: Lost.");
                    }
                    if (result2 === 1) {
                        req.session.balance += Payment(req.session.split_bet, false);
                        updateBalance(connection, req.session.balance, req.session.IsLogged);
                        result_messages.push("Second hand: Win!");
                    } else if (result2 === 2) {
                        req.session.balance += req.session.split_bet;
                        updateBalance(connection, req.session.balance, req.session.IsLogged);
                        result_messages.push("Second hand: Tie.");
                    } else {
                        result_messages.push("Second hand: Lost.");
                    }
                    req.session.GameOver = true;
                    req.session.isSplit = false;
                    req.session.message = result_messages.join(" ");
                    responseData = updateResponseData(req);
                }
            } else {
                if (req.session.dealer_score === 21 && req.session.dealer_cards.length === 2) req.session.dealer_blackjack = true;
                if (req.session.player_score === 21 && req.session.player_cards.length === 2) req.session.player_blackjack = true;
                while (Dealer_check(req.session.dealer_score)) {
                    checkAndReshuffleDeck(req);
                    req.session.dealer_next_card = req.session.shuffled.shift();
                    req.session.dealer_cards.push(req.session.dealer_next_card);
                    req.session.dealer_score += Value(req.session.dealer_next_card);
                    req.session.dealer_score = adjustForAces(req.session.dealer_cards, req.session.dealer_score);
                }
                const result = Win(req.session.player_score, req.session.dealer_score, req.session.player_blackjack, req.session.dealer_blackjack);
                switch (result) {
                    case 1:
                        req.session.balance += Payment(req.session.player_bet, req.session.player_blackjack);
                        updateBalance(connection, req.session.balance, req.session.IsLogged);
                        req.session.message = "You Won!";
                        break;
                    case 2:
                        req.session.balance += req.session.player_bet;
                        updateBalance(connection, req.session.balance, req.session.IsLogged);
                        req.session.message = "Tie!";
                        break;
                    case 3:
                        req.session.message = "You Lost!";
                        break;
                }
                req.session.GameOver = true;
                responseData = updateResponseData(req);
            }
            break;

        case "hit":
            if (req.session.isSplit) {
                const activeHand = req.session.current_split === 1 ? req.session.split_hand : req.session.split_second_hand;
                let activeScore = req.session.current_split === 1 ? req.session.split_score_1 : req.session.split_score_2;
                req.session.player_next_card = req.session.shuffled.shift();
                activeHand.push(req.session.player_next_card);
                activeScore += Value(req.session.player_next_card);
                activeScore = adjustForAces(activeHand, activeScore)
                if (req.session.current_split === 1) req.session.split_score_1 = activeScore;
                else req.session.split_score_2 = activeScore;
                responseData = updateResponseData(req);
                if (activeScore > 21) {
                    if (req.session.current_split === 1) {
                        req.session.current_split = 2;
                        req.session.message = "First hand out of bounds. Going on with the second hand";
                        responseData = updateResponseData(req);
                    } else {
                        while (Dealer_check(req.session.dealer_score)) {
                            checkAndReshuffleDeck(req);
                            req.session.dealer_next_card = req.session.shuffled.shift();
                            req.session.dealer_cards.push(req.session.dealer_next_card);
                            req.session.dealer_score += Value(req.session.dealer_next_card);
                            req.session.dealer_score = adjustForAces(req.session.dealer_cards, req.session.dealer_score);
                        }
                        let result1 = Win(req.session.split_score_1, req.session.dealer_score, false, req.session.dealer_blackjack);
                        let result2 = Win(req.session.split_score_2, req.session.dealer_score, false, req.session.dealer_blackjack);
                        let result_messages = [];
                        if (result1 === 1){
                            req.session.balance += Payment(req.session.player_bet, false);
                            updateBalance(connection, req.session.balance, req.session.IsLogged);
                            result_messages.push("First hand: Win!");
                        }
                        else if (result1 === 2) {
                            req.session.balance += req.session.player_bet;
                            updateBalance(connection, req.session.balance, req.session.IsLogged);
                            result_messages.push("First hand: Tie.");
                        }
                        else{
                            result_messages.push("First hand: Lost.");
                        }
                        if (result2 === 1){
                            req.session.balance += Payment(req.session.split_bet, false); 
                            updateBalance(connection, req.session.balance, req.session.IsLogged);
                            result_messages.push("Second hand: Win!");
                        }
                        else if (result2 === 2){
                            req.session.balance += req.session.split_bet;
                            updateBalance(connection, req.session.balance, req.session.IsLogged);
                            result_messages.push("Second hand: Tie.");
                        }
                        else result_messages.push("Second hand: Lost.");
                        req.session.GameOver = true;
                        req.session.isSplit = false;
                        req.session.Split_action = false;
                        req.session.message = result_messages.join(" ");
                        responseData = updateResponseData(req);
                    }
                }
            } else {
                req.session.player_next_card = req.session.shuffled.shift();
                req.session.player_cards.push(req.session.player_next_card);
                req.session.player_score += Value(req.session.player_next_card);
                req.session.player_score = adjustForAces(req.session.player_cards, req.session.player_score);
                responseData = updateResponseData(req);
                if (req.session.player_score > 21) {
                    req.session.GameOver = true;
                    req.session.message = "Out of bounds";
                    updateBalance(connection, req.session.balance, req.session.IsLogged);
                    responseData = updateResponseData(req);
                }
            }
            break;

        case "double":
            if (req.session.Split_action) return res.status(400).json({ message: "Cannot double after splitting!" });
            if (req.session.player_cards.length > 2) return res.status(400).json({ message: "Cannot double after drawing!" });
            if (req.session.balance < req.session.player_bet) return res.status(400).json({ message: "You don't have enough money!" });
            req.session.balance -= req.session.player_bet;
            updateBalance(connection, req.session.balance, req.session.IsLogged);
            req.session.player_bet *= 2;
            req.session.player_next_card = req.session.shuffled.shift();
            req.session.player_cards.push(req.session.player_next_card);
            req.session.player_score += Value(req.session.player_next_card);
            req.session.player_score = adjustForAces(req.session.player_cards, req.session.player_score);
            responseData = updateResponseData(req);
            if (req.session.player_score > 21) {
                req.session.GameOver = true;
                req.session.message = "You Lost! (Double bet)";
                updateBalance(connection, req.session.balance, req.session.IsLogged);
                responseData = updateResponseData(req);
                return res.json(responseData);
            }
            while (Dealer_check(req.session.dealer_score)) {
                checkAndReshuffleDeck(req);
                req.session.dealer_next_card = req.session.shuffled.shift();
                req.session.dealer_cards.push(req.session.dealer_next_card);
                req.session.dealer_score += Value(req.session.dealer_next_card);
                req.session.dealer_score = adjustForAces(req.session.dealer_cards, req.session.dealer_score);
            }
            const result_double = Win(req.session.player_score, req.session.dealer_score, req.session.player_blackjack, req.session.dealer_blackjack);
            switch (result_double) {
                case 1:
                    req.session.balance += Payment(req.session.player_bet, req.session.player_blackjack);
                    updateBalance(connection, req.session.balance, req.session.IsLogged);
                    req.session.message = "You Won!";
                    break;
                case 2:
                    req.session.balance += req.session.player_bet;
                    updateBalance(connection, req.session.balance, req.session.IsLogged);
                    req.session.message = "Tie!";
                    break;
                case 3:
                    req.session.message = "You Lost!";
                    break;
            }
            req.session.GameOver = true;
            responseData = updateResponseData(req);
            break;

        case "split":
            if (!req.session.Split_action) return res.status(400).json({ message: "You can't split this hand" });
            let split_one_first_card = req.session.player_cards.shift();
            let split_two_first_card = req.session.player_cards.shift();
            let split_one_second_card = req.session.shuffled.shift();
            let split_two_second_card = req.session.shuffled.shift();
            req.session.split_hand.push(split_one_first_card, split_one_second_card);
            req.session.split_second_hand.push(split_two_first_card, split_two_second_card);
            req.session.split_score_1 = Value(split_one_first_card) + Value(split_one_second_card);
            req.session.split_score_2 = Value(split_two_first_card) + Value(split_two_second_card);
            req.session.isSplit = true;
            req.session.current_split = 1;
            req.session.split_bet = req.session.player_bet;
            req.session.balance -= req.session.split_bet;
            updateBalance(connection, req.session.balance, req.session.IsLogged);
            req.session.message = "Hand split. Playing first hand:";
            responseData = updateResponseData(req);
            break;
    }

    return res.json(responseData);
});


app.post("/api/blackjack/reset", (req, res) => {
  let responseData = updateResponseData(req);
  req.session.deck = CreateDeck();
  req.session.shuffled = ShuffleDeck(req.session.deck);
  req.session.dealer_card = null;
  req.session.player_card = null;
  req.session.dealer_second_card = null;
  req.session.player_second_card = null;
  req.session.next_card = null;
  req.session.player_next_card = null;
  req.session.player_score = 0;
  req.session.dealer_score = 0;
  req.session.dealer_cards = [];
  req.session.player_cards = [];
  req.session.player_blackjack = false;
  req.session.dealer_blackjack = false;
  req.session.player_bet = 0;
  req.session.split_bet = 0;
  req.session.balance = req.session.balance; // mantiene il saldo esistente
  req.session.GameOver = true;
  req.session.Split_action = false;
  req.session.split_hand = [];
  req.session.split_second_hand = [];
  req.session.split_score_1 = 0;
  req.session.split_score_2 = 0;
  req.session.current_split = 1;
  req.session.isSplit = false;
  req.session.dealer_first_value = 0;

  // Aggiorna il responseData con lo stato appena resettato
  responseData = updateResponseData(req);

  return res.json(responseData);
});

app.listen(PORT, () => console.log(`Server is online on port: ${PORT}`));