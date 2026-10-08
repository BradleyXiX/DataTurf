import logging
import requests
import pandas as pd
from db import get_db_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def scrape_football_standings():
    logger.info("Starting scrape for Premier League Standings from FBref...")
    url = "https://fbref.com/en/comps/9/Premier-League-Stats"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Read all tables from the HTML
        tables = pd.read_html(response.text)
        
        # The first table on the page is typically the regular season standings
        df = tables[0]
        
        scraped_data = []
        for index, row in df.iterrows():
            # FBref tables sometimes have MultiIndex columns or weird names, standardizing:
            # columns usually: Rk, Squad, MP, W, D, L, GF, GA, GD, Pts, Pts/MP, xG, xGA, xGD, xGD/90, Last 5, Attendance, Top Team Scorer, Goalkeeper, Notes
            team_name = row['Squad']
            matches_played = row['MP']
            wins = row['W']
            draws = row['D']
            losses = row['L']
            points = row['Pts']
            
            scraped_data.append({
                "team_name": str(team_name),
                "matches_played": int(matches_played),
                "wins": int(wins),
                "draws": int(draws),
                "losses": int(losses),
                "points": int(points)
            })
            
            # Just take top 20 since Premier League has 20 teams
            if len(scraped_data) >= 20:
                break
                
        update_database(scraped_data)
        
    except Exception as e:
        logger.error(f"Failed to scrape FBref: {e}")

def update_database(data):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        for row in data:
            cur.execute("""
                INSERT INTO u18_football_standings (team_name, matches_played, wins, draws, losses, points, last_updated)
                VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (team_name) DO UPDATE SET
                    matches_played = EXCLUDED.matches_played,
                    wins = EXCLUDED.wins,
                    draws = EXCLUDED.draws,
                    losses = EXCLUDED.losses,
                    points = EXCLUDED.points,
                    last_updated = CURRENT_TIMESTAMP;
            """, (
                row['team_name'], 
                row['matches_played'], 
                row['wins'], 
                row['draws'], 
                row['losses'], 
                row['points']
            ))
            
        conn.commit()
        logger.info(f"Successfully updated {len(data)} Premier League teams in database.")
    except Exception as e:
        conn.rollback()
        logger.error(f"Error updating database: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    scrape_football_standings()
