# DataTurf

DataTurf is a full-stack sports statistics aggregator and analytics dashboard. The primary engineering focus is on advanced frontend solution development, highlighting complex state management, highly responsive interactive data tables, and seamless data visualization.

## Tech Stack
* **Frontend:** Next.js, React, Tailwind CSS, Recharts
* **Backend:** Node.js, Express, PostgreSQL
* **Data Ingestion:** Python (Playwright/BeautifulSoup), Docker, AWS (Lambda, EventBridge, ECR)

## Documentation
Detailed technical specifications can be found in the `/docs` directory:
* [Product Requirements Document (PRD)](./docs/PRD.md)
* [System Architecture](./docs/ARCHITECTURE.md)
* [Database Schema](./docs/DATABASE_SCHEMA.md)
* [API Specification](./docs/API_SPEC.md)

## Quick Start
1. Clone the repository.
2. Run `npm install` in the `frontend` and `backend` directories.
3. Set up the local PostgreSQL database using the schema in the docs.
4. Run `npm run dev` in the frontend directory to start the Next.js development server.