# EPL stats (understat)

Fetches Premier League team stats for the 2026/27 season from
[understat.com](https://understat.com) via the
[`understat`](https://github.com/amosbastian/understat) Python library,
caches them to JSON, and renders a plain HTML table.

## Usage

```bash
.venv/bin/python fetch_stats.py            # uses the cached JSON if present
.venv/bin/python fetch_stats.py --refresh  # re-fetches from understat.com
```

Output:

- `data/epl_2026_teams.json` — the cached data

## Fields

| field                     | meaning                                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `team_id`                 | understat's internal team ID                                                                                                                                       |
| `team_name`               | team name                                                                                                                                                          |
| `games_played`            | completed matches this season                                                                                                                                      |
| `points`                  | league points                                                                                                                                                      |
| `expected_points`         | sum of per-match `xpts`                                                                                                                                            |
| `goals`                   | goals scored                                                                                                                                                       |
| `xg`                      | expected goals (sum of per-match `xG`)                                                                                                                             |
| `npxg`                    | non-penalty expected goals (sum of per-match `npxG`)                                                                                                               |
| `ga`                      | goals against                                                                                                                                                      |
| `xga`                     | expected goals against (sum of per-match `xGA`)                                                                                                                    |
| `npxga`                   | non-penalty expected goals against (sum of per-match `npxGA`)                                                                                                      |
| `shots`                   | total shots taken, summed from every match's shot data                                                                                                             |
| `shots_on_target`         | shots taken with result `Goal` or `SavedShot` (see caveat below)                                                                                                   |
| `shots_against`           | opponents' `shots` in the same matches                                                                                                                             |
| `shots_on_target_against` | opponents' `shots_on_target` in the same matches                                                                                                                   |
| `deep_per_game`           | deep completions (passes completed within ~20yd of goal) per game, summed from per-match `deep` and divided by `games_played`                                     |
| `deep_allowed_per_game`   | deep completions allowed per game, summed from per-match `deep_allowed` and divided by `games_played`                                                              |
| `ppda_per_game`           | average PPDA (passes allowed per defensive action) per match — sum of each match's own `ppda.att / ppda.def` ratio, divided by `games_played`                     |
| `o_ppda_per_game`         | average opponents' PPDA per match — sum of each match's own `ppda_allowed.att / ppda_allowed.def` ratio, divided by `games_played`                                 |

## Why `shots_on_target` is derived, not fetched directly

The library's docs mention a `get_match_stats` method that returns a
ready-made per-match summary (`h_shot`, `a_shot`, `h_shotOnTarget`, ...).
**That method no longer exists** in the currently published version of the
library (checked against `understat` 0.1.14 / PyPI, published 2025-12-16) —
understat.com changed its API around that date and the library was rewritten
to match, but the docs page wasn't updated to drop the removed method. Calling
it raises `AttributeError`.

So instead, `fetch_stats.py` builds the shot totals itself:

1. Pull every completed match ID for the season (`get_league_results`).
2. For each match, pull the full shot-by-shot data (`get_match_shots`), which
   returns `{"h": [...], "a": [...]}` — every individual shot, each with a
   `result` field (`Goal`, `SavedShot`, `MissedShots`, `BlockedShot`,
   `ShotOnPost`, or `OwnGoal`).
3. `shots` = count of all shots for that side.
   `shots_on_target` = count where `result` is `Goal` or `SavedShot` — the
   standard definition (a shot that either scored or forced a save).
   `MissedShots`, `BlockedShot`, and `ShotOnPost` are **not** on target.
4. A team's `shots_against` / `shots_on_target_against` are just the
   opponent's `shots` / `shots_on_target` from that same match.

**Caveat — own goals:** `OwnGoal` shots (7 so far this season) are counted
in `shots`/`shots_against` for the team that took the shot, but are _not_
counted as on-target for either side. If a `goals` total and a
`shots_on_target` total look slightly inconsistent for a team, this is why.

## Season format

understat labels a season by the year it starts — `2026` means the 2026/27
season, `2025` means 2025/26, etc.
