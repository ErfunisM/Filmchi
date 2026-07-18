# Filmchi

Mood-based movie recommendations powered by NaraRouter and TMDB.

## Setup

1. Copy env file and fill in keys:

```bash
cp .env.local.example .env.local
```

Required variables:

- `NARAROUTER_API_KEY` — from [NaraRouter](https://router.naraya.ai/)
- `NARAROUTER_MODEL` (default `mistral-large`, free-tier friendly)
- `TMDB_API_KEY`

2. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
## Flow

1. Gender, age, country/city (or current location)
2. Mood (emoji picker)
3. Optional story / mood details
4. Watch time + company
5. Five movie suggestions — one at a time, with **Next movie**

