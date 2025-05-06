import { createConnection } from 'mysql2';

const connection = createConnection({
  host: 'localhost',
  user: 'root',             
  password: '',               
  database: 'Blackjack_UNIPR' 
});

connection.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
    return;
  }
  console.log('DB connection was successful!');
});

export default connection;
