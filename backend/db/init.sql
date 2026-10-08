CREATE TABLE IF NOT EXISTS u18_football_standings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(255) UNIQUE NOT NULL,
    matches_played INT DEFAULT 0,
    wins INT DEFAULT 0,
    draws INT DEFAULT 0,
    losses INT DEFAULT 0,
    points INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS u18_football_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_date DATE NOT NULL,
    home_team VARCHAR(255) NOT NULL,
    away_team VARCHAR(255) NOT NULL,
    home_score INT,
    away_score INT
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
    per DECIMAL(5,1) DEFAULT 0.0,
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

-- Initializing structure for NBA and NFL without mock data (scrapers will populate)

-- Mock Data for Football Matches
INSERT INTO u18_football_matches (match_date, home_team, away_team, home_score, away_score)
VALUES
('2024-01-01', 'Manchester United U18', 'Mock Opponent', 2, 1),
('2024-01-08', 'Manchester United U18', 'Mock Opponent 2', 3, 0),
('2024-01-15', 'Manchester United U18', 'Mock Opponent 3', 1, 1),
('2024-01-22', 'Mock Opponent 4', 'Manchester United U18', 0, 2),
('2024-01-29', 'Mock Opponent 5', 'Manchester United U18', 1, 3);
