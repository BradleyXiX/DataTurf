# System Architecture

## 1. Data Ingestion Pipeline (AWS / Python)
* **Scraper:** Python scripts use Playwright and BeautifulSoup to extract data from target sports domains.
* **Compute:** Scripts are containerized via Docker and stored in AWS ECR.
* **Automation:** AWS EventBridge triggers an AWS Lambda function on a defined cron schedule to execute the containers, keeping data fresh without manual intervention.

## 2. Backend API (Node.js / Express)
* **Processing:** The Lambda function sanitizes the scraped payload and pushes it to a PostgreSQL database.
* **Gateway:** A lightweight Node.js/Express server connects to PostgreSQL and exposes the data via RESTful endpoints.

## 3. Frontend Application (Next.js)
* **Framework:** Next.js (App Router) handles the routing and initial server-side rendering for speed.
* **Client Components:** React handles the highly interactive elements (tables, charts, toggles) on the client side.