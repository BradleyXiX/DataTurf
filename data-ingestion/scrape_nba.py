import logging
import requests
import pandas as pd
from db import get_db_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def scrape_nba_data():
    logger.info("Starting scrape for NBA Data from Basketball-Reference...")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        # Scrape Standings
        standings_url = "https://www.basketball-reference.com/leagues/NBA_2024_standings.html"
        response = requests.get(standings_url, headers=headers)
        response.raise_for_status()
        
        tables = pd.read_html(response.text)
        
        # Basketball Reference has East and West standings in separate tables typically
        eastern_conf = tables[0]
        western_conf = tables[1]
        
        # Combine both conferences
        combined = pd.concat([eastern_conf, western_conf])
        
        standings_data = []
        for index, row in combined.iterrows():
            # Team name column is usually 'Eastern Conference' or 'Western Conference'
            team_col = 'Eastern Conference' if 'Eastern Conference' in row else 'Western Conference'
            team_name = str(row[team_col]).replace('*', '') # Remove playoff asterisk
            
            # Skip rows that are just headers repeated
            if "Division" in team_name or "Conference" in team_name:
                continue
                
            wins = row['W']
            losses = row['L']
            win_pct = row['W/L%']
            pts_per_game = row['PS/G']
            opp_pts_per_game = row['PA/G']
            
            standings_data.append({
                "team_name": team_name.strip(),
                "wins": int(wins),
                "losses": int(losses),
                "win_pct": float(win_pct),
                "pts_per_game": float(pts_per_game),
                "opp_pts_per_game": float(opp_pts_per_game)
            })
            
        update_nba_standings(standings_data)
        
    except Exception as e:
        logger.error(f"Failed to scrape NBA data: {e}")

def update_nba_standings(data):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        for row in data:
            cur.execute("""
                INSERT INTO nba_standings (team_name, wins, losses, win_pct, pts_per_game, opp_pts_per_game, last_updated)
                VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (team_name) DO UPDATE SET
                    wins = EXCLUDED.wins,
                    losses = EXCLUDED.losses,
                    win_pct = EXCLUDED.win_pct,
                    pts_per_game = EXCLUDED.pts_per_game,
                    opp_pts_per_game = EXCLUDED.opp_pts_per_game,
                    last_updated = CURRENT_TIMESTAMP;
            """, (
                row['team_name'], 
                row['wins'], 
                row['losses'], 
                row['win_pct'], 
                row['pts_per_game'], 
                row['opp_pts_per_game']
            ))
            
        conn.commit()
        logger.info(f"Successfully updated {len(data)} NBA teams in database.")
    except Exception as e:
        conn.rollback()
        logger.error(f"Error updating NBA standings: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    scrape_nba_data()
