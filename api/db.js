const mysql = require('mysql2');

// Create a MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',       // XAMPP MySQL server
    user: 'root',            // Default MySQL user
    password: '',            // Default is empty for XAMPP
    database: 'xcursionist'  // Replace with your database name
});

// Connect to the database  
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:'  , err);
        process.exit(1); // Exit the app if th  e connection fails
    }
    console.log('Connected to MySQL database!');
});

// Export the connection to use in your routes
module.exports = connection;
