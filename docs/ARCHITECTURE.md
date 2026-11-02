# System Architecture

## 1. Data Ingestion Pipeline (Python / Render)
* **Scraper:** Python scripts extract and format data from target sports sources.
* **Compute & Automation:** Runs on Render's free tier via `scheduler.py`, executing hourly data ingestion jobs and exposing a lightweight HTTP health check endpoint.
* **Database Target:** Directly writes data to the Supabase PostgreSQL database using standard connection URLs with SSL.

## 2. Backend API (Node.js / Express / Render)
* **Gateway:** A Node.js/Express server hosted on Render's free tier connects to the Supabase PostgreSQL database with connection pooling and SSL support.
* **Endpoints:** Exposes RESTful endpoints for sports standings, player stats, fixtures, performance charts, and tactical lineups.
* **Health Checks:** Provides `/health` and `/api/health` endpoints for Render service health monitoring.

## 3. Frontend Application (Next.js / Vercel)
* **Framework:** Next.js (App Router) deployed on Vercel's edge network for lightning-fast delivery.
* **API Integration:** Connects to the Render backend via Next.js serverless rewrites (configured via `BACKEND_URL`) or direct client API calls (configured via `NEXT_PUBLIC_API_URL`).
* **Client Components:** React handles interactive elements (Bento grids, tables, charts, 3D Canvas, and tactical lineup boards).

## 4. Managed Database (Supabase PostgreSQL)
* **Storage:** Cloud PostgreSQL hosted on Supabase free tier with SSL encryption.
* **Schema:** Relational schema supporting Premier League, NBA, and NFL standings, player performance metrics, and fixture schedules.
