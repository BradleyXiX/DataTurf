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

router.get('/standings/nba', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM nba_standings ORDER BY win_pct DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/standings/nfl', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM nfl_standings ORDER BY wins DESC, points_for DESC');
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
    } else if (domain === 'nba') {
      // Return radar chart placeholder stats for NBA team performance
      const data = [
        { stat: 'Offense', val: 110, fullMark: 130 },
        { stat: 'Defense', val: 105, fullMark: 130 },
        { stat: 'Pace', val: 98, fullMark: 110 },
        { stat: 'Rebounds', val: 45, fullMark: 60 },
        { stat: 'Assists', val: 25, fullMark: 35 },
      ];
      return res.json(data);
    } else if (domain === 'nfl') {
      // Return radar chart placeholder stats for NFL team performance
      const data = [
        { stat: 'Pass Yds', val: 250, fullMark: 350 },
        { stat: 'Rush Yds', val: 120, fullMark: 200 },
        { stat: 'Pass Def', val: 200, fullMark: 350 },
        { stat: 'Rush Def', val: 100, fullMark: 200 },
        { stat: 'Turnovers', val: 1.2, fullMark: 3 },
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
