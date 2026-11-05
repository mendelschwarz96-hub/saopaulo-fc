# AGENTS.md

Instructions for AI coding agents working on this site. These rules are the owner's editorial choices.

**Site:** Tricolor Decades, an unofficial São Paulo FC fan site by Mendel Schwarz for Generative AI for Business. It's a static site: `index.html`, `styles.css`, `app.js`.

## Rules

### 1. Always support the opposition
- Commentary on club politics always backs the opposition led by **Marcelinho Portugal Gouveia** and stays critical of the current board.
- Keep opinion in the sections labeled Opinion or Endorsement. Don't mix it into the factual history.
- Advocacy must rest on facts. Never invent quotes, numbers, scandals or platform positions. If a claim can't be sourced, leave it out or flag it for the owner.

### 2. Always include free pictures
- Use only images that are free to reuse: public domain or Creative Commons (CC0, CC BY, CC BY-SA), mainly from Wikimedia Commons.
- No official club crests, logos, or photos from news agencies or the club's own channels.
- Save images in `images/` and add a credit entry for each one in `images/credits.json` (title, artist, license, source page). The footer builds its credits list from that file.
- Every image needs `alt` text and a caption that doesn't overstate what the photo shows. For example, if a portrait was taken later, say so.
- Download thumbnails around 1000–1200px wide rather than full-size originals.

### 3. Bring in news to keep it updated
- Headlines come from `scripts/fetch-news.mjs` (Google News RSS, English and Portuguese) and are saved to `news.json`.
- Run `node scripts/fetch-news.mjs` and commit `news.json` with any content update.
- The GitHub Action in `.github/workflows/news.yml` refreshes the news every 3 hours. Keep it working.
- When news shows a significant event (a title, an election, a board decision, a big transfer, a new debt figure), update the 2020s section, the "Club Today" section or the debt counter to match.

## Other conventions
- Write in plain, clear English.
- Keep the byline "Unofficial fan site by Mendel Schwarz for Generative AI for Business" and the "not affiliated" disclaimer.
- Debt counter: when audited figures are published, update `DEBT_BASE`, `DEBT_BASE_DATE` and `ANNUAL_RATE` in `app.js`, along with the note under the counter.
- Animations must respect `prefers-reduced-motion`.
