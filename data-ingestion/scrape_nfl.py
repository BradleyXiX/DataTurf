import logging
import requests
import pandas as pd
from db import get_db_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def scrape_nfl_data():
    logger.info("Starting scrape for NFL Data from Pro-Football-Reference...")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        # Scrape Standings
        standings_url = "https://www.pro-football-reference.com/years/2023/"
        response = requests.get(standings_url, headers=headers)
        response.raise_for_status()
        
        tables = pd.read_html(response.text)
        
        # PFR has AFC and NFC standings as tables 0 and 1
        afc_conf = tables[0]
        nfc_conf = tables[1]
        
        combined = pd.concat([afc_conf, nfc_conf])
        
        standings_data = []
        for index, row in combined.iterrows():
            # Standardize team name extraction
            team_col = 'Tm'
            if team_col not in row:
                continue
            
            team_name = str(row[team_col]).replace('*', '').replace('+', '')
            
            # Skip division headers
            if "AFC " in team_name or "NFC " in team_name:
                continue
                
            wins = row['W']
            losses = row['L']
            ties = row['T']
            pf = row['PF']
            pa = row['PA']
            
            standings_data.append({
                "team_name": team_name.strip(),
                "wins": int(wins),
                "losses": int(losses),
                "ties": int(ties),
                "points_for": int(pf),
                "points_against": int(pa)
            })
            
        update_nfl_standings(standings_data)
        
    except Exception as e:
        logger.error(f"Failed to scrape NFL data: {e}")

def update_nfl_standings(data):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        for row in data:
            cur.execute("""
                INSERT INTO nfl_standings (team_name, wins, losses, ties, points_for, points_against, last_updated)
                VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (team_name) DO UPDATE SET
                    wins = EXCLUDED.wins,
                    losses = EXCLUDED.losses,
                    ties = EXCLUDED.ties,
                    points_for = EXCLUDED.points_for,
                    points_against = EXCLUDED.points_against,
                    last_updated = CURRENT_TIMESTAMP;
            """, (
                row['team_name'], 
                row['wins'], 
                row['losses'], 
                row['ties'], 
                row['points_for'], 
                row['points_against']
            ))
            
        conn.commit()
        logger.info(f"Successfully updated {len(data)} NFL teams in database.")
    except Exception as e:
        conn.rollback()
        logger.error(f"Error updating NFL standings: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    scrape_nfl_data()
