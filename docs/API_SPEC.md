# DataTurf API Specification

This document details the RESTful API endpoints exposed by the Node.js/Express backend. All endpoints are prefixed with `/api`.

## Endpoints

### 1. `GET /api/standings/football/u18`

Retrieves the current standings for the U18 football league.

* **Response Format:** JSON Array
* **Success Response:** `200 OK`
* **Data Example:**
  ```json
  [
    {
      "id": "uuid",
      "team_name": "Manchester United U18",
      "matches_played": 10,
      "wins": 8,
      "draws": 1,
      "losses": 1,
      "points": 25,
      "last_updated": "2023-10-27T12:00:00Z"
    }
  ]
  ```

### 2. `GET /api/leaderboard/golf/pga`

Retrieves the current leaderboard for PGA golf.

* **Response Format:** JSON Array
* **Success Response:** `200 OK`
* **Data Example:**
  ```json
  [
    {
      "id": "uuid",
      "tournament_name": "Masters Tournament",
      "player_name": "Tiger Woods",
      "position": 1,
      "total_score": -12,
      "rounds_played": 4,
      "last_updated": "2023-04-10T18:00:00Z"
    }
  ]
  ```

### 3. `GET /api/performance/:domain`

Retrieves historical performance data for a specific domain to be used in charts.

* **URL Parameters:**
  * `domain` (string): The sport domain (`football` or `golf`).
* **Response Format:** JSON Array
* **Success Response:** `200 OK`
* **Error Response:** `400 Bad Request` (Invalid domain)
* **Data Example (football):**
  ```json
  [
    { "match": "M1", "points": 3 },
    { "match": "M2", "points": 4 },
    { "match": "M3", "points": 7 }
  ]
  ```
