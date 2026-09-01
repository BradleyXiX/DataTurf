import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    # Attempt to connect using environment variables, fallback to defaults for local development
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME", "dataturf"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432")
    )
    return conn
