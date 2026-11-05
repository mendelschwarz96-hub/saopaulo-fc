// Loads news.json (written by scripts/fetch-news.mjs) and renders it.
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
    for (const it of shown) {
      const card = document.createElement('article');
      card.className = 'news-card';
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
    }
  }

  document.querySelectorAll('.chip').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(b => b.classList.toggle('active', b === btn));
    render(btn.dataset.lang);
  }));

  render('all');
})();
