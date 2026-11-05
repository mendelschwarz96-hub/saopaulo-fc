# Tricolor Decades

Unofficial fan site about São Paulo FC: a decade-by-decade history, commentary on the club today, and an endorsement of the opposition led by Marcelinho Portugal Gouveia.

## Files
- `index.html`, `styles.css`, `app.js`: the static site
- `scripts/fetch-news.mjs`: pulls headlines from Google News RSS into `news.json`
- `.github/workflows/news.yml`: re-runs the news pull every 3 hours on GitHub and commits the result

## Run locally
```
node scripts/fetch-news.mjs
npx serve .        # or: python -m http.server
```
Open http://localhost:3000 (or :8000). The news section needs an HTTP server; opening the file directly won't load `news.json`.

## Publish
Push to a GitHub repo, then turn on Settings → Pages (deploy from the `main` branch). The workflow keeps the news fresh.
