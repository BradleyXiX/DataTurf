const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/standings/football/u18', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM u18_football_standings ORDER BY points DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/leaderboard/golf/pga', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM pga_leaderboard ORDER BY position ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
