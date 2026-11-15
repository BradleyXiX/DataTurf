"""
DataTurf Premier League Snapshot Importer (football-data.org -> Snapshot v1)

Fetches Premier League standings and matches from football-data.org (or local test fixtures),
validates the payload against Snapshot v1 contract, and atomically promotes to storage.
Preserves the last-known-good snapshot on any error or malformed payload.
"""

import argparse
import datetime
import json
import logging
import os
import re
import sys
import time
import uuid
from typing import Any, Dict, List, Optional, Tuple
import urllib.request
import urllib.error

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("SnapshotImporter")

# Canonical known mapping for Premier League teams to stable, deterministic IDs
CANONICAL_TEAM_SLUGS: Dict[int, str] = {
    57: "arsenal",
    58: "aston-villa",
    61: "chelsea",
    62: "everton",
    63: "fulham",
    64: "liverpool",
    65: "man-city",
    66: "man-united",
    67: "newcastle",
    73: "tottenham",
    76: "wolves",
    338: "leicester-city",
    340: "southampton",
    349: "ipswich-town",
    354: "crystal-palace",
    356: "sheffield-united",
    397: "brighton",
    402: "brentford",
    563: "west-ham",
    1044: "bournemouth",
    351: "nottingham-forest",
}


def slugify_team_name(name: str) -> str:
    """Generate a clean, stable local ID from team name if not in canonical table."""
    cleaned = re.sub(r"\bFC\b|\bAFC\b", "", name, flags=re.IGNORECASE)
    cleaned = re.sub(r"[^\w\s-]", "", cleaned).strip().lower()
    return re.sub(r"[\s_]+", "-", cleaned)


def resolve_team_id(provider_id: int, short_name: str, full_name: str) -> str:
    """Resolve a stable local ID for a team."""
    if provider_id in CANONICAL_TEAM_SLUGS:
        return CANONICAL_TEAM_SLUGS[provider_id]
    if short_name:
        return slugify_team_name(short_name)
    return slugify_team_name(full_name)


class SnapshotValidationError(Exception):
    """Raised when incoming data violates the Snapshot contract."""
    pass


class SnapshotImporter:
    def __init__(
        self,
        season: int = 2024,
        api_token: Optional[str] = None,
        timeout: int = 10,
        max_retries: int = 3,
        base_url: str = "https://api.football-data.org/v4",
    ):
        self.season = season
        self.api_token = api_token or os.getenv("FOOTBALL_DATA_API_KEY") or os.getenv("X_AUTH_TOKEN")
        self.timeout = timeout
        self.max_retries = max_retries
        self.base_url = base_url.rstrip("/")

    def _fetch_with_retries(self, url: str) -> Tuple[Dict[str, Any], Optional[str]]:
        """
        Fetch JSON from API with bounded retries, exponential backoff, and Retry-After handling.
        Returns (json_data, provider_last_modified_header).
        """
        headers = {
            "User-Agent": "DataTurf-Importer/1.0",
            "Accept": "application/json",
        }
        if self.api_token:
            headers["X-Auth-Token"] = self.api_token

        req = urllib.request.Request(url, headers=headers)
        attempt = 0

        while attempt <= self.max_retries:
            attempt += 1
            try:
                logger.info(f"Fetching {url} (attempt {attempt}/{self.max_retries + 1})...")
                with urllib.request.urlopen(req, timeout=self.timeout) as response:
                    last_modified = response.headers.get("Last-Modified")
                    raw_data = response.read().decode("utf-8")
                    return json.loads(raw_data), last_modified

            except urllib.error.HTTPError as e:
                status_code = e.code
                retry_after_hdr = e.headers.get("Retry-After")

                if status_code == 429:
                    # Rate limit exceeded - honor Retry-After
                    wait_sec = int(retry_after_hdr) if retry_after_hdr and retry_after_hdr.isdigit() else (2 ** attempt)
                    wait_sec = min(wait_sec, 60)  # Bound retry wait to 60s
                    logger.warning(f"HTTP 429 Rate limited. Honoring Retry-After of {wait_sec}s...")
                    if attempt <= self.max_retries:
                        time.sleep(wait_sec)
                        continue
                    raise SnapshotValidationError(f"Rate limit 429 exceeded after {self.max_retries} retries: {e}")

                elif status_code in (500, 502, 503, 504):
                    wait_sec = 2 ** attempt
                    logger.warning(f"HTTP {status_code} Server Error. Retrying in {wait_sec}s...")
                    if attempt <= self.max_retries:
                        time.sleep(wait_sec)
                        continue
                    raise SnapshotValidationError(f"Server error {status_code} after {self.max_retries} retries: {e}")

                else:
                    body = e.read().decode("utf-8", errors="replace") if hasattr(e, "read") else ""
                    raise SnapshotValidationError(f"HTTP Error {status_code} for {url}: {e.reason}. Response: {body}")

            except (urllib.error.URLError, TimeoutError, OSError) as e:
                wait_sec = 2 ** attempt
                logger.warning(f"Network error: {e}. Retrying in {wait_sec}s...")
                if attempt <= self.max_retries:
                    time.sleep(wait_sec)
                    continue
                raise SnapshotValidationError(f"Network error after {self.max_retries} retries: {e}")

        raise SnapshotValidationError(f"Failed to fetch {url} after {self.max_retries} retries.")

    def fetch_live_data(self) -> Tuple[Dict[str, Any], Dict[str, Any], Optional[str]]:
        """Fetch standings and matches from football-data.org."""
        if not self.api_token:
            raise SnapshotValidationError("Missing football-data.org API token (set FOOTBALL_DATA_API_KEY).")

        standings_url = f"{self.base_url}/competitions/PL/standings?season={self.season}"
        matches_url = f"{self.base_url}/competitions/PL/matches?season={self.season}"

        standings_json, last_mod_standings = self._fetch_with_retries(standings_url)
        matches_json, last_mod_matches = self._fetch_with_retries(matches_url)

        provider_updated_at = last_mod_matches or last_mod_standings
        return standings_json, matches_json, provider_updated_at

    def load_fixture_data(
        self,
        standings_fixture_path: str,
        matches_fixture_path: str
    ) -> Tuple[Dict[str, Any], Dict[str, Any], Optional[str]]:
        """Load deterministic mock/fixture files for testing."""
        logger.info(f"Loading standings fixture from: {standings_fixture_path}")
        with open(standings_fixture_path, "r", encoding="utf-8") as f:
            standings_json = json.load(f)

        logger.info(f"Loading matches fixture from: {matches_fixture_path}")
        with open(matches_fixture_path, "r", encoding="utf-8") as f:
            matches_json = json.load(f)

        return standings_json, matches_json, "2024-08-26T12:00:00Z"

    def normalize_and_validate(
        self,
        standings_raw: Dict[str, Any],
        matches_raw: Dict[str, Any],
        fetched_at_utc: Optional[str] = None,
        provider_updated_at: Optional[str] = None,
        is_fixture: bool = False,
    ) -> Dict[str, Any]:
        """
        Validate, normalize, and transform raw provider payloads into Snapshot v1 format.
        Throws SnapshotValidationError on any violation.
        """
        if not fetched_at_utc:
            fetched_at_utc = datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")

        # Set explicit provenance
        provenance = "fixture-demo" if is_fixture else "provider"
        source_name = "fixture-demo" if is_fixture else "football-data.org"
        attribution_text = (
            "Demo fixture data (not live Premier League records)"
            if is_fixture
            else "Data provided by football-data.org"
        )

        # 1. Validate top-level structures
        if "standings" not in standings_raw or not isinstance(standings_raw["standings"], list):
            raise SnapshotValidationError("Invalid standings payload: 'standings' list missing.")

        if "matches" not in matches_raw or not isinstance(matches_raw["matches"], list):
            raise SnapshotValidationError("Invalid matches payload: 'matches' list missing.")

        # Find TOTAL regular season standings table
        total_table: Optional[List[Dict[str, Any]]] = None
        for s in standings_raw["standings"]:
            if s.get("type") == "TOTAL":
                total_table = s.get("table")
                break
        if total_table is None and standings_raw["standings"]:
            total_table = standings_raw["standings"][0].get("table")

        if not total_table or not isinstance(total_table, list):
            raise SnapshotValidationError("No valid standings table found in payload.")

        # 2. Extract and Validate Teams
        teams_map: Dict[str, Dict[str, Any]] = {}
        provider_team_id_to_local_id: Dict[int, str] = {}

        for entry in total_table:
            team_info = entry.get("team")
            if not team_info or not isinstance(team_info, dict):
                raise SnapshotValidationError(f"Standings entry missing team object: {entry}")

            provider_id = team_info.get("id")
            if provider_id is None:
                raise SnapshotValidationError(f"Team missing provider ID: {team_info}")

            full_name = team_info.get("name") or "Unknown FC"
            short_name = team_info.get("shortName") or full_name
            tla = team_info.get("tla") or short_name[:3].upper()
            crest = team_info.get("crest")

            local_id = resolve_team_id(provider_id, short_name, full_name)

            if local_id in teams_map and teams_map[local_id]["providerTeamId"] != provider_id:
                raise SnapshotValidationError(f"Local ID collision for team slug: {local_id}")

            if provider_id in provider_team_id_to_local_id and provider_team_id_to_local_id[provider_id] != local_id:
                raise SnapshotValidationError(f"Duplicate provider team ID {provider_id} in standings.")

            provider_team_id_to_local_id[provider_id] = local_id
            teams_map[local_id] = {
                "id": local_id,
                "providerTeamId": provider_id,
                "name": full_name,
                "shortName": short_name,
                "tla": tla,
                "crestUrl": crest,
            }

        # 3. Validate Standings Table
        normalized_standings: List[Dict[str, Any]] = []
        seen_positions = set()

        for row in total_table:
            pos = row.get("position")
            if pos is None or pos in seen_positions or not isinstance(pos, int) or pos <= 0:
                raise SnapshotValidationError(f"Invalid or duplicate table position {pos} in standings.")
            seen_positions.add(pos)

            provider_id = row["team"]["id"]
            team_id = provider_team_id_to_local_id[provider_id]

            normalized_standings.append({
                "position": pos,
                "teamId": team_id,
                "playedGames": int(row.get("playedGames", 0)),
                "won": int(row.get("won", 0)),
                "draw": int(row.get("draw", 0)),
                "lost": int(row.get("lost", 0)),
                "points": int(row.get("points", 0)),
                "goalsFor": int(row.get("goalsFor", 0)),
                "goalsAgainst": int(row.get("goalsAgainst", 0)),
                "goalDifference": int(row.get("goalDifference", 0)),
                "form": row.get("form"),
            })

        # Keep standings ordered strictly by official position
        normalized_standings.sort(key=lambda x: x["position"])

        # 4. Extract and Validate Matches
        normalized_matches: List[Dict[str, Any]] = []
        seen_match_ids = set()
        seen_provider_match_ids = set()

        completed_count = 0
        scheduled_count = 0
        postponed_count = 0
        cancelled_count = 0
        unknown_count = 0

        first_kickoff: Optional[str] = None
        last_kickoff: Optional[str] = None

        for m in matches_raw["matches"]:
            prov_m_id = m.get("id")
            if prov_m_id is None or prov_m_id in seen_provider_match_ids:
                raise SnapshotValidationError(f"Invalid or duplicate provider match ID: {prov_m_id}")
            seen_provider_match_ids.add(prov_m_id)

            match_id = f"PL-{self.season}-M{prov_m_id}"
            if match_id in seen_match_ids:
                raise SnapshotValidationError(f"Duplicate generated match ID: {match_id}")
            seen_match_ids.add(match_id)

            # Validate UTC timestamp
            utc_date = m.get("utcDate")
            if not utc_date or not isinstance(utc_date, str):
                raise SnapshotValidationError(f"Match {match_id} missing valid utcDate.")
            # Normalization check for ISO timestamp
            if not (utc_date.endswith("Z") or "+" in utc_date or "-" in utc_date[-6:]):
                raise SnapshotValidationError(f"Match {match_id} utcDate not in UTC/ISO format: {utc_date}")

            if first_kickoff is None or utc_date < first_kickoff:
                first_kickoff = utc_date
            if last_kickoff is None or utc_date > last_kickoff:
                last_kickoff = utc_date

            # Validate Teams references
            home_raw = m.get("homeTeam") or {}
            away_raw = m.get("awayTeam") or {}
            home_prov_id = home_raw.get("id")
            away_prov_id = away_raw.get("id")

            if home_prov_id not in provider_team_id_to_local_id:
                raise SnapshotValidationError(
                    f"Match {match_id} references unknown home team provider ID: {home_prov_id}"
                )
            if away_prov_id not in provider_team_id_to_local_id:
                raise SnapshotValidationError(
                    f"Match {match_id} references unknown away team provider ID: {away_prov_id}"
                )

            home_team_id = provider_team_id_to_local_id[home_prov_id]
            away_team_id = provider_team_id_to_local_id[away_prov_id]

            # Validate Status and Score Semantics
            raw_status = (m.get("status") or "").upper()
            if raw_status in ("FINISHED", "AWARDED"):
                status = "COMPLETED"
                completed_count += 1
            elif raw_status in ("SCHEDULED", "TIMED"):
                status = "SCHEDULED"
                scheduled_count += 1
            elif raw_status == "POSTPONED":
                status = "POSTPONED"
                postponed_count += 1
            elif raw_status == "CANCELLED":
                status = "CANCELLED"
                cancelled_count += 1
            else:
                status = "UNKNOWN"
                unknown_count += 1

            score_obj = m.get("score") or {}
            full_time = score_obj.get("fullTime") or {}
            half_time = score_obj.get("halfTime") or {}

            home_score = full_time.get("home")
            away_score = full_time.get("away")

            if status == "COMPLETED":
                if home_score is None or away_score is None:
                    raise SnapshotValidationError(
                        f"Completed match {match_id} has null score: home={home_score}, away={away_score}"
                    )
                if not isinstance(home_score, int) or not isinstance(away_score, int):
                    raise SnapshotValidationError(
                        f"Completed match {match_id} score is not an integer: home={home_score}, away={away_score}"
                    )
            else:
                # Scheduled or postponed matches must have null full-time score
                home_score = None
                away_score = None

            normalized_matches.append({
                "id": match_id,
                "providerMatchId": prov_m_id,
                "matchday": int(m.get("matchday", 0)),
                "kickoffUtc": utc_date,
                "status": status,
                "homeTeamId": home_team_id,
                "awayTeamId": away_team_id,
                "score": {
                    "home": home_score,
                    "away": away_score,
                    "halfTime": {
                        "home": half_time.get("home") if status == "COMPLETED" else None,
                        "away": half_time.get("away") if status == "COMPLETED" else None,
                    },
                },
            })

        # Sort matches chronologically with deterministic ID tiebreaker
        normalized_matches.sort(key=lambda x: (x["kickoffUtc"], x["id"]))

        # Build coverage metadata
        coverage = {
            "windowStart": first_kickoff,
            "windowEnd": last_kickoff,
            "totalMatches": len(normalized_matches),
            "completedMatches": completed_count,
            "scheduledMatches": scheduled_count,
            "postponedMatches": postponed_count,
            "cancelledMatches": cancelled_count,
            "unknownMatches": unknown_count,
        }

        # Build final snapshot
        snapshot: Dict[str, Any] = {
            "schemaVersion": "1.0.0",
            "provenance": provenance,
            "isDemo": is_fixture,
            "competition": {
                "id": "PL",
                "name": "Premier League",
                "code": "PL",
            },
            "season": {
                "startYear": self.season,
                "endYear": self.season + 1,
                "label": f"{self.season}/{self.season + 1}",
            },
            "source": source_name,
            "attribution": attribution_text,
            "fetchedAt": fetched_at_utc,
            "sourceUpdatedAt": provider_updated_at,
            "coverage": coverage,
            "teams": teams_map,
            "standings": normalized_standings,
            "matches": normalized_matches,
        }

        return snapshot

    def promote_snapshot_atomically(self, snapshot: Dict[str, Any], output_path: str) -> None:
        """
        Atomically promote snapshot to destination using temporary file + rename.
        Ensures intermediate states never corrupt the existing destination file.
        """
        output_dir = os.path.dirname(os.path.abspath(output_path))
        os.makedirs(output_dir, exist_ok=True)

        temp_path = os.path.join(output_dir, f".snapshot_{uuid.uuid4().hex}.tmp")
        try:
            with open(temp_path, "w", encoding="utf-8") as f:
                json.dump(snapshot, f, indent=2, ensure_ascii=False)
                f.flush()
                os.fsync(f.fileno())

            # Atomic file replacement
            os.replace(temp_path, output_path)
            logger.info(f"Snapshot promoted successfully to {output_path}")

        except Exception as e:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except OSError:
                    pass
            raise SnapshotValidationError(f"Failed during atomic file promotion: {e}")

    def import_snapshot(
        self,
        output_path: str,
        standings_fixture: Optional[str] = None,
        matches_fixture: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Main importer pipeline:
        Fetches/loads data -> normalizes & validates -> atomically promotes to destination.
        Preserves existing snapshot on any failure.
        """
        is_fixture = bool(standings_fixture or matches_fixture)
        logger.info(f"Starting snapshot import for Premier League season {self.season} (fixture={is_fixture})...")

        # Guard: Fixture imports cannot overwrite the default real snapshot path
        if is_fixture:
            normalized_out = os.path.normpath(output_path).replace("\\", "/")
            if normalized_out.endswith("data/snapshots/epl/snapshot.json") or (
                os.path.basename(normalized_out) == "snapshot.json"
                and "demo" not in normalized_out.lower()
                and "test" not in normalized_out.lower()
            ):
                raise SnapshotValidationError(
                    "Fixture imports cannot write to the default real snapshot path ('snapshot.json'). "
                    "Use a separate demo path such as 'data/snapshots/epl/demo-snapshot.json'."
                )

        if is_fixture:
            standings_raw, matches_raw, provider_time = self.load_fixture_data(
                standings_fixture, matches_fixture
            )
        else:
            standings_raw, matches_raw, provider_time = self.fetch_live_data()

        validated_snapshot = self.normalize_and_validate(
            standings_raw,
            matches_raw,
            provider_updated_at=provider_time,
            is_fixture=is_fixture,
        )

        self.promote_snapshot_atomically(validated_snapshot, output_path)
        logger.info("Snapshot import completed successfully.")
        return validated_snapshot


def main():
    parser = argparse.ArgumentParser(description="DataTurf Premier League Snapshot Importer")
    parser.add_argument("--season", type=int, default=2024, help="Season start year (e.g. 2024)")
    parser.add_argument("--output", type=str, default="data/snapshots/epl/snapshot.json", help="Output snapshot path")
    parser.add_argument("--token", type=str, default=None, help="football-data.org API token")
    parser.add_argument("--standings-fixture", type=str, default=None, help="Path to local standings fixture")
    parser.add_argument("--matches-fixture", type=str, default=None, help="Path to local matches fixture")

    args = parser.parse_args()

    importer = SnapshotImporter(season=args.season, api_token=args.token)
    try:
        importer.import_snapshot(
            output_path=args.output,
            standings_fixture=args.standings_fixture,
            matches_fixture=args.matches_fixture,
        )
    except SnapshotValidationError as e:
        logger.error(f"Snapshot import failed: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error during snapshot import: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
