// Import the required module
const mysql = require('mysql');

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASS,
  database: process.env.DB,
});

console.log(process.env.QUERY)

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');

  let startTime = performance.now();
  // Perform a simple query
  connection.query(`${process.env.QUERY}`, (queryErr, results) => {
    if (queryErr) {
      console.error('Error executing query:', queryErr);
      return;
    }

    // Log the query results
    // console.log('Query Results:', results);
    let endTime = performance.now();
    let time = endTime - startTime

    console.log(time);

    // Close the connection
    connection.end((endErr) => {
      if (endErr) {
        console.error('Error closing connection:', endErr);
        return;
      }
      console.log('Connection closed');
    });
  });
});
