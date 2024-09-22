#### jellyfish

CLI tool to scrape and store anime(s) in your own mongodb database.

#### To install dependencies:

```bash
bun install
```

#### Environment Variables:

Copy variable's from `.env.example` to `.env` and provide its values.

```bash
MONGODB_URI=(required)
NODEMAILER=(optional)
EMAIL_FROM=(optional)
EMAIL_TO=(optional)
```

#### Available Commands:

| Commands                        | Usage                        |
| ------------------------------- | ---------------------------- |
| `bun index.ts --i1 [anilistId]` | Insert anime by anilistId.   |
| `bun index.ts --iall`           | Insert all animes.           |
| `bun index.ts --r1 [anilistId]` | Remove anime with anilistId. |
| `bun index.ts --u0`             | Update all ongoing animes.   |
| `bun index.ts --ud [anilistId]` | Update dub by anilistId.     |
| `bun index.ts --udall`          | Update all dubs.             |
| `bun index.ts --stats`          | Server stats.                |
| `bun index.ts --help or -h`     | Shows available commands.    |

_© Irfan Shadik Rishad_
