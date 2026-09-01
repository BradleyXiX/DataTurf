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

router.get('/performance/:domain', async (req, res) => {
  const { domain } = req.params;
  try {
    if (domain === 'football') {
      // Return mock historical chart data for football (would query matches table in real implementation)
      const data = [
        { match: 'M1', points: 3 },
        { match: 'M2', points: 6 },
        { match: 'M3', points: 7 },
        { match: 'M4', points: 10 },
        { match: 'M5', points: 13 },
        { match: 'M6', points: 13 },
        { match: 'M7', points: 16 },
      ];
      return res.json(data);
    } else if (domain === 'golf') {
      // Return mock historical chart data for golf
      const data = [
        { match: 'R1', points: -2 },
        { match: 'R2', points: -4 },
        { match: 'R3', points: -6 },
        { match: 'R4', points: -8 },
      ];
      return res.json(data);
    }
    return res.status(400).json({ error: 'Invalid domain' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
