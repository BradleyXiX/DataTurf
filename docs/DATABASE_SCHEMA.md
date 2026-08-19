# Database Schema (PostgreSQL)

## Tables

### 1. `u18_football_standings`
Stores the current league standings.
* `id` (UUID, Primary Key)
* `team_name` (VARCHAR, Unique)
* `matches_played` (INT)
* `wins` (INT)
* `draws` (INT)
* `losses` (INT)
* `points` (INT)
* `last_updated` (TIMESTAMP)

### 2. `u18_football_matches`
Tracks individual match results.
* `id` (UUID, Primary Key)
* `date` (DATE)
* `home_team` (VARCHAR)
* `away_team` (VARCHAR)
* `home_score` (INT)
* `away_score` (INT)

### 3. `pga_leaderboard`
Tracks ongoing or completed tournament results.
* `id` (UUID, Primary Key)
* `tournament_name` (VARCHAR)
* `player_name` (VARCHAR)
* `position` (INT)
* `total_score` (INT)
* `rounds_played` (INT)
* `last_updated` (TIMESTAMP)