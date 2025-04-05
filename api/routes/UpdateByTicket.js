const express = require('express');
const router = express.Router();
const db = require('../db'); // Database connection

// POST route to update user data
router.post('/updateUser', (req, res) => {
    const { nume_complet, parola, Nr_excursii, bani_cheltuiti } = req.body;
    console.log('nume' ,nume_complet)
    // Update query to modify user's Nr_excursii and bani_cheltuiti
    const query = `
        UPDATE excursionisti e
        INNER JOIN date_personale dp ON dp.Persoana_Id = e.date_personale_id
        SET e.Nr_excursii = ?, e.bani_cheltuiti = ?
        WHERE dp.nume_complet = ? AND e.parola = ?;
    `;

    db.query(query, [Nr_excursii, bani_cheltuiti, nume_complet, parola], (err, results) => {
        if (err) {
            console.error('Error updating data:', err);
            res.status(500).send('Database update failed');
        } else {
            res.json({ message: 'User data updated successfully', results });
        }
    });
});

module.exports = router; // Ensure you're exporting the router
