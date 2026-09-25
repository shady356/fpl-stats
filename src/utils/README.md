# utils

Plain JS modules with no React and no side effects: data transforms and business logic — sorting, formatting, ratings math (e.g. `teamStatsTableColumns.js`, `teamBadges.js`).

Keep out of `utils/`:
- React state/lifecycle logic — `hooks/`
- Components — `components/`
- Data fetching / API calls — `services/`
