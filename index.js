const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

const PORT = 8080;

let db = new sqlite3.Database('./sqlite.db', sqlite3.OPEN_READWRITE, err => {
    if (err) console.error(err.message);
    console.log('Connected to the sqlite database.');
});

app.use(cors({ origin: '*' }));
app.use(express.json());

app.listen(PORT, console.info(`API is running on: http://localhost:${PORT}`));

app.get('/', (req, res) => {
    res.status(200).redirect(`https://www.google.com.br`);
});

app.get('/list-emails', (req, res) => {
    db.serialize(() => {
        db.all(`SELECT * FROM EMAILS;`, (err, rows) => {
            if (err) {
                console.error(err.message);
                res.status(500).send({ success: false, data: 'Error when trying to retrieve information from database!' });
            } else {
                res.status(200).send({ success: true, data: rows });
                // db.close(err => {
                //     if (err) console.error(err.message);
                //     console.log('Close the database connection.');
                // });
            }
        });
    });
});

app.post(`/add-email`, (req, res) => {
    db.serialize(() => {
        if (typeof req.body['nome'] === 'string' && typeof req.body['telefone'] === 'string' && typeof req.body['email'] === 'string') {
            db.run(`INSERT INTO EMAILS (NOME, TELEFONE, EMAIL) VALUES('${req.body['nome']}', '${req.body['telefone']}', '${req.body['email']}');`, (err, row) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).send({ success: false, data: 'Error trying to insert information into the database!' });
                } else {
                    res.status(200).send({ success: true, data: 'Success adding information to database!' });
                    // db.close(err => {
                    //     if (err) console.error(err.message);
                    //     console.log('Close the database connection.');
                    // });
                }
            });
        } else res.status(406).send({ success: false, data: 'The information sent does not match the parameters needed to include it in the database!' });
    });
});