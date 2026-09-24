import asyncio
import json
import sys
from pathlib import Path

import aiohttp
from understat import Understat

LEAGUE = "epl"
SEASON = 2026

DATA_FILE = Path(__file__).parent / "data" / f"{LEAGUE}_{SEASON}_teams.json"

# "On target" = shots that were either saved by the keeper or scored.
# Blocked shots, misses and post-hits are not on target.
ON_TARGET_RESULTS = {"Goal", "SavedShot"}


async def fetch_team_stats(session):
    understat = Understat(session)

    teams = await understat.get_teams(LEAGUE, SEASON)
    results = await understat.get_league_results(LEAGUE, SEASON)

    stats = {}
    for team in teams:
        history = team["history"]
        games_played = len(history)

        aggregated_deep = sum(m["deep"] for m in history)
        aggregated_deep_allowed = sum(m["deep_allowed"] for m in history)

        match_ppda = [
            m["ppda"]["att"] / m["ppda"]["def"] for m in history if m["ppda"]["def"]
        ]
        aggregated_ppda = round(sum(match_ppda), 2)

        match_o_ppda = [
            m["ppda_allowed"]["att"] / m["ppda_allowed"]["def"]
            for m in history
            if m["ppda_allowed"]["def"]
        ]
        aggregated_o_ppda = round(sum(match_o_ppda), 2)

        stats[team["id"]] = {
            "team_id": int(team["id"]),
            "team_name": team["title"],
            "games_played": games_played,
            "points": sum(m["pts"] for m in history),
            "expected_points": round(sum(m["xpts"] for m in history), 2),
            "goals": sum(m["scored"] for m in history),
            "xg": round(sum(m["xG"] for m in history), 2),
            "npxg": round(sum(m["npxG"] for m in history), 2),
            "ga": sum(m["missed"] for m in history),
            "xga": round(sum(m["xGA"] for m in history), 2),
            "npxga": round(sum(m["npxGA"] for m in history), 2),
            "shots": 0,
            "shots_on_target": 0,
            "shots_against": 0,
            "shots_on_target_against": 0,
            "deep_per_game": round(aggregated_deep / games_played, 2) if games_played else 0,
            "deep_allowed_per_game": round(aggregated_deep_allowed / games_played, 2) if games_played else 0,
            "ppda_per_game": round(aggregated_ppda / games_played, 2) if games_played else 0,
            "o_ppda_per_game": round(aggregated_o_ppda / games_played, 2) if games_played else 0,
        }

    for match in results:
        home_id, away_id = match["h"]["id"], match["a"]["id"]

        shots = await understat.get_match_shots(match["id"])
        home_shots, away_shots = shots["h"], shots["a"]

        home_on_target = sum(1 for s in home_shots if s["result"] in ON_TARGET_RESULTS)
        away_on_target = sum(1 for s in away_shots if s["result"] in ON_TARGET_RESULTS)

        stats[home_id]["shots"] += len(home_shots)
        stats[home_id]["shots_on_target"] += home_on_target
        stats[home_id]["shots_against"] += len(away_shots)
        stats[home_id]["shots_on_target_against"] += away_on_target

        stats[away_id]["shots"] += len(away_shots)
        stats[away_id]["shots_on_target"] += away_on_target
        stats[away_id]["shots_against"] += len(home_shots)
        stats[away_id]["shots_on_target_against"] += home_on_target

    return sorted(
        stats.values(), key=lambda t: (-t["points"], -(t["goals"] - t["ga"]))
    )


async def main():
    force_refresh = "--refresh" in sys.argv

    if DATA_FILE.exists() and not force_refresh:
        teams = json.loads(DATA_FILE.read_text())
    else:
        async with aiohttp.ClientSession() as session:
            teams = await fetch_team_stats(session)
        DATA_FILE.parent.mkdir(exist_ok=True)
        DATA_FILE.write_text(json.dumps(teams, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
