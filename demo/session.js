import session from "express-session";
import MySQLStore from "express-mysql-session";
import connection from "./db_connection.js";

const MySQLStoreConstructor = MySQLStore(session);

const sessionStore = new MySQLStoreConstructor({}, connection.promise());

const sessionMiddleware = session({
  key: "blackjack.sid",
  secret: "blackjackunipr",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, 
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  }
});

export default sessionMiddleware;
