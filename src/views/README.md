# views

Top-level page components, one per route/nav destination (e.g. `OverviewPage`, `FixturesPage`). Page folders, files and components are suffixed with `Page`. They compose components, hooks, and services into a page, but hold little logic themselves.

A view gets its own folder once it has more than one file (styles, view-local components, sub-views). Sub-views (e.g. a nested route/tab under a page) live as sibling folders inside their parent view, following the same convention recursively:

```
views/
  AboutPage/
    AboutPage.tsx
    AboutPage.css
    components/
      AboutHelper.tsx      # used only by this view — not shared elsewhere
    ContactPage/            # sub-view nested under `AboutPage`
      ContactPage.tsx
      ContactPage.css
  FixturesPage/
    FixturesPage.tsx
```

Keep out of `views/`:
- Reusable, app-specific or generic UI — `components/`
- Data transforms and business logic (sorting, formatting, ratings math) — `utils/`
- Data fetching / API calls — `services/`
- Non-presentational hooks (state, fetching, subscriptions) — `hooks/`

If a view-local component in a `components/` subfolder ends up reused by another view, promote it to the top-level `components/` instead.
