const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));

// Baca data lagu
const songsData = JSON.parse(fs.readFileSync('./songs.json', 'utf8'));

// Routes
app.get('/api/songs', (req, res) => {
  res.json(songsData);
});

app.get('/api/songs/:id', (req, res) => {
  const song = songsData.find(s => s.id === parseInt(req.params.id));
  if (song) {
    res.json(song);
  } else {
    res.status(404).json({ message: 'Lagu tidak ditemukan' });
  }
});

app.get('/api/songs/:id/lyrics', (req, res) => {
  const song = songsData.find(s => s.id === parseInt(req.params.id));
  if (song && song.lyrics) {
    res.json({ lyrics: song.lyrics });
  } else {
    res.status(404).json({ message: 'Lirik tidak ditemukan' });
  }
});

// Serve frontend untuk production
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});