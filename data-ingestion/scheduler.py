import schedule
import time
import subprocess
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("Scheduler")

def run_scraper(script_name):
    logger.info(f"Starting {script_name}...")
    try:
        result = subprocess.run(["python", script_name], check=True, capture_output=True, text=True)
        logger.info(f"{script_name} finished successfully. Output:\n{result.stdout}")
    except subprocess.CalledProcessError as e:
        logger.error(f"Error running {script_name}. Error:\n{e.stderr}")

def job():
    logger.info("Running scheduled data ingestion jobs...")
    run_scraper("scrape_football.py")
    run_scraper("scrape_golf.py")
    logger.info("Finished scheduled data ingestion jobs.")

# Schedule the job to run daily at midnight
schedule.every().day.at("00:00").do(job)

logger.info("Scheduler started. Waiting for jobs...")

# Run immediately once on startup for testing/initial data (optional, but usually helpful)
# job()

while True:
    schedule.run_pending()
    time.sleep(60)
