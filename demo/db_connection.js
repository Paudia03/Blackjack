import { createPool } from 'mysql2';

const connection = createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Blackjack_UNIPR',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

connection.getConnection((err, conn) => {
  if (err) {
    console.error("Db error:", err.code || err.message);
    process.exit(1);
  } else {
    console.log('successful db connection!');
    conn.release();
  }
});

connection.query("TRUNCATE TABLE sessions;", (err) => {
    if (err) {
        console.error("Failed to clear sessions table:", err);
    } else {
        console.log("Sessions table cleared on server startup.");
    }
});

export default connection;
