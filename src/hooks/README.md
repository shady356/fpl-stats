# hooks

Custom React hooks that aren't purely presentational — state, data fetching, subscriptions, or logic reused across components/views.

Purely presentational hooks (e.g. ones only managing UI state for a single component) can stay local to that component instead of living here.

Keep out of `hooks/`:
- Plain data transforms and business logic with no React state/lifecycle involved — plain `.ts` modules elsewhere (e.g. `utils/`, `teamStatsTableColumns.ts`)
- Components — `components/`
