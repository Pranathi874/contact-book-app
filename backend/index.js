const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite DB
const db = new sqlite3.Database('./contacts.db', err => {
  if (err) console.error('DB error:', err);
  else console.log('Connected to contacts.db');
});

// Create table if missing
db.run(`CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL
)`);

// POST /contacts - add contact
app.post('/contacts', (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !/^\d{10}$/.test(phone))
    return res.status(400).json({ error: 'Invalid input' });

  db.run('INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)', [name, email, phone], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, name, email, phone });
  });
});

// GET /contacts - fetch paginated contacts
app.get('/contacts', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.all('SELECT * FROM contacts LIMIT ? OFFSET ?', [limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT COUNT(*) AS count FROM contacts', (err, countRow) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ contacts: rows, total: countRow.count });
    });
  });
});

// DELETE /contacts/:id - remove contact
app.delete('/contacts/:id', (req, res) => {
  db.run('DELETE FROM contacts WHERE id = ?', req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Contact not found' });
    res.sendStatus(204);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
