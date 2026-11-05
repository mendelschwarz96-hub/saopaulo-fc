const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Hero title: letter-by-letter drop ----------
document.querySelectorAll('.split').forEach(el => {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.textContent = '';
  [...text].forEach((c, i) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.setAttribute('aria-hidden', 'true');
    s.textContent = c === ' ' ? ' ' : c;
    s.style.animationDelay = (0.3 + i * 0.045) + 's';
    el.append(s);
  });
});

// ---------- Decade label "odometer" count-up ----------
function countYear(label) {
  const end = Number(label.dataset.year);
  if (reduceMotion || !end) return;
  const start = end - 30, dur = 900, t0 = performance.now();
  (function tick(t) {
    const p = Math.min((t - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    label.textContent = Math.round(start + (end - start) * eased) + (p === 1 ? 's' : '');
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

// ---------- Reveal on scroll ----------
const io = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('in');
    const label = e.target.querySelector('.decade-label');
    if (label) countYear(label);
    if (e.target.querySelector('#debt-number')) startDebt();
    io.unobserve(e.target);
  }
}, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------- Scroll progress, timeline fill, hero parallax ----------
const bar = document.getElementById('progress-bar');
const timeline = document.querySelector('.timeline');
const fill = document.querySelector('.timeline-fill');
const heroPhoto = document.querySelector('.hero-photo');
function onScroll() {
  const h = document.documentElement;
  bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  const r = timeline.getBoundingClientRect();
  const p = Math.min(Math.max((innerHeight * 0.6 - r.top) / r.height, 0), 1);
  fill.style.height = (p * 100) + '%';
  if (!reduceMotion && h.scrollTop < innerHeight) heroPhoto.style.translate = `0 ${h.scrollTop * 0.35}px`;
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Debt counter ----------
// Illustrative model: starts from R$ 1 billion on DEBT_BASE_DATE and grows at
// ANNUAL_RATE. Update both when the club publishes new audited figures.
const DEBT_BASE = 1_000_000_000;
const DEBT_BASE_DATE = new Date('2026-01-01T00:00:00-03:00');
const ANNUAL_RATE = 0.12;
const perSecond = DEBT_BASE * ANNUAL_RATE / (365 * 24 * 3600);
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const brl2 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const debtNow = () => DEBT_BASE + perSecond * (Date.now() - DEBT_BASE_DATE) / 1000;
const pageOpened = Date.now();
let debtStarted = false;

document.getElementById('debt-rate').textContent = brl2.format(perSecond);
document.getElementById('debt-day').textContent = brl.format(perSecond * 86400);

function startDebt() {
  if (debtStarted) return;
  debtStarted = true;
  const num = document.getElementById('debt-number');
  const session = document.getElementById('debt-session');
  const t0 = performance.now(), rampMs = reduceMotion ? 0 : 2200;
  (function tick(t) {
    const target = debtNow();
    const p = rampMs ? Math.min((t - t0) / rampMs, 1) : 1;
    const eased = 1 - Math.pow(1 - p, 4);
    num.textContent = brl.format(target * eased);
    session.textContent = brl2.format(perSecond * (Date.now() - pageOpened) / 1000);
    if (p === 1) num.classList.add('alarm');
    requestAnimationFrame(tick);
  })(t0);
}

// ---------- Photo credits ----------
fetch('images/credits.json').then(r => r.json()).then(credits => {
  const ul = document.getElementById('credits-list');
  for (const [key, c] of Object.entries(credits)) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = c.page; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = c.title;
    li.append(a, ` by ${c.artist}, ${c.license}, via Wikimedia Commons`);
    ul.append(li);
  }
}).catch(() => {});

// ---------- News ----------
(async function () {
  const list = document.getElementById('news-list');
  const updated = document.getElementById('news-updated');
  let items = [];

  try {
    const res = await fetch('news.json', { cache: 'no-store' });
    const data = await res.json();
    items = data.items || [];
    if (data.updatedAt) {
      updated.textContent = 'Last updated ' + new Date(data.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) + '.';
    }
  } catch (e) {
    list.innerHTML = '<p class="muted">News could not be loaded. Run <code>node scripts/fetch-news.mjs</code> and serve the folder over HTTP.</p>';
    return;
  }

  function render(lang) {
    const shown = items.filter(i => lang === 'all' || i.lang === lang);
    if (!shown.length) { list.innerHTML = '<p class="muted">No headlines right now.</p>'; return; }
    list.innerHTML = '';
    shown.forEach((it, idx) => {
      const card = document.createElement('article');
      card.className = 'news-card';
      card.style.animationDelay = Math.min(idx * 0.04, 0.6) + 's';
      const a = document.createElement('a');
      a.href = it.link; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = it.title;
      const meta = document.createElement('div');
      meta.className = 'news-meta';
      const badge = document.createElement('span');
      badge.className = 'lang-badge';
      badge.textContent = it.lang;
      meta.append(badge, [it.source, it.date && new Date(it.date).toLocaleDateString('en-US', { dateStyle: 'medium' })].filter(Boolean).join(' · '));
      card.append(a, meta);
      list.append(card);
    });
  }

  document.querySelectorAll('.chip').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(b => b.classList.toggle('active', b === btn));
    render(btn.dataset.lang);
  }));

  render('all');
})();
