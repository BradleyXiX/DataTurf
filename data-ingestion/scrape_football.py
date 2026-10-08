import logging
from db import get_db_connection
import requests
import pandas as pd
from datetime import datetime, timedelta
import random
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_hybrid_football_data():
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # 1. Scrape Live Standings from BBC Sport
        logger.info("Scraping live standings from BBC Sport...")
        url = "https://www.bbc.com/sport/football/premier-league/table"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        res = requests.get(url, headers=headers)
        
        # BBC uses simple HTML tables for standings
        tables = pd.read_html(res.text, flavor='lxml')
        standings_df = tables[0]
        
        scraped_teams = []
        for index, row in standings_df.iterrows():
            # BBC columns typically: Position, Team, Played, Won, Drawn, Lost, F, A, GD, Points
            try:
                team_name = str(row.iloc[2]) # Team name usually in 3rd column in some BBC formats or 2nd. Let's assume standard index.
                # Actually BBC columns are: Unnamed: 0, Unnamed: 1, Team, P, W, D, L, F, A, GD, Pts, Form
                # It's safer to locate by column name if it exists, or just fallback to mock if scraping fails.
                
                # Let's write a robust parser
                team_name = row.get('Team') or row.iloc[2]
                played = row.get('P') or row.iloc[3]
                won = row.get('W') or row.iloc[4]
                drawn = row.get('D') or row.iloc[5]
                lost = row.get('L') or row.iloc[6]
                gf = row.get('F') or row.iloc[7]
                ga = row.get('A') or row.iloc[8]
                pts = row.get('Pts') or row.iloc[10]
                
                # Clean up team name (BBC often appends ' team is in X position' for accessibility)
                team_name = str(team_name).split(' team is in')[0].strip()
                
                scraped_teams.append({
                    "team_name": team_name,
                    "matches_played": int(played),
                    "wins": int(won),
                    "draws": int(drawn),
                    "losses": int(lost),
                    "points": int(pts),
                    "goals_for": int(gf),
                    "goals_against": int(ga)
                })
            except Exception as e:
                continue
                
            if len(scraped_teams) >= 20:
                break
                
        # Insert Standings
        for t in scraped_teams:
            cur.execute("""
                INSERT INTO pl_standings (team_name, matches_played, wins, draws, losses, points, goals_for, goals_against)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (team_name) DO UPDATE SET
                    matches_played = EXCLUDED.matches_played, wins = EXCLUDED.wins,
                    draws = EXCLUDED.draws, losses = EXCLUDED.losses,
                    points = EXCLUDED.points, goals_for = EXCLUDED.goals_for,
                    goals_against = EXCLUDED.goals_against;
            """, (t['team_name'], t['matches_played'], t['wins'], t['draws'], t['losses'], t['points'], t['goals_for'], t['goals_against']))
        
        # 2. Generate Dynamic Data Based on Standings
        # We will take the top 2 teams for our Matchup Analysis
        top_teams = scraped_teams[:2]
        if len(top_teams) < 2:
            raise Exception("Not enough teams scraped")
            
        home_team = top_teams[0]['team_name']
        away_team = top_teams[1]['team_name']
        
        # Insert Dynamic Managers
        managers = [
            (f"{home_team} Head Coach", home_team, "pl", 0.650, "4-3-3 Attacking", "High Press / Possession"),
            (f"{away_team} Head Coach", away_team, "pl", 0.620, "3-5-2", "Counter-Attack / Solid Defense"),
        ]
        for m in managers:
            cur.execute("""
                INSERT INTO managers (manager_name, team_name, sport, win_pct, preferred_formation, play_style)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (manager_name) DO UPDATE SET
                    win_pct = EXCLUDED.win_pct, preferred_formation = EXCLUDED.preferred_formation, play_style = EXCLUDED.play_style;
            """, m)

        # Insert Featured Fixture
        match_date = (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d')
        cur.execute("""
            INSERT INTO fixtures (sport, match_date, home_team, away_team, status, home_score, away_score)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (sport, match_date, home_team, away_team) DO UPDATE SET
                status = EXCLUDED.status, home_score = EXCLUDED.home_score, away_score = EXCLUDED.away_score;
        """, ("pl", match_date, home_team, away_team, "Scheduled", None, None))
        
        # Insert Predicted Lineups for the featured fixture
        cur.execute("SELECT id FROM fixtures WHERE sport='pl' AND home_team=%s AND away_team=%s", (home_team, away_team))
        res = cur.fetchone()
        if res:
            fixture_id = res['id'] if isinstance(res, dict) else res[0]
            
            # Generic realistic player names
            h_lineup = json.dumps([f"{home_team} GK", "Def 1", "Def 2", "Def 3", "Def 4", "Mid 1", "Mid 2", "Mid 3", "Fwd 1", "Fwd 2", "Fwd 3"])
            a_lineup = json.dumps([f"{away_team} GK", "Def 1", "Def 2", "Def 3", "Mid 1", "Mid 2", "Mid 3", "Mid 4", "Mid 5", "Fwd 1", "Fwd 2"])
            
            cur.execute("""
                INSERT INTO predicted_lineups (fixture_id, team_name, formation, players)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (fixture_id, team_name) DO UPDATE SET formation = EXCLUDED.formation, players = EXCLUDED.players;
            """, (fixture_id, home_team, "4-3-3", h_lineup))
            
            cur.execute("""
                INSERT INTO predicted_lineups (fixture_id, team_name, formation, players)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (fixture_id, team_name) DO UPDATE SET formation = EXCLUDED.formation, players = EXCLUDED.players;
            """, (fixture_id, away_team, "3-5-2", a_lineup))

        conn.commit()
        logger.info("Successfully populated live/hybrid Premier League data.")
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to insert data: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    generate_hybrid_football_data()
