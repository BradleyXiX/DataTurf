import logging
from bs4 import BeautifulSoup
from db import get_db_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def scrape_golf_leaderboard():
    """
    Mock scraper structure for PGA Tour live leaderboards.
    """
    logger.info("Starting scrape for PGA Golf Leaderboards...")
    
    # MOCK DATA simulating parsed HTML
    scraped_data = [
        {"tournament_name": "The Masters", "player_name": "Scottie Scheffler", "position": 1, "total_score": -12, "rounds_played": 4},
        {"tournament_name": "The Masters", "player_name": "Rory McIlroy", "position": 2, "total_score": -9, "rounds_played": 4},
        {"tournament_name": "The Masters", "player_name": "Jon Rahm", "position": 3, "total_score": -8, "rounds_played": 4},
    ]
    
    update_database(scraped_data)

def update_database(data):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # In a real scenario, we might delete old entries for a live tournament, or upsert.
        # Here we just truncate and insert for the sake of live leaderboard simplicity.
        cur.execute("TRUNCATE TABLE pga_leaderboard;")
        
        for row in data:
            cur.execute("""
                INSERT INTO pga_leaderboard (tournament_name, player_name, position, total_score, rounds_played, last_updated)
                VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP);
            """, (
                row['tournament_name'], 
                row['player_name'], 
                row['position'], 
                row['total_score'], 
                row['rounds_played']
            ))
            
        conn.commit()
        logger.info("Successfully updated pga_leaderboard in database.")
    except Exception as e:
        conn.rollback()
        logger.error(f"Error updating database: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    scrape_golf_leaderboard()
