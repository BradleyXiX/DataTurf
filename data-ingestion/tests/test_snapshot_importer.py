"""
Deterministic Unit Tests for DataTurf Snapshot Importer

Verifies:
1. Valid import and contract conformance
2. Repeat import (idempotence)
3. Corrected match result update
4. Null score semantics (scheduled/postponed vs 0-0 completed)
5. Invalid or duplicate input rejection
6. HTTP 429 rate limit with Retry-After and timeout handling
7. Last-known-good snapshot preservation on failure
"""

import json
import os
import shutil
import tempfile
import unittest
import urllib.error
from unittest.mock import MagicMock, patch

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from snapshot_importer import SnapshotImporter, SnapshotValidationError


class TestSnapshotImporter(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.fixtures_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "fixtures", "epl"))
        self.valid_standings_fixture = os.path.join(self.fixtures_dir, "valid_standings.json")
        self.valid_matches_fixture = os.path.join(self.fixtures_dir, "valid_matches.json")
        self.corrected_matches_fixture = os.path.join(self.fixtures_dir, "corrected_result_matches.json")
        self.invalid_missing_team_fixture = os.path.join(self.fixtures_dir, "invalid_missing_team_matches.json")
        self.duplicate_match_id_fixture = os.path.join(self.fixtures_dir, "duplicate_match_id_matches.json")
        self.malformed_score_fixture = os.path.join(self.fixtures_dir, "malformed_score_matches.json")

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_valid_import(self):
        """1. Test valid import produces valid Snapshot v1 structure."""
        out_path = os.path.join(self.test_dir, "demo_snapshot.json")
        importer = SnapshotImporter(season=2024)

        snapshot = importer.import_snapshot(
            output_path=out_path,
            standings_fixture=self.valid_standings_fixture,
            matches_fixture=self.valid_matches_fixture,
        )

        self.assertTrue(os.path.exists(out_path))
        self.assertEqual(snapshot["schemaVersion"], "1.0.0")
        self.assertEqual(snapshot["provenance"], "fixture-demo")
        self.assertTrue(snapshot["isDemo"])
        self.assertEqual(snapshot["competition"]["code"], "PL")
        self.assertEqual(snapshot["season"]["startYear"], 2024)
        self.assertEqual(snapshot["source"], "fixture-demo")
        self.assertIn("Demo fixture data", snapshot["attribution"])

        # Check coverage
        coverage = snapshot["coverage"]
        self.assertEqual(coverage["totalMatches"], 6)
        self.assertEqual(coverage["completedMatches"], 4)
        self.assertEqual(coverage["postponedMatches"], 1)
        self.assertEqual(coverage["scheduledMatches"], 1)

        # Check teams
        teams = snapshot["teams"]
        self.assertIn("arsenal", teams)
        self.assertIn("chelsea", teams)
        self.assertIn("liverpool", teams)
        self.assertIn("man-city", teams)

        # Check standings separation
        standings = snapshot["standings"]
        self.assertEqual(len(standings), 4)
        self.assertEqual(standings[0]["position"], 1)
        self.assertEqual(standings[0]["teamId"], "liverpool")
        self.assertEqual(standings[0]["points"], 9)

        # Check matches
        matches = snapshot["matches"]
        self.assertEqual(len(matches), 6)
        # Arsenal vs Chelsea
        m1 = matches[0]
        self.assertEqual(m1["homeTeamId"], "arsenal")
        self.assertEqual(m1["awayTeamId"], "chelsea")
        self.assertEqual(m1["status"], "COMPLETED")
        self.assertEqual(m1["score"]["home"], 2)
        self.assertEqual(m1["score"]["away"], 0)

    def test_repeat_import_idempotence(self):
        """2. Test repeat import with identical data yields deterministic, identical output."""
        out_path = os.path.join(self.test_dir, "demo_snapshot.json")
        importer = SnapshotImporter(season=2024)

        fixed_time = "2024-11-14T20:00:00Z"
        with open(self.valid_standings_fixture, "r") as f:
            st = json.load(f)
        with open(self.valid_matches_fixture, "r") as f:
            ma = json.load(f)

        snap1 = importer.normalize_and_validate(st, ma, fetched_at_utc=fixed_time, provider_updated_at="2024-08-25T09:00:00Z")
        snap2 = importer.normalize_and_validate(st, ma, fetched_at_utc=fixed_time, provider_updated_at="2024-08-25T09:00:00Z")

        self.assertEqual(json.dumps(snap1, sort_keys=True), json.dumps(snap2, sort_keys=True))

    def test_corrected_result(self):
        """3. Test updated match result is accurately promoted in snapshot."""
        out_path = os.path.join(self.test_dir, "demo_snapshot.json")
        importer = SnapshotImporter(season=2024)

        # First import with initial result (0-0 draw in match 1004)
        importer.import_snapshot(
            output_path=out_path,
            standings_fixture=self.valid_standings_fixture,
            matches_fixture=self.valid_matches_fixture,
        )
        with open(out_path, "r") as f:
            s1 = json.load(f)
        m1004_v1 = [m for m in s1["matches"] if m["providerMatchId"] == 1004][0]
        self.assertEqual(m1004_v1["score"]["home"], 0)
        self.assertEqual(m1004_v1["score"]["away"], 0)

        # Second import with corrected result (1-0 win for Man City)
        importer.import_snapshot(
            output_path=out_path,
            standings_fixture=self.valid_standings_fixture,
            matches_fixture=self.corrected_matches_fixture,
        )
        with open(out_path, "r") as f:
            s2 = json.load(f)
        m1004_v2 = [m for m in s2["matches"] if m["providerMatchId"] == 1004][0]
        self.assertEqual(m1004_v2["score"]["home"], 1)
        self.assertEqual(m1004_v2["score"]["away"], 0)

    def test_null_score_and_postponed_semantics(self):
        """4. Verify completed matches have scores while scheduled/postponed have null scores."""
        out_path = os.path.join(self.test_dir, "demo_snapshot.json")
        importer = SnapshotImporter(season=2024)

        snapshot = importer.import_snapshot(
            output_path=out_path,
            standings_fixture=self.valid_standings_fixture,
            matches_fixture=self.valid_matches_fixture,
        )

        matches = snapshot["matches"]
        # Match 1004 is completed 0-0
        m1004 = [m for m in matches if m["providerMatchId"] == 1004][0]
        self.assertEqual(m1004["status"], "COMPLETED")
        self.assertEqual(m1004["score"]["home"], 0)
        self.assertEqual(m1004["score"]["away"], 0)

        # Match 1005 is POSTPONED with null scores
        m1005 = [m for m in matches if m["providerMatchId"] == 1005][0]
        self.assertEqual(m1005["status"], "POSTPONED")
        self.assertIsNone(m1005["score"]["home"])
        self.assertIsNone(m1005["score"]["away"])

        # Match 1006 is SCHEDULED with null scores
        m1006 = [m for m in matches if m["providerMatchId"] == 1006][0]
        self.assertEqual(m1006["status"], "SCHEDULED")
        self.assertIsNone(m1006["score"]["home"])
        self.assertIsNone(m1006["score"]["away"])

    def test_invalid_input_missing_team(self):
        """5a. Test match referencing missing team raises validation error."""
        out_path = os.path.join(self.test_dir, "demo_snapshot.json")
        importer = SnapshotImporter(season=2024)

        with self.assertRaises(SnapshotValidationError) as ctx:
            importer.import_snapshot(
                output_path=out_path,
                standings_fixture=self.valid_standings_fixture,
                matches_fixture=self.invalid_missing_team_fixture,
            )
        self.assertIn("unknown home team provider ID", str(ctx.exception))

    def test_duplicate_match_id(self):
        """5b. Test duplicate match IDs raise validation error."""
        out_path = os.path.join(self.test_dir, "demo_snapshot.json")
        importer = SnapshotImporter(season=2024)

        with self.assertRaises(SnapshotValidationError) as ctx:
            importer.import_snapshot(
                output_path=out_path,
                standings_fixture=self.valid_standings_fixture,
                matches_fixture=self.duplicate_match_id_fixture,
            )
        self.assertIn("duplicate provider match id", str(ctx.exception).lower())

    def test_malformed_completed_match_score(self):
        """5c. Test completed match with null score raises validation error."""
        out_path = os.path.join(self.test_dir, "demo_snapshot.json")
        importer = SnapshotImporter(season=2024)

        with self.assertRaises(SnapshotValidationError) as ctx:
            importer.import_snapshot(
                output_path=out_path,
                standings_fixture=self.valid_standings_fixture,
                matches_fixture=self.malformed_score_fixture,
            )
        self.assertIn("null score", str(ctx.exception).lower())

    @patch("time.sleep", return_value=None)
    @patch("urllib.request.urlopen")
    def test_429_retry_after_and_timeout(self, mock_urlopen, mock_sleep):
        """6. Test HTTP 429 honors Retry-After header and succeeds on retry."""
        # First call raises 429 with Retry-After header; second call succeeds
        err_headers = {"Retry-After": "5"}
        mock_429 = urllib.error.HTTPError("https://api.football-data.org", 429, "Too Many Requests", err_headers, None)

        mock_context = MagicMock()
        mock_response = MagicMock()
        mock_response.headers.get.return_value = "2024-08-25T09:00:00Z"
        with open(self.valid_standings_fixture, "r") as f:
            valid_bytes = f.read().encode("utf-8")
        mock_response.read.return_value = valid_bytes
        mock_context.__enter__.return_value = mock_response

        mock_urlopen.side_effect = [mock_429, mock_context]

        importer = SnapshotImporter(season=2024, api_token="test-token", max_retries=2)
        data, last_mod = importer._fetch_with_retries("https://api.football-data.org/v4/competitions/PL/standings")

        self.assertIsNotNone(data)
        self.assertEqual(last_mod, "2024-08-25T09:00:00Z")
        mock_sleep.assert_called_with(5)  # Honored Retry-After: 5

    @patch("time.sleep", return_value=None)
    @patch("urllib.request.urlopen")
    def test_timeout_and_retry_exhaustion(self, mock_urlopen, mock_sleep):
        """6b. Test timeout retries up to max_retries then raises validation error."""
        mock_urlopen.side_effect = TimeoutError("Connection timed out")

        importer = SnapshotImporter(season=2024, api_token="test-token", max_retries=2)
        with self.assertRaises(SnapshotValidationError) as ctx:
            importer._fetch_with_retries("https://api.football-data.org/v4/competitions/PL/standings")

        self.assertIn("network error after 2 retries", str(ctx.exception).lower())
        self.assertEqual(mock_sleep.call_count, 2)

    def test_fixture_import_cannot_write_real_snapshot(self):
        """6c. Gate Test: Ensure fixture imports cannot write to default real snapshot path."""
        real_path = "data/snapshots/epl/snapshot.json"
        importer = SnapshotImporter(season=2024)

        with self.assertRaises(SnapshotValidationError) as ctx:
            importer.import_snapshot(
                output_path=real_path,
                standings_fixture=self.valid_standings_fixture,
                matches_fixture=self.valid_matches_fixture,
            )
        self.assertIn("cannot write to the default real snapshot path", str(ctx.exception))

    def test_last_known_good_preservation(self):
        """7. Test existing valid snapshot is preserved intact when a refresh fails."""
        out_path = os.path.join(self.test_dir, "demo_snapshot.json")
        importer = SnapshotImporter(season=2024)

        # 1. Establish initial valid snapshot
        snapshot_v1 = importer.import_snapshot(
            output_path=out_path,
            standings_fixture=self.valid_standings_fixture,
            matches_fixture=self.valid_matches_fixture,
        )
        self.assertTrue(os.path.exists(out_path))
        with open(out_path, "r", encoding="utf-8") as f:
            original_content = f.read()

        # 2. Attempt refresh with corrupted / invalid fixture
        with self.assertRaises(SnapshotValidationError):
            importer.import_snapshot(
                output_path=out_path,
                standings_fixture=self.valid_standings_fixture,
                matches_fixture=self.invalid_missing_team_fixture,
            )

        # 3. Verify original file content is completely intact and preserved
        with open(out_path, "r", encoding="utf-8") as f:
            current_content = f.read()

        self.assertEqual(original_content, current_content)


if __name__ == "__main__":
    unittest.main()
