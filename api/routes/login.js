const express = require('express');
const router = express.Router();
const db = require('../db'); // Database connection

// Example GET route
router.get('/login', (req, res) => {
    const query = 'Select e.parola,e.Nr_excursii,e.bani_cheltuiti,dp.nume_complet from excursionisti e INNER JOIN date_personale dp ON dp.Persoana_Id = e.date_personale_id;';
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
