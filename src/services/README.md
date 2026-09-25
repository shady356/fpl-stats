# services

Data fetching and external API integration — network requests and calls to third-party SDKs. Returns raw or lightly-shaped data; no formatting, sorting, or ratings math.

Keep out of `services/`:
- Data transforms and business logic — `utils/`
- React state/lifecycle logic (loading/error state, caching) — `hooks/`
- Components — `components/`
