# types

Shared TypeScript types used across folders — data shapes like `Team` (e.g. `team.ts`).

Keep out of `types/`:
- Types only used by one module — declare them in that module
- Runtime code — `utils/`, `components/`, etc.
