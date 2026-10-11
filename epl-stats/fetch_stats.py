import asyncio
import json
import sys
from pathlib import Path

import aiohttp
from understat import Understat

LEAGUE = "epl"
SEASON = 2026

DATA_DIR = Path(__file__).parent / "data"
MATCHES_FILE = DATA_DIR / f"{LEAGUE}_{SEASON}_matches.json"

# "On target" = shots that were either saved by the keeper or scored.
# Blocked shots, misses and post-hits are not on target.
ON_TARGET_RESULTS = {"Goal", "SavedShot"}

TEAM_NAME_OVERRIDES = {
    "Manchester City": "Man City",
    "Manchester United": "Man Utd",
    "Newcastle United": "Newcastle",
    "Nottingham Forest": "Nottm Forest",
    "Crystal Palace": "Palace",
    "Tottenham": "Spurs",
    "Ipswich": "Ipswich Town",
}


def ppda_ratio(ppda):
    """A match's PPDA (att / def), or None when there were no defensive actions."""
    return round(ppda["att"] / ppda["def"], 6) if ppda["def"] else None


async def fetch_team_matches(understat):
    teams = await understat.get_teams(LEAGUE, SEASON)
    results = await understat.get_league_results(LEAGUE, SEASON)

    # A team's history has no match ID, so join it to results on (team, kickoff).
    history_by_team_date = {
        (team["id"], m["date"]): m for team in teams for m in team["history"]
    }
    matches_by_team = {team["id"]: [] for team in teams}

    for match in results:
        home_id, away_id = match["h"]["id"], match["a"]["id"]

        shots = await understat.get_match_shots(match["id"])
        home_shots, away_shots = shots["h"], shots["a"]

        home_on_target = sum(1 for s in home_shots if s["result"] in ON_TARGET_RESULTS)
        away_on_target = sum(1 for s in away_shots if s["result"] in ON_TARGET_RESULTS)

        sides = [
            (home_id, away_id, True, home_shots, home_on_target, away_shots, away_on_target),
            (away_id, home_id, False, away_shots, away_on_target, home_shots, home_on_target),
        ]
        for team_id, opponent_id, home, own, own_on_target, opp, opp_on_target in sides:
            h = history_by_team_date[(team_id, match["datetime"])]
            matches_by_team[team_id].append(
                {
                    "match_id": int(match["id"]),
                    "date": match["datetime"],
                    "opponent_id": int(opponent_id),
                    "home": home,
                    "points": h["pts"],
                    "expected_points": round(h["xpts"], 6),
                    "goals": h["scored"],
                    "xg": round(h["xG"], 6),
                    "npxg": round(h["npxG"], 6),
                    "ga": h["missed"],
                    "xga": round(h["xGA"], 6),
                    "npxga": round(h["npxGA"], 6),
                    "shots": len(own),
                    "shots_on_target": own_on_target,
                    "shots_against": len(opp),
                    "shots_on_target_against": opp_on_target,
                    "deep": h["deep"],
                    "deep_allowed": h["deep_allowed"],
                    "ppda": ppda_ratio(h["ppda"]),
                    "o_ppda": ppda_ratio(h["ppda_allowed"]),
                }
            )

    return [
        {
            "team_id": int(team["id"]),
            "team_name": TEAM_NAME_OVERRIDES.get(team["title"], team["title"]),
            "matches": sorted(matches_by_team[team["id"]], key=lambda m: m["date"]),
        }
        for team in teams
    ]


async def main():
    force_refresh = "--refresh" in sys.argv

    async with aiohttp.ClientSession() as session:
        understat = Understat(session)
        DATA_DIR.mkdir(exist_ok=True)

        if force_refresh or not MATCHES_FILE.exists():
            teams = await fetch_team_matches(understat)
            MATCHES_FILE.write_text(json.dumps(teams, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
