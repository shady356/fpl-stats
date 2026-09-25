# components

React components, organized atomic-ish:

- `ui/` — generic, reusable components with no app-specific data or business logic (e.g. `ui/table`, buttons, badges). Could be reused in a different app.
- App-specific components (e.g. `Header`, `TableFilters`) live directly under `components/`.

Each component gets its own folder when it has more than one file (e.g. `ui/table/Table.tsx`, `ui/table/TableRow.tsx`), otherwise a single file is fine.

Keep out of `components/`:
- Data transforms and business logic (sorting, formatting, ratings math) — plain `.ts` modules elsewhere (e.g. `teamStatsTableColumns.ts`)
- Hooks that aren't purely presentational — a `hooks/` folder
