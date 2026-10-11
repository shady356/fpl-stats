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

Or, from the project root: `npm run stats` (same as `--refresh`).

Output:

- `data/epl_2026_matches.json` — cached per-match stats, one entry per team:
  `{ team_id, team_name, matches: [...] }`, with `matches` oldest first

Each file is fetched only if missing, unless `--refresh` is passed.

The app turns these into season totals, or totals over a team's last 3/5/10
matches, in `src/utils/aggregateMatches.ts`.

## Match fields

Each entry in `matches` is one team's view of one match.

| field                     | meaning                                                                          |
| ------------------------- | -------------------------------------------------------------------------------- |
| `match_id`                | understat's internal match ID                                                    |
| `date`                    | kickoff, `YYYY-MM-DD HH:mm:ss`                                                   |
| `opponent_id`             | the opponent's `team_id`                                                         |
| `home`                    | `true` if this team was at home                                                  |
| `points`                  | league points from the match                                                     |
| `expected_points`         | understat's `xpts`                                                               |
| `goals`                   | goals scored                                                                     |
| `xg`                      | expected goals                                                                   |
| `npxg`                    | non-penalty expected goals                                                       |
| `ga`                      | goals against                                                                    |
| `xga`                     | expected goals against                                                           |
| `npxga`                   | non-penalty expected goals against                                               |
| `shots`                   | shots taken, counted from the match's shot data                                  |
| `shots_on_target`         | shots taken with result `Goal` or `SavedShot` (see caveat below)                 |
| `shots_against`           | the opponent's `shots`                                                           |
| `shots_on_target_against` | the opponent's `shots_on_target`                                                 |
| `deep`                    | deep completions (passes completed within ~20yd of goal)                         |
| `deep_allowed`            | deep completions allowed                                                         |
| `ppda`                    | passes allowed per defensive action, `ppda.att / ppda.def`; `null` if `def` is 0 |
| `o_ppda`                  | opponents' PPDA, `ppda_allowed.att / ppda_allowed.def`; `null` if `def` is 0     |

A team's understat `history` has no match ID, so `fetch_stats.py` joins each
history entry to its result on team and kickoff time.

## Fixture fields

| field          | meaning                                                  |
| -------------- | -------------------------------------------------------- |
| `fixture_id`   | understat's internal match ID                            |
| `kickoff`      | kickoff time, ISO 8601 UTC (e.g. `2026-10-10T11:30:00Z`) |
| `home_team_id` | home team's `team_id`                                    |
| `away_team_id` | away team's `team_id`                                    |
| `home_goals`   | home goals; `null` until played                          |
| `away_goals`   | away goals; `null` until played                          |
| `home_xg`      | home expected goals; `null` until played                 |
| `away_xg`      | away expected goals; `null` until played                 |

understat has no gameweek numbers, so fixtures are ordered by `kickoff`.

## Why `shots_on_target` is derived, not fetched directly

The library's docs mention a `get_match_stats` method that returns a
ready-made per-match summary (`h_shot`, `a_shot`, `h_shotOnTarget`, ...).
**That method no longer exists** in the currently published version of the
library (checked against `understat` 0.1.14 / PyPI, published 2025-12-16) —
understat.com changed its API around that date and the library was rewritten
to match, but the docs page wasn't updated to drop the removed method. Calling
it raises `AttributeError`.

So instead, `fetch_stats.py` counts the shots itself:

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
