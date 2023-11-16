const mysql = require('mysql');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();


// MySQL connection configuration
const dbConfig = {
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.PASS || '',
  database: process.env.DB,
  table: 'pii_data',
};

// Encryption key (keep this secure)
const encryptionKey = 'satya secret';

// Function to encrypt data
function encryptData(data) {
  const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
  let encryptedData = cipher.update(data, 'utf-8', 'hex');
  encryptedData += cipher.final('hex');
  return encryptedData;
}

// Function to decrypt data
function decryptData(encryptedData) {
  const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
  let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8');
  decryptedData += decipher.final('utf-8');
  return decryptedData;
}

// Connect to the MySQL database
const connection = mysql.createConnection(dbConfig);

// Example data to insert into the database
const sensitiveData = 'This is sensitive information';
const encryptedData = encryptData(sensitiveData);

// Fetch existing data
connection.query(
  `SELECT * FROM ${dbConfig.table}`, (err, origin_rows) => {
    if (err) {
      console.error('Error retrieving data:', err);
    } else {
      // Decrypt and log the retrieved data
      origin_rows.forEach((origin_row) => {

        // Insert encrypted data into the database
        connection.query(
          `UPDATE ${dbConfig.table} SET phone_encrypted='${encryptData(origin_row.phone)}', email_encrypted='${encryptData(origin_row.email)}'  WHERE id = ${origin_row.id}`,
          [encryptedData],
          (err, results) => {
            if (err) {
              console.error('Error inserting data:', err);
            } else {
              console.log('Data update successfully');
            }

            // Retrieve data from the database
            connection.query(`SELECT * FROM ${dbConfig.table} WHERE id = ${origin_row.id}`, (err, rows) => {
              if (err) {
                console.error('Error retrieving data:', err);
              } else {
                // Decrypt and log the retrieved data
                rows.forEach((row) => {
                  console.log('origin: ', JSON.stringify(origin_row));
                  console.log('updated: ', JSON.stringify(row));
                  console.log('Decrypted Phone:', decryptData(row.phone_encrypted));
                  console.log('Decrypted Email:', decryptData(row.email_encrypted));
                });
                console.log('-------------------------------------------');
              }

              // Close the connection
              // connection.end((endErr) => {
              //   if (endErr) {
              //     console.error('Error closing connection:', endErr);
              //   } else {
              //     console.log('Connection closed');
              //   }
              // });
            });
          }
        );
      });
    }
  }
)
