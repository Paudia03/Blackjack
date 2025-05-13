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
    console.error('❌ Errore nella connessione al DB:', err.code || err.message);
    process.exit(1);
  } else {
    console.log('✅ Connessione al DB riuscita!');
    conn.release();
  }
});

export default connection;
