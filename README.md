# DataTurf

DataTurf is a full-stack sports statistics aggregator and analytics dashboard. The primary engineering focus is on advanced frontend solution development, highlighting complex state management, highly responsive interactive data tables, and seamless data visualization.

## Tech Stack
* **Frontend:** Next.js, React, Tailwind CSS, Recharts (Hosted on **Vercel**)
* **Backend:** Node.js, Express, PostgreSQL (Hosted on **Render Free Tier**)
* **Data Ingestion:** Python (BeautifulSoup/Pandas), Scheduled Worker (Hosted on **Render Free Tier**)
* **Database:** Managed PostgreSQL (Hosted on **Supabase**)

## Cloud Deployment (100% Free Tier)

### 1. Database (Supabase)
1. Create a free project on [Supabase](https://supabase.com).
2. Run the SQL schema from `backend/db/init.sql` in Supabase's SQL Editor.
3. Copy the PostgreSQL connection URI from **Project Settings > Database > Connection string > URI**.

### 2. Backend & Data Ingestion (Render)
1. Sign in to [Render](https://render.com) and connect your GitHub repository.
2. Select **Blueprints** and point it to `render.yaml`.
3. Set the `DATABASE_URL` environment variable for both `dataturf-backend` and `dataturf-data-ingestion` to your Supabase connection URI.
4. Render deploys both services on the free tier.

### 3. Frontend (Vercel)
1. Import the repository in [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Set the following environment variable:
   * `BACKEND_URL`: Your Render backend service URL (e.g., `https://dataturf-backend.onrender.com`).
   * *(Optional)* `NEXT_PUBLIC_API_URL`: Set if direct client-side requests are preferred over Next.js rewrites.
4. Click **Deploy**.

## Local Development
1. Clone the repository.
2. Run `docker compose up -d` to spin up local PostgreSQL, backend, and data-ingestion containers, or run each locally with local `.env` files.
3. Run `npm install` and `npm run dev` in the `frontend` directory.
