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
