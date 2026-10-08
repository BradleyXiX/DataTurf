import logging
from db import get_db_connection
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_and_insert_mock_nba_data():
    conn = get_db_connection()
    cur = conn.cursor()
    
    teams = [
        ("Boston Celtics", 20, 5, 0.800, 120.5, 110.2),
        ("Milwaukee Bucks", 18, 7, 0.720, 118.4, 112.5),
        ("Denver Nuggets", 17, 8, 0.680, 115.2, 108.9),
        ("Los Angeles Lakers", 14, 11, 0.560, 113.1, 114.2),
    ]

    players = [
        ("Jayson Tatum", "Boston Celtics", 27.5, 8.2, 4.5, 1.2, 0.6, 2.5, 0.610),
        ("Jaylen Brown", "Boston Celtics", 23.1, 5.4, 3.2, 1.1, 0.4, 2.2, 0.580),
        ("Giannis Antetokounmpo", "Milwaukee Bucks", 31.2, 11.5, 6.2, 1.3, 1.1, 3.5, 0.630),
        ("Nikola Jokic", "Denver Nuggets", 26.5, 12.1, 9.8, 1.4, 0.7, 3.1, 0.650),
        ("LeBron James", "Los Angeles Lakers", 25.4, 7.5, 7.9, 1.2, 0.5, 3.4, 0.590),
    ]

    try:
        for t in teams:
            cur.execute("""
                INSERT INTO nba_standings (team_name, wins, losses, win_pct, pts_per_game, opp_pts_per_game)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (team_name) DO UPDATE SET
                    wins = EXCLUDED.wins, losses = EXCLUDED.losses,
                    win_pct = EXCLUDED.win_pct, pts_per_game = EXCLUDED.pts_per_game,
                    opp_pts_per_game = EXCLUDED.opp_pts_per_game;
            """, t)

        for p in players:
            cur.execute("""
                INSERT INTO nba_player_stats (player_name, team_name, points_per_game, rebounds_per_game, assists_per_game, steals_per_game, blocks_per_game, turnovers_per_game, ts_pct)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (player_name) DO UPDATE SET
                    points_per_game = EXCLUDED.points_per_game, rebounds_per_game = EXCLUDED.rebounds_per_game,
                    assists_per_game = EXCLUDED.assists_per_game, steals_per_game = EXCLUDED.steals_per_game,
                    blocks_per_game = EXCLUDED.blocks_per_game, turnovers_per_game = EXCLUDED.turnovers_per_game,
                    ts_pct = EXCLUDED.ts_pct;
            """, p)
            
        match_date = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        cur.execute("""
            INSERT INTO fixtures (sport, match_date, home_team, away_team, status)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (sport, match_date, home_team, away_team) DO UPDATE SET status = EXCLUDED.status;
        """, ("nba", match_date, "Denver Nuggets", "Los Angeles Lakers", "Scheduled"))

        conn.commit()
        logger.info("Successfully populated mock rich NBA data.")
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to insert data: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    generate_and_insert_mock_nba_data()
