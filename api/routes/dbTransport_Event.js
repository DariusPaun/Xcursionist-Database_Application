const express = require('express');
const db = require('../db'); // Database connection
const router = express.Router();

// Example GET route with ID filtering
router.get('/cumpara-bilete', (req, res) => { // Notice the path is now just '/' since it's mounted as '/cumpara-bilete'
  const eventId = req.query.id;  // Retrieve the event ID from query parameters
   console.log(eventId)
  if (!eventId) {
    return res.status(400).send('Event ID is required');
  }

  // SQL query that fetches event details for the given event ID
  const query = `
    SELECT e.Eveniment_Id, e.Data_Inceput, e.Data_final, e.Nume_Eveniment, 
        e.pret, e.Ocupat,t.Capacitate,t.Mijloc_Transport,t.Nume_Companie
    FROM evenimente e
    INNER JOIN transport t ON e.Transport_Id = t.Transport_ID
    WHERE e.Eveniment_Id = ?;`;  // Use parameterized query to prevent SQL injection

  // Execute the query with the eventId as a parameter
  db.query(query, [eventId], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Database query failed');
    }

    if (results.length === 0) {
      return res.status(404).send('Event not found');
    }
    //console.log(results);
    res.json(results);  // Return the data as JSON
  });
});

module.exports = router; // Export only the router
