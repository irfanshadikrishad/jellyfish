# jellyfish

CLI tool to scrape and store anime(s) in your own mongodb database.

To install dependencies:

```bash
bun install
```

Environment Variables:
Copy variable's from `.env.example` to `.env` and provide its values.

```bash
MONGODB_URI=
```

Available Commands:

```bash
bun index.ts --i1 [anilistId]
bun index.ts --iall [from_page]
bun index.ts --r0
bun index.ts --r1 [anilistId]
bun index.ts --u0
bun index.ts --ud [anilistId]
bun index.ts --stats
```
