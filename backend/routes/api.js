const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/standings/pl', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM pl_standings ORDER BY points DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/players/pl', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM pl_player_stats ORDER BY goals DESC');
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

router.get('/players/nba', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM nba_player_stats ORDER BY points_per_game DESC');
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

router.get('/players/nfl', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM nfl_player_stats ORDER BY passing_yards DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/fixtures/:sport', async (req, res) => {
  const { sport } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM fixtures WHERE sport = $1 ORDER BY match_date ASC', [sport]);
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
        FROM fixtures 
        WHERE sport = 'pl' AND status = 'Finished'
        ORDER BY match_date ASC
        LIMIT 5
      `);
      
      const data = rows.map((row, index) => {
        return {
          match: \`M\${index + 1}\`,
          points: (row.home_score || 0) + (row.away_score || 0) // Example placeholder metric for form
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

// GET Managers by sport
router.get('/managers/:sport', async (req, res) => {
    try {
        const { sport } = req.params;
        const result = await db.query('SELECT * FROM managers WHERE sport = $1 ORDER BY win_pct DESC', [sport]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET Predicted Lineups for a specific fixture (by sport and matchup)
router.get('/predicted-lineups/:sport/:home_team/:away_team', async (req, res) => {
    try {
        const { sport, home_team, away_team } = req.params;
        const fixtureResult = await db.query(
            'SELECT id FROM fixtures WHERE sport = $1 AND home_team = $2 AND away_team = $3',
            [sport, home_team, away_team]
        );
        if (fixtureResult.rows.length === 0) {
            return res.status(404).json({ error: 'Fixture not found' });
        }
        const fixtureId = fixtureResult.rows[0].id;
        const lineupsResult = await db.query(
            'SELECT team_name, formation, players FROM predicted_lineups WHERE fixture_id = $1',
            [fixtureId]
        );
        res.json(lineupsResult.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
