# farukcan_web

Static personal website for **Faruk Can**, generated with [Astro](https://astro.build).
All content is pulled from `https://farukcan.dev/api.json` at build time, so the site
re-syncs itself on every build. Design language mirrors kadiryaren.dev (Apple-style dark
theme, Tailwind, CSS animations).

## Commands

```bash
npm install      # install dependencies
npm run dev      # local dev server
npm run build    # static build into dist/ (re-fetches api.json)
npm run preview  # preview the production build
```

## How it self-updates

The build fetches live data from the API. If the endpoint is unreachable, it falls back
to the committed snapshot at `src/data/api.json`, so builds never fail offline. To refresh
the snapshot, re-download the JSON into that path.

```mermaid
flowchart LR
    A[npm run build] --> B[getSiteData]
    B -->|fetch| C[farukcan.dev/api.json]
    C -->|ok| E[transform]
    C -->|fail| D[src/data/api.json snapshot]
    D --> E
    E --> F[Astro renders sections]
    F --> G[dist/ static site]
```

## Data mapping

| Site section | Source in api.json |
| ------------ | ------------------ |
| Hero role/tagline | `homePage.content` callout + `configuration` |
| Skills cards | `homePage.content` `<details>` blocks |
| Tech marquee | project `Tags` (deduped) |
| Projects grid | `databases[<id>].list` (Name, Status, Tags, Link, cover/icon, description) |
| Socials | anchors in `homePage.content` + `configuration.twitter_username` |

The transform lives in [`src/lib/data.ts`](src/lib/data.ts). Images use the stable
`/assets/...` paths served from `https://farukcan.dev` (Notion S3 signed URLs expire and
are intentionally not used).
