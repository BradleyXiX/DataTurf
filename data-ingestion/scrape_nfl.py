import logging
from db import get_db_connection
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_and_insert_mock_nfl_data():
    conn = get_db_connection()
    cur = conn.cursor()
    
    teams = [
        ("Kansas City Chiefs", 11, 4, 0, 360, 280),
        ("San Francisco 49ers", 12, 3, 0, 420, 250),
        ("Baltimore Ravens", 13, 2, 0, 410, 240),
        ("Philadelphia Eagles", 10, 5, 0, 380, 320),
    ]

    players = [
        ("Patrick Mahomes", "Kansas City Chiefs", "QB", 4100, 28, 350, 0),
        ("Travis Kelce", "Kansas City Chiefs", "TE", 0, 0, 0, 950),
        ("Brock Purdy", "San Francisco 49ers", "QB", 4200, 31, 150, 0),
        ("Christian McCaffrey", "San Francisco 49ers", "RB", 0, 0, 1400, 500),
        ("Lamar Jackson", "Baltimore Ravens", "QB", 3500, 24, 800, 0),
    ]

    try:
        for t in teams:
            cur.execute("""
                INSERT INTO nfl_standings (team_name, wins, losses, ties, points_for, points_against)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (team_name) DO UPDATE SET
                    wins = EXCLUDED.wins, losses = EXCLUDED.losses,
                    ties = EXCLUDED.ties, points_for = EXCLUDED.points_for,
                    points_against = EXCLUDED.points_against;
            """, t)

        for p in players:
            cur.execute("""
                INSERT INTO nfl_player_stats (player_name, team_name, position, passing_yards, passing_tds, rushing_yards, receiving_yards)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (player_name) DO UPDATE SET
                    position = EXCLUDED.position, passing_yards = EXCLUDED.passing_yards,
                    passing_tds = EXCLUDED.passing_tds, rushing_yards = EXCLUDED.rushing_yards,
                    receiving_yards = EXCLUDED.receiving_yards;
            """, p)
            
        match_date = (datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d')
        cur.execute("""
            INSERT INTO fixtures (sport, match_date, home_team, away_team, status)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (sport, match_date, home_team, away_team) DO UPDATE SET status = EXCLUDED.status;
        """, ("nfl", match_date, "San Francisco 49ers", "Kansas City Chiefs", "Scheduled"))

        conn.commit()
        logger.info("Successfully populated mock rich NFL data.")
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to insert data: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    generate_and_insert_mock_nfl_data()
