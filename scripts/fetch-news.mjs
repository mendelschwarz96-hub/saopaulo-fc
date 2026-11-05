// Pulls São Paulo FC headlines from Google News RSS and writes news.json.
// Usage: node scripts/fetch-news.mjs   (Node 18+, no dependencies)
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const FEEDS = [
  { lang: 'en', url: 'https://news.google.com/rss/search?q=%22S%C3%A3o+Paulo+FC%22&hl=en-US&gl=US&ceid=US:en' },
  { lang: 'pt', url: 'https://news.google.com/rss/search?q=%22S%C3%A3o+Paulo+FC%22+OR+%22Tricolor+Paulista%22&hl=pt-BR&gl=BR&ceid=BR:pt-419' },
];
const PER_FEED = 15;

const decode = s => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
const tag = (xml, name) => { const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)); return m ? decode(m[1]) : ''; };

async function pull({ lang, url }) {
  const res = await fetch(url, { headers: { 'User-Agent': 'tricolor-decades-news/1.0' } });
  if (!res.ok) throw new Error(`${lang}: HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, PER_FEED).map(([, item]) => {
    const source = tag(item, 'source');
    let title = tag(item, 'title');
    if (source && title.endsWith(' - ' + source)) title = title.slice(0, -(source.length + 3));
    return { lang, title, link: tag(item, 'link'), source, date: new Date(tag(item, 'pubDate')).toISOString() };
  });
}

const results = await Promise.allSettled(FEEDS.map(pull));
const items = results.flatMap(r => r.status === 'fulfilled' ? r.value : (console.warn(r.reason.message), []));
if (!items.length) { console.error('No news fetched; leaving news.json unchanged.'); process.exit(1); }

const seen = new Set();
const unique = items
  .filter(i => !seen.has(i.title.toLowerCase()) && seen.add(i.title.toLowerCase()))
  .sort((a, b) => new Date(b.date) - new Date(a.date));

const out = fileURLToPath(new URL('../news.json', import.meta.url));
await writeFile(out, JSON.stringify({ updatedAt: new Date().toISOString(), items: unique }, null, 2));
console.log(`Wrote ${unique.length} headlines to news.json`);
