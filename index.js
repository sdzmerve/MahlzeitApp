import 'expo-router/entry';
import express from 'express';
import bcrypt from 'bcrypt';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(express.json()); // für JSON-Body

// Verbindung zur Supabase-Datenbank
const pool = new Pool({
  connectionString: '//postgres:kkpasgmwvdrqyrvepmkx@db.kkpasgmwvdrqyrvepmkx.supabase.co:5432/postgres', // siehe unten
});

// Registrierung
app.post('/register', async (req, res) => {
  const { email, password, vorname, hauptmensa } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO "User" ("E-Mail-Adresse", "Passwort", "Vorname", "Hauptmensa") 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [email, hashedPassword, vorname, hauptmensa]
  );

  res.json({ message: 'Registrierung erfolgreich', user: result.rows[0] });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    'SELECT * FROM "User" WHERE "E-Mail-Adress" = $1',
    [email]
  );

  const user = result.rows[0];
  if (!user) return res.status(400).json({ error: 'Benutzer nicht gefunden' });

  const match = await bcrypt.compare(password, user.Passwort);
  if (!match) return res.status(401).json({ error: 'Falsches Passwort' });

  res.json({ message: 'Login erfolgreich', user });
});

// Server starten
app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});
