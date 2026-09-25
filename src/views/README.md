# views

Top-level page components, one per route/nav destination (e.g. `Overview`, `Fixtures`). They compose components, hooks, and services into a page, but hold little logic themselves.

A view gets its own folder once it has more than one file (styles, view-local components, sub-views). Sub-views (e.g. a nested route/tab under a page) live as sibling folders inside their parent view, following the same convention recursively:

```
views/
  about/
    About.tsx
    About.css
    components/
      AboutHelper.tsx      # used only by this view — not shared elsewhere
    contact/                # sub-view nested under `about`
      Contact.tsx
      Contact.css
  fixtures/
    Fixtures.tsx
```

Keep out of `views/`:
- Reusable, app-specific or generic UI — `components/`
- Data transforms and business logic (sorting, formatting, ratings math) — `utils/`
- Data fetching / API calls — `services/`
- Non-presentational hooks (state, fetching, subscriptions) — `hooks/`

If a view-local component in a `components/` subfolder ends up reused by another view, promote it to the top-level `components/` instead.
