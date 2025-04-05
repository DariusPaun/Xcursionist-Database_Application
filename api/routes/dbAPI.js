    const express = require('express');
    const router = express.Router();
    const db = require('../db'); // Database connection

    //intro express
    router.get('/', function(req, res, next) {
        res.render('index', { title: 'Express' });
    });
    router.get('/users', function(req, res, next) {
        res.send('respond with a resource');
    });
    //Afiseaza Statistici ***
    router.get('/api', (req, res) => {
        // Extract query parameters with default values
        const sumaMinima = parseInt(req.query.suma_minima, 10) || -1;
        const sumaMaxima = parseInt(req.query.suma_maxima, 10) || Number.MAX_SAFE_INTEGER;

        const query = `
            SELECT date_personale.Nume_Complet, date_personale.varsta, date_personale.SEX, excursionisti.Nr_excursii, excursionisti.Bani_cheltuiti
            FROM excursionisti
            INNER JOIN date_personale ON excursionisti.Date_Personale_Id = date_personale.Persoana_Id
            WHERE excursionisti.Excursionisti_ID NOT IN (
                SELECT Excursionisti_Id FROM excursionisti WHERE nr_excursii = 0
            ) AND (excursionisti.Bani_cheltuiti >= ? AND excursionisti.Bani_cheltuiti <= ?);
        `;

        // Execute the query with the min and max amount values as parameters
        db.query(query, [sumaMinima, sumaMaxima], (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                res.status(500).send('Database query failed');
            } else {
                res.json(results);
            }
        });
    });


    //Baza-de-data/Evenimente/Organizatori 
    router.get('/organizatori', (req, res) => {
        const query1 = 'SELECT o.Organizatori_Id, dp.nume_complet FROM organizatori o INNER JOIN date_personale dp ON dp.Persoana_Id = o.Date_Personale_Id;';
        const query2 = 'SELECT Evenitment_Id, Organizatori_Id FROM evenimente_a_e_o WHERE Organizatori_Id IS NOT NULL;';

        // Crează promisiuni pentru fiecare query
        const query1Promise = new Promise((resolve, reject) => {
            db.query(query1, (err, results) => {
                if (err) {
                    reject('Error fetching query1 data: ' + err);
                } else {
                    resolve(results);
                }
            });
        });

        const query2Promise = new Promise((resolve, reject) => {
            db.query(query2, (err, results) => {
                if (err) {
                    reject('Error fetching query2 data: ' + err);
                } else {
                    resolve(results);
                }
            });
        });

        // Execută ambele interogări în paralel
        Promise.all([query1Promise, query2Promise])
            .then((results) => {
                // Combină rezultatele celor două interogări
                const [results1, results2] = results;
                res.json({
                    All_organizatori: results1,
                    organizatori_events: results2
                });
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Database query failed');
            });
    });
    //Evenimente (Afiseaza evenimentele) ***
    router.get('/events', (req, res) => {
        const now = new Date().toISOString();
        const query = `
            SELECT 
        e.Eveniment_Id,
        e.Data_Inceput,
        e.Data_final,
        e.Nume_Eveniment,
        e.Descriere,
        e.pret,
        tabel.Atractii_Id,
        tabel.Nume_Atractie,
        tabel.Descriere_Atractie,
        tabel.URL_Poza
    FROM evenimente e
    INNER JOIN (
        SELECT 
            a.Atractii_Id,
            a.Nume_Atractie,
            a.Descriere_Atractie,
            a.URL_Poza,
            eo.Evenitment_Id AS Eveniment_Id
        FROM atractii a
        INNER JOIN evenimente_a_e_o eo ON eo.Atractii_Id = a.Atractii_Id
    ) AS tabel
    ON e.Eveniment_Id = tabel.Eveniment_Id
    WHERE e.Data_Inceput > '${now}';
        `;
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                res.status(500).send('Database query failed');
            } else {
                res.json(results);
            }
        });
    });
    //Evenimente (pe 3 evenimente)
    router.get('/events-show', (req, res) => {
        const now = new Date().toISOString(); // Get current date and time in ISO format
        const before = req.query.before;
        const rightnow = req.query.now;
        const then = req.query.then;
    
        // Define the three queries for each event category using placeholders
        const upcomingQuery = `
            SELECT Eveniment_Id, Nume_eveniment, Data_Inceput, Data_Final
            FROM evenimente
            WHERE Data_Inceput > ? AND Nume_eveniment LIKE ?
            ORDER BY Data_Inceput ASC;
        `;
        
        const ongoingQuery = `
            SELECT Eveniment_Id, Nume_eveniment, Data_Inceput, Data_Final
            FROM evenimente
            WHERE Data_Inceput <= ? AND Data_Final >= ? AND Nume_eveniment LIKE ?
            ORDER BY Data_Inceput ASC;
        `;
        
        const pastQuery = `
            SELECT Eveniment_Id, Nume_eveniment, Data_Inceput, Data_Final
            FROM evenimente
            WHERE Data_Final < ? AND Nume_eveniment LIKE ?
            ORDER BY Data_Inceput ASC;
        `;  
    
        // Execute the three queries
        Promise.all([
            new Promise((resolve, reject) => {
                db.query(upcomingQuery, [now, `%${then}%`], (err, results) => {
                    if (err) reject(err);
                    else resolve({ status: 'upcoming', events: results });
                });
            }),
            new Promise((resolve, reject) => {
                db.query(ongoingQuery, [now, now, `%${rightnow}%`], (err, results) => {
                    if (err) reject(err);
                    else resolve({ status: 'ongoing', events: results });
                });
            }),
            new Promise((resolve, reject) => {
                db.query(pastQuery, [now, `%${before}%`], (err, results) => {
                    if (err) reject(err);
                    else resolve({ status: 'past', events: results });
                });
            })
        ])
        .then(results => {
            // Send all results to the client
            res.json({
                upcoming: results.find(r => r.status === 'upcoming').events,
                ongoing: results.find(r => r.status === 'ongoing').events,
                past: results.find(r => r.status === 'past').events
            });
        })
        .catch(err => {
            console.error('Error fetching data:', err);
            res.status(500).send('Database query failed');
        });
    });
    

    //Evemente -> Cumpara bilete
    router.get('/cumpara-bilete', (req, res) => { // Notice the path is now just '/' since it's mounted as '/cumpara-bilete'
        const eventId = req.query.id;  // Retrieve the event ID from query parameters
        console.log(eventId)
        if (!eventId) {
        return res.status(400).send('Event ID is required');
        }
    
        // SQL query that fetches event details for the given event ID
        const query = `   
    SELECT e.Eveniment_Id, e.Data_Inceput, e.Data_final, e.Nume_Eveniment, e.pret, e.Ocupat,t.*
    From evenimente e
    INNER JOIN (Select tr.Capacitate,tr.Mijloc_Transport,tr.Nume_Companie,tr.Transport_ID From transport tr) As t 
    On  e.Transport_Id = t.Transport_ID

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
    //toate usernamurile cu toate parolele
    router.get('/login', (req, res) => {
        const query = 'Select e.parola,e.Excursionisti_Id,e.Nr_excursii,e.bani_cheltuiti,dp.nume_complet from excursionisti e INNER JOIN date_personale dp ON dp.Persoana_Id = e.date_personale_id;';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                res.status(500).send('Database query failed');
            } else {
                res.json(results);
            }
        });
    });
    //Adauga eveniment (toate evenimentele pentru a crea eveniment)
    router.get('/attractions', (req, res) => {
        const query = 'SELECT Atractii_Id,Nume_Atractie FROM atractii ORDER BY Nume_Atractie ASC;';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                res.status(500).send('Database query failed');
            } else {
                res.json(results);
            }
        });
    });
    router.get('/transports', (req, res) => {
        const query = 'SELECT * FROM transport;';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                res.status(500).send('Database query failed');
            } else {
                res.json(results);
            }
        });
    });
    //Cand se cumpara un bilet sa se abdateze nr de excurii si bani_cheltuiti
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
    //Sterege eveniment
    router.post('/events-delete', (req, res) => {
        // Extract the ID from the request body
        const { id } = req.body; // Assuming the body contains { id_event: 17 }

        if (!id) {
            res.status(400).send('ID is required');
            return;
        }

        const query = 'DELETE FROM evenimente WHERE Eveniment_Id = ?;';

        db.query(query, [id], (err, results) => {
            if (err) {
                console.error('Error deleting data:', err);
                res.status(500).send('Database delete failed');
            } else {
                if (results.affectedRows > 0) {
                    res.json({ message: 'Attraction deleted successfully', results });
                } else {
                    res.status(404).send('Attraction not found');
                }
            }
        });
    });
    //Sterge atractie
    router.post('/attractions-delete', (req, res) => {
        // Extract the ID from the request body
        const { id } = req.body; // Assuming the body contains { id_event: 17 }

        if (!id) {
            res.status(400).send('ID is required');
            return;
        }

        const query = 'DELETE FROM atractii WHERE Atractii_Id = ?;';

        db.query(query, [id], (err, results) => {
            if (err) {
                console.error('Error deleting data:', err);
                res.status(500).send('Database delete failed');
            } else {
                if (results.affectedRows > 0) {
                    res.json({ message: 'Attraction deleted successfully', results });
                } else {
                    res.status(404).send('Attraction not found');
                }
            }
        });
    });
    //Creeaza eveniment
    router.post('/createEvent', (req, res) => {
        const {
            eventName,
            startDateTime,
            endDateTime,
            description,
            price,
            attractions,
            transport_id
        } = req.body;

        // Step 1: Insert into evenimente table
        const insertEventQuery = `
            INSERT INTO evenimente (Transport_Id, Data_Inceput, Data_Final, Descriere, Pret, Nume_eveniment, Ocupat)
            VALUES (?, ?, ?, ?, ?, ?, 0);
        `;

        db.query(
            insertEventQuery,
            [transport_id, startDateTime, endDateTime, description, price, eventName],
            (err, result) => {
                if (err) {
                    console.error('Error inserting into evenimente:', err);
                    res.status(500).send('Failed to create event');
                    return;
                }

                // Get the ID of the newly created event
                const eventId = result.insertId;

                // Step 2: Insert into evenimente_a_e_o for each attraction
                const insertAttractionQuery = `
                    INSERT INTO evenimente_a_e_o (Evenitment_Id, Atractii_Id)
                    VALUES (?, ?);
                `;

                const insertAttractionPromises = attractions.map((attractionId) =>
                    new Promise((resolve, reject) => {
                        db.query(insertAttractionQuery, [eventId, attractionId], (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    })
                );

                // Wait for all insertions to complete
                Promise.all(insertAttractionPromises)
                    .then(() => {
                        res.send('Event and attractions added successfully');
                    })
                    .catch((insertErr) => {
                        console.error('Error inserting into evenimente_a_e_o:', insertErr);
                        res.status(500).send('Failed to add attractions');
                    });
            }
        );
    });
    //Creeaza  Atractie 
    router.post('/createAttraction', async (req, res) => {
        const { Nume_Atractie, Descriere_Atractie, URL_Poza } = req.body;

        if (!Nume_Atractie || !Descriere_Atractie || !URL_Poza) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const query = 'INSERT INTO atractii (Nume_Atractie, Descriere_Atractie, URL_Poza) VALUES (?, ?, ?)';

        try {
            await db.execute(query, [Nume_Atractie, Descriere_Atractie, URL_Poza]);
            res.status(201).json({ message: 'Attraction created successfully!' });
        } catch (error) {
            console.error('Error creating attraction:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    });
    //ocupatie + cate bilete au fost cumparate
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
    //creeaza cont
    router.post('/createAccount', (req, res) => {
        const { nume, sex, numarTelefon, cnp, email, varsta, parola } = req.body;

        // Start a transaction
        db.beginTransaction((err) => {
            if (err) {
                return res.status(500).send({ message: 'Transaction start failed', error: err });
            }

            // Query 1: Insert into date_personale table
            const query1 = `
                INSERT INTO date_personale (nume_complet, cnp, sex, nr_telefon, email, varsta)
                VALUES (?, ?, ?, ?, ?, ?);
            `;

            db.query(query1, [nume, cnp, sex, numarTelefon, email, varsta], (err, results) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error inserting into date_personale:', err);
                        return res.status(500).send({ message: 'Error inserting into date_personale', error: err });
                    });
                }

                // Query 2: Insert into excursionisti table
                const query2 = `
                    INSERT INTO excursionisti (Nr_excursii, bani_cheltuiti, parola, date_personale_id)
                    VALUES (0, 0, ?, LAST_INSERT_ID());
                `;

                db.query(query2, [parola], (err, results) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error inserting into excursionisti:', err);
                            return res.status(500).send({ message: 'Error inserting into excursionisti', error: err });
                        });
                    }

                    // Commit the transaction after both queries succeed
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error('Error committing transaction:', err);
                                return res.status(500).send({ message: 'Error committing transaction', error: err });
                            });
                        }

                        // Success response after successful commit
                        return res.json({ message: 'Account created successfully', results });
                    });
                });
            });
        });
    });
    //creeaza angajat
    router.post('/createAngajat', (req, res) => {
        const { nume, sex, numarTelefon, cnp, email, varsta,adresaAngajare,salariu } = req.body;

        // Start a transaction
        db.beginTransaction((err) => {
            if (err) {
                return res.status(500).send({ message: 'Transaction start failed', error: err });
            }

            // Query 1: Insert into date_personale table
            const query1 = `
                INSERT INTO date_personale (nume_complet, cnp, sex, nr_telefon, email, varsta)
                VALUES (?, ?, ?, ?, ?, ?);
            `;

            db.query(query1, [nume, cnp, sex, numarTelefon, email, varsta], (err, results) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error inserting into date_personale:', err);
                        return res.status(500).send({ message: 'Error inserting into date_personale', error: err });
                    });
                }

                // Query 2: Insert into excursionisti table
                const query2 = `
                    INSERT INTO organizatori (Data_Angajarii,Salariu ,date_personale_id)
                    VALUES (?, ?, LAST_INSERT_ID());
                `;

                db.query(query2, [adresaAngajare,salariu], (err, results) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error inserting into excursionisti:', err);
                            return res.status(500).send({ message: 'Error inserting into excursionisti', error: err });
                        });
                    }

                    // Commit the transaction after both queries succeed
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error('Error committing transaction:', err);
                                return res.status(500).send({ message: 'Error committing transaction', error: err });
                            });
                        }

                        // Success response after successful commit
                        return res.json({ message: 'Account created successfully', results });
                    });
                });
            });
        });
    });
    //update evenimente_a_e_o pentru fiecare    
    router.post('/createPurchase', (req, res) => {
        const { selectedTickets, eventId, userId } = req.body;

        // Step 1: Check if a record exists in the evenimente_a_e_o table
        const checkQuery = 'SELECT nr_bilete FROM evenimente_a_e_o WHERE Evenitment_Id = ? AND Excursionisti_Id = ?';
        
        db.query(checkQuery, [eventId, userId], (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                res.status(500).send('Database query failed');
                return;
            }

            if (results.length > 0) {
                // If record exists and has a column nr_bilete
                const currentTickets = results[0].nr_bilete || 0;
                const newTicketCount = currentTickets + selectedTickets;

                // Step 2: Update the nr_bilete with the new value
                const updateQuery = 'UPDATE evenimente_a_e_o SET nr_bilete = ? WHERE Evenitment_Id = ? AND Excursionisti_Id = ?';

                db.query(updateQuery, [newTicketCount, eventId, userId], (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating data:', updateErr);
                        res.status(500).send('Failed to update ticket count');
                    } else {
                        res.send('Ticket count updated successfully');
                    }
                });
            } else {
                // Step 3: If no record exists, create a new row with selectedTickets
                const insertQuery = 'INSERT INTO evenimente_a_e_o (Evenitment_Id, Excursionisti_Id, nr_bilete) VALUES (?, ?, ?)';

                db.query(insertQuery, [eventId, userId, selectedTickets], (insertErr) => {
                    if (insertErr) {
                        console.error('Error inserting data:', insertErr);
                        res.status(500).send('Failed to create new record');
                    } else {
                        res.send('New record created with selected tickets');
                    }
                });
            }
        });
    });
    //Afiseaza toti excursionisti pentru Baza de date ***
    router.get('/excursionisti',(req,res) =>{
        const query =  `Select dp.nume_complet,dp.varsta,dp.cnp,dp.nr_telefon,dp.email ,tabel.Excursionisti_Id
        From date_personale dp Inner JOIn 
        (Select ex.Excursionisti_Id,ex.Date_Personale_Id from excursionisti ex) 
        as tabel On tabel.Date_Personale_Id = dp.Persoana_Id Order By dp.nume_complet ASC;`
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                res.status(500).send('Database query failed');
            } else {
                res.json(results);
            }
        });
    })
    router.post('/')
    //Afiseaza toti angajatii pentru Baza de date ***
    router.get('/angajati',(req,res) =>{
        const query =  `Select dp.nume_complet,dp.varsta,dp.cnp,dp.nr_telefon,dp.email ,tabel.Salariu,tabel.Organizatori_Id From date_personale dp
    Inner JOIn 
    (Select orr.Salariu, orr.Organizatori_Id,orr.Date_Personale_Id from organizatori orr) as tabel
    On tabel.Date_Personale_Id = dp.Persoana_Id
    Order By dp.nume_complet ASC;`

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                res.status(500).send('Database query failed');
            } else {
                res.json(results);
            }
        });
    })
    //Sterge excursionisti
    router.post('/deleteExcursionist', (req, res) => {
        // Extract the ID from the request body
        const { Excursionisti_ID } = req.body; // Assuming the body contains { id_event: 17 }

        if (!Excursionisti_ID) {
            res.status(400).send('ID is required');
            return;
        }

        const query = 'DELETE FROM excursionisti WHERE Excursionisti_ID = ?;';

        db.query(query, [Excursionisti_ID], (err, results) => {
            if (err) {
                console.error('Error deleting data:', err);
                res.status(500).send('Database delete failed');
            } else {
                if (results.affectedRows > 0) {
                    res.json({ message: 'Attraction deleted successfully', results });
                } else {
                    res.status(404).send('Attraction not found');
                }
            }
        });
    });
    //Sterge organizatori
    router.post('/deleteOrganizatori', (req, res) => {
        // Extract the ID from the request body
        const { Organizator_ID } = req.body; // Assuming the body contains { id_event: 17 }

        if (!Organizator_ID) {
            res.status(400).send('ID is required');
            return;
        }

        const query = 'DELETE FROM organizatori WHERE Organizatori_Id = ?;';

        db.query(query, [Organizator_ID], (err, results) => {
            if (err) {
                console.error('Error deleting data:', err);
                res.status(500).send('Database delete failed');
            } else {
                if (results.affectedRows > 0) {
                    res.json({ message: 'Attraction deleted successfully', results });
                } else {
                    res.status(404).send('Attraction not found');
                }
            }
        });
    });
    //Update salariu cand se executa
    router.post('/update-salary', (req, res) => {
        const { Id,Salariu} = req.body;

        // Step 1: Check if a record exists in the evenimente_a_e_o table
        const checkQuery = `UPDATE organizatori
                            SET Salariu = ?
                            WHERE Organizatori_Id = ?;`;
        
        db.query(checkQuery, [Salariu, Id], (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                res.status(500).send('Database query failed');
                return;
            }

            
        });
    });
    //Copiaza eveniment Cand apas copy
    router.post('/copy-event', (req, res) => {
        // Extract the event ID, start datetime, and end datetime from the request body
        const { id, startDatetime, endDatetime } = req.body;

        if (!id || !startDatetime || !endDatetime) {
            res.status(400).send('Event ID, startDatetime, and endDatetime are required');
            return;
        }

        // Start a transaction to ensure atomicity
        db.beginTransaction((err) => {
            if (err) {
                console.error('Error starting transaction:', err);
                return res.status(500).send('Transaction start failed');
            }

            // Step 1: Insert the new event with the same name, transport, and other details but with new dates
            const insertEventQuery = `
                INSERT INTO evenimente (Transport_Id, Data_Inceput, Data_Final, Descriere, Pret, Nume_eveniment, Ocupat)
                SELECT Transport_Id, ?, ?, Descriere, Pret, Nume_eveniment, 0
                FROM evenimente
                WHERE Eveniment_Id = ?;
            `;
            
            db.query(insertEventQuery, [startDatetime, endDatetime, id], (err, results) => {
                if (err) {
                    console.error('Error inserting new event:', err);
                    return db.rollback(() => res.status(500).send('Database insert failed'));
                }

                // Get the ID of the new event (after insertion)
                const newEventId = results.insertId;

                // Step 2: Copy rows from evenimente_a_e_o for the original event where Atractii_Id is not NULL
                const copyRowsQuery = `
                    INSERT INTO evenimente_a_e_o (Evenitment_Id, Atractii_Id)
                    SELECT ?, Atractii_Id
                    FROM evenimente_a_e_o
                    WHERE Evenitment_Id = ? AND Atractii_Id IS NOT NULL;
                `;


                
                db.query(copyRowsQuery, [newEventId, id], (err, results) => {
                    if (err) {
                        console.error('Error copying rows:', err);
                        return db.rollback(() => res.status(500).send('Failed to copy rows'));
                    }

                    // If everything went well, commit the transaction
                    db.commit((err) => {
                        if (err) {
                            console.error('Error committing transaction:', err);
                            return db.rollback(() => res.status(500).send('Transaction commit failed'));
                        }

                        // Send a success response
                        res.json({
                            message: 'Event copied successfully',
                            newEventId: newEventId,
                            copiedRows: results.affectedRows,
                        });
                    });
                });
            });
        });
    });
    //
    router.post('/change_org_event', (req, res) => {
        // Extrage id și lista de Organizatori_Id din query
        const { id, selectedOrganizers } = req.body;
        console.log(req.query);
        if (!id || !selectedOrganizers || !Array.isArray(selectedOrganizers) || selectedOrganizers.length === 0) {
            return res.status(400).send('Event ID and selectedOrganizers (array of IDs) are required');
        }

        // 1. Șterge toate elementele din tabelul evenimente_a_e_o care au Eveniment_Id = id și Organizatori_Id != NULL
        const deleteQuery = `
            DELETE FROM evenimente_a_e_o
            WHERE Evenitment_Id = ? AND Organizatori_Id IS NOT NULL;
        `;

        db.query(deleteQuery, [id], (err, results) => {
            if (err) {
                console.error('Error deleting event organizers:', err);
                return res.status(500).send('Error deleting event organizers');
            }

            // 2. Creează noile înregistrări cu Eveniment_Id = id și Organizatori_Id = fiecare ID din selectedOrganizers
            const insertQuery = `
                INSERT INTO evenimente_a_e_o (Evenitment_Id, Organizatori_Id)
                VALUES ?
            `;

            // Pregătim valorile pentru inserare
            const values = selectedOrganizers.map((organizerId) => [id, organizerId]);

            db.query(insertQuery, [values], (err, results) => {
                if (err) {
                    console.error('Error inserting new event organizers:', err);
                    return res.status(500).send('Error inserting new event organizers');
                }

                res.json({
                    message: 'Organizers successfully updated for event',
                    insertedRows: results.affectedRows,
                });
            });
        });
    });

    module.exports = router; // Ensure you're exporting the router
