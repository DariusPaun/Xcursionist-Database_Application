    const express = require('express');
    const router = express.Router();
    const db = require('../db'); // Database connection

    // POST route to update user data
    router.post('/update-ocupatie', (req, res) => {
        const { newOcupat, eventId } = req.body; // Correct way to extract values from req.body
        // Update query to modify the 'Ocupat' column for the event in the database
        const query = `
            UPDATE evenimente SET Ocupat = ? WHERE Eveniment_Id = ?
        `;

        db.query(query, [newOcupat, eventId], (err, results) => {
            if (err) {
                console.error('Error updating data:', err);
                res.status(500).send({ message: 'Error updating event occupancy', error: err });
            } else {
                res.json({ message: 'Event occupancy updated successfully', results });
            }
        });
    });

    module.exports = router; // Export the router to be used in your app
