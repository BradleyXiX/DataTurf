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

CREATE TABLE IF NOT EXISTS pga_leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_name VARCHAR(255) NOT NULL,
    player_name VARCHAR(255) NOT NULL,
    position INT,
    total_score INT,
    rounds_played INT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mock Data for Football Standings
INSERT INTO u18_football_standings (team_name, matches_played, wins, draws, losses, points)
VALUES
('Manchester United U18', 20, 16, 2, 2, 50),
('Manchester City U18', 20, 15, 3, 2, 48),
('Liverpool U18', 20, 12, 4, 4, 40)
ON CONFLICT (team_name) DO NOTHING;

-- Mock Data for PGA Leaderboard
INSERT INTO pga_leaderboard (tournament_name, player_name, position, total_score, rounds_played)
VALUES
('The Masters', 'Scottie Scheffler', 1, -11, 4),
('The Masters', 'Rory McIlroy', 2, -8, 4),
('The Masters', 'Jon Rahm', 3, -7, 4);

-- Mock Data for Football Matches
INSERT INTO u18_football_matches (match_date, home_team, away_team, home_score, away_score)
VALUES
('2024-01-01', 'Manchester United U18', 'Mock Opponent', 2, 1),
('2024-01-08', 'Manchester United U18', 'Mock Opponent 2', 3, 0),
('2024-01-15', 'Manchester United U18', 'Mock Opponent 3', 1, 1),
('2024-01-22', 'Mock Opponent 4', 'Manchester United U18', 0, 2),
('2024-01-29', 'Mock Opponent 5', 'Manchester United U18', 1, 3);
