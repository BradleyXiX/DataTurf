import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    """
    Connect to PostgreSQL database.
    Supports standard Supabase connection URL (via DATABASE_URL, SUPABASE_DB_URL, or POSTGRES_URL)
    with automatic SSL configuration, or falls back to discrete environment variables.
    """
    db_url = (
        os.getenv("DATABASE_URL")
        or os.getenv("SUPABASE_DB_URL")
        or os.getenv("POSTGRES_URL")
    )

    if db_url:
        # Normalize postgres:// to postgresql:// if needed
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)

        # For remote cloud hosts (e.g. Supabase), ensure sslmode is specified
        is_local = "localhost" in db_url or "127.0.0.1" in db_url
        if not is_local and "sslmode=" not in db_url:
            separator = "&" if "?" in db_url else "?"
            db_url = f"{db_url}{separator}sslmode=require"

        return psycopg2.connect(db_url)

    # Fallback to discrete parameters (used in local development)
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "dataturf"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        sslmode=os.getenv("DB_SSLMODE", "prefer")
    )
