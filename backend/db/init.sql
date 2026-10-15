CREATE TABLE IF NOT EXISTS pl_standings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(255) UNIQUE NOT NULL,
    matches_played INT DEFAULT 0,
    wins INT DEFAULT 0,
    draws INT DEFAULT 0,
    losses INT DEFAULT 0,
    points INT DEFAULT 0,
    goals_for INT DEFAULT 0,
    goals_against INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pl_player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_name VARCHAR(255) UNIQUE NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    goals INT DEFAULT 0,
    assists INT DEFAULT 0,
    xg DECIMAL(5,2) DEFAULT 0.0,
    xa DECIMAL(5,2) DEFAULT 0.0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nba_standings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(255) UNIQUE NOT NULL,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    win_pct DECIMAL(4,3) DEFAULT 0.0,
    pts_per_game DECIMAL(5,1) DEFAULT 0.0,
    opp_pts_per_game DECIMAL(5,1) DEFAULT 0.0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nba_player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_name VARCHAR(255) UNIQUE NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    points_per_game DECIMAL(5,1) DEFAULT 0.0,
    rebounds_per_game DECIMAL(5,1) DEFAULT 0.0,
    assists_per_game DECIMAL(5,1) DEFAULT 0.0,
    steals_per_game DECIMAL(5,1) DEFAULT 0.0,
    blocks_per_game DECIMAL(5,1) DEFAULT 0.0,
    turnovers_per_game DECIMAL(5,1) DEFAULT 0.0,
    ts_pct DECIMAL(4,3) DEFAULT 0.0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nfl_standings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(255) UNIQUE NOT NULL,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    ties INT DEFAULT 0,
    points_for INT DEFAULT 0,
    points_against INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nfl_player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_name VARCHAR(255) UNIQUE NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    position VARCHAR(10),
    passing_yards INT DEFAULT 0,
    passing_tds INT DEFAULT 0,
    rushing_yards INT DEFAULT 0,
    receiving_yards INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fixtures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport VARCHAR(50) NOT NULL,
    match_date DATE NOT NULL,
    home_team VARCHAR(255) NOT NULL,
    away_team VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Scheduled',
    home_score INT,
    away_score INT,
    UNIQUE(sport, match_date, home_team, away_team)
);

CREATE TABLE IF NOT EXISTS managers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manager_name VARCHAR(255) UNIQUE NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    sport VARCHAR(50) NOT NULL,
    win_pct DECIMAL(4,3) DEFAULT 0.0,
    preferred_formation VARCHAR(50),
    play_style VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS predicted_lineups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
    team_name VARCHAR(255) NOT NULL,
    formation VARCHAR(50),
    players JSONB NOT NULL,
    UNIQUE(fixture_id, team_name)
);

-- Initial Seed Data
INSERT INTO pl_standings (team_name, matches_played, wins, draws, losses, points, goals_for, goals_against) VALUES
    ('Liverpool', 28, 20, 7, 1, 67, 64, 24),
    ('Arsenal', 28, 17, 7, 4, 58, 54, 22),
    ('Nottingham Forest', 28, 14, 6, 8, 48, 42, 33),
    ('Manchester City', 28, 14, 5, 9, 47, 54, 37),
    ('Chelsea', 28, 13, 7, 8, 46, 52, 36),
    ('Newcastle United', 28, 13, 5, 10, 44, 46, 38),
    ('Aston Villa', 28, 12, 6, 10, 42, 43, 46),
    ('Fulham', 28, 11, 9, 8, 42, 41, 37),
    ('Brighton', 28, 10, 10, 8, 40, 44, 42),
    ('Bournemouth', 28, 11, 7, 10, 40, 43, 36)
ON CONFLICT (team_name) DO NOTHING;

INSERT INTO nba_standings (team_name, wins, losses, win_pct, pts_per_game, opp_pts_per_game) VALUES
    ('Boston Celtics', 20, 5, 0.800, 120.5, 110.2),
    ('Milwaukee Bucks', 18, 7, 0.720, 118.4, 112.5),
    ('Denver Nuggets', 17, 8, 0.680, 115.2, 108.9),
    ('Los Angeles Lakers', 14, 11, 0.560, 113.1, 114.2)
ON CONFLICT (team_name) DO NOTHING;

INSERT INTO nfl_standings (team_name, wins, losses, ties, points_for, points_against) VALUES
    ('Kansas City Chiefs', 11, 4, 0, 360, 280),
    ('San Francisco 49ers', 12, 3, 0, 420, 250),
    ('Baltimore Ravens', 13, 2, 0, 410, 240),
    ('Philadelphia Eagles', 10, 5, 0, 380, 320)
ON CONFLICT (team_name) DO NOTHING;

INSERT INTO pl_player_stats (player_name, team_name, goals, assists, xg, xa) VALUES
    ('Mohamed Salah', 'Liverpool', 21, 13, 18.5, 11.2),
    ('Erling Haaland', 'Manchester City', 21, 3, 19.8, 3.2),
    ('Cole Palmer', 'Chelsea', 14, 7, 12.4, 8.1),
    ('Alexander Isak', 'Newcastle United', 17, 4, 15.2, 3.5),
    ('Bukayo Saka', 'Arsenal', 10, 10, 9.1, 10.4)
ON CONFLICT (player_name) DO NOTHING;

INSERT INTO nba_player_stats (player_name, team_name, points_per_game, rebounds_per_game, assists_per_game, steals_per_game, blocks_per_game, turnovers_per_game, ts_pct) VALUES
    ('Jayson Tatum', 'Boston Celtics', 27.5, 8.2, 4.5, 1.2, 0.6, 2.5, 0.610),
    ('Nikola Jokic', 'Denver Nuggets', 26.5, 12.1, 9.8, 1.4, 0.7, 3.1, 0.650),
    ('Giannis Antetokounmpo', 'Milwaukee Bucks', 31.2, 11.5, 6.2, 1.3, 1.1, 3.5, 0.630),
    ('LeBron James', 'Los Angeles Lakers', 25.4, 7.5, 7.9, 1.2, 0.5, 3.4, 0.590)
ON CONFLICT (player_name) DO NOTHING;

INSERT INTO nfl_player_stats (player_name, team_name, position, passing_yards, passing_tds, rushing_yards, receiving_yards) VALUES
    ('Patrick Mahomes', 'Kansas City Chiefs', 'QB', 4100, 28, 350, 0),
    ('Brock Purdy', 'San Francisco 49ers', 'QB', 4200, 31, 150, 0),
    ('Lamar Jackson', 'Baltimore Ravens', 'QB', 3500, 24, 800, 0)
ON CONFLICT (player_name) DO NOTHING;

INSERT INTO fixtures (sport, match_date, home_team, away_team, status, home_score, away_score) VALUES
    ('pl', '2026-10-10', 'Liverpool', 'Chelsea', 'Finished', 2, 1),
    ('pl', '2026-10-12', 'Arsenal', 'Manchester City', 'Finished', 2, 0),
    ('pl', '2026-10-14', 'Aston Villa', 'Manchester United', 'Finished', 1, 0),
    ('pl', '2026-10-18', 'Liverpool', 'Arsenal', 'Scheduled', NULL, NULL),
    ('nba', '2026-10-18', 'Denver Nuggets', 'Los Angeles Lakers', 'Scheduled', NULL, NULL),
    ('nfl', '2026-10-19', 'San Francisco 49ers', 'Kansas City Chiefs', 'Scheduled', NULL, NULL)
ON CONFLICT (sport, match_date, home_team, away_team) DO NOTHING;

INSERT INTO managers (manager_name, team_name, sport, win_pct, preferred_formation, play_style) VALUES
    ('Liverpool Head Coach', 'Liverpool', 'pl', 0.720, '4-3-3 Attacking', 'High Press / Possession'),
    ('Arsenal Head Coach', 'Arsenal', 'pl', 0.680, '4-2-3-1', 'Positional Play')
ON CONFLICT (manager_name) DO NOTHING;

