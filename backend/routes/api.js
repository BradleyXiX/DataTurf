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
      const { rows } = await db.query(`
        SELECT match_date, home_team, away_team, home_score, away_score 
        FROM u18_football_matches 
        WHERE home_team = 'Manchester United U18' OR away_team = 'Manchester United U18'
        ORDER BY match_date ASC
      `);
      
      let cumulativePoints = 0;
      const data = rows.map((row, index) => {
        let matchPoints = 0;
        if (row.home_team === 'Manchester United U18') {
          if (row.home_score > row.away_score) matchPoints = 3;
          else if (row.home_score === row.away_score) matchPoints = 1;
        } else {
          if (row.away_score > row.home_score) matchPoints = 3;
          else if (row.away_score === row.home_score) matchPoints = 1;
        }
        cumulativePoints += matchPoints;
        
        return {
          match: `M${index + 1}`,
          points: cumulativePoints
        };
      });
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
