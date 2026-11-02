# pyrefly: ignore [missing-import]
import schedule
import time
import subprocess
import logging
import os
import sys
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("Scheduler")

# Get current script directory to resolve scrapers reliably
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def run_scraper(script_name):
    script_path = os.path.join(BASE_DIR, script_name)
    logger.info(f"Starting {script_name}...")
    try:
        result = subprocess.run([sys.executable, script_path], check=True, capture_output=True, text=True)
        logger.info(f"{script_name} finished successfully. Output:\n{result.stdout}")
    except subprocess.CalledProcessError as e:
        logger.error(f"Error running {script_name}. Error:\n{e.stderr}")

def job():
    logger.info("Running scheduled data ingestion jobs...")
    run_scraper("scrape_football.py")
    run_scraper("scrape_nba.py")
    run_scraper("scrape_nfl.py")
    logger.info("Finished scheduled data ingestion jobs.")

# Lightweight HTTP handler to satisfy Render's free tier health checks & allow manual triggers
class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ('/', '/health', '/healthz'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"healthy","service":"dataturf-data-ingestion"}')
        elif self.path in ('/trigger', '/run-now'):
            threading.Thread(target=job, daemon=True).start()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"triggered","message":"Ingestion job started in background"}')
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path in ('/trigger', '/run-now'):
            threading.Thread(target=job, daemon=True).start()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"triggered","message":"Ingestion job started in background"}')
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Silence default request access logs to avoid cluttering scraper logs
        return

def start_health_server(port):
    server = HTTPServer(('0.0.0.0', port), HealthCheckHandler)
    logger.info(f"Health server listening on 0.0.0.0:{port}...")
    server.serve_forever()

if __name__ == "__main__":
    # Start HTTP server in background thread for Render health checks
    port = int(os.getenv("PORT", "10000"))
    health_thread = threading.Thread(target=start_health_server, args=(port,), daemon=True)
    health_thread.start()

    # Schedule the job to run hourly for fresher data
    schedule.every(1).hours.do(job)

    logger.info("Scheduler started. Waiting for jobs...")

    # Run immediately once on startup for testing/initial data
    job()

    while True:
        schedule.run_pending()
        time.sleep(60)
