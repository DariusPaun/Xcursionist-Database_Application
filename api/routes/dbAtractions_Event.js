const express = require('express');
const router = express.Router();
const db = require('../db'); // Database connection

// Example GET route
router.get('/events', (req, res) => {
    const query = 'SELECT e.Eveniment_Id,e.Data_Inceput,e.Data_final,e.Nume_Eveniment,a.Atractii_Id, e.Descriere,e.pret,a.Nume_Atractie,a.Descriere_Atractie,a.URL_Poza FROM `evenimente` e INNER JOIN atractii a ON a.Evenimente_Id = e.Eveniment_Id;';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send('Database query failed');
        } else {
            res.json(results);
        }
    });
});

module.exports = router; // Ensure you're exporting the router
