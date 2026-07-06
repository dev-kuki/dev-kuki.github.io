/* app.js — tabs loaded from TABS object (tabs.js), no fetch required */

/* ── toast ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

/* ── tab switching ── */
function switchTab(name) {
  // update active button
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === name)
  );

  const area = document.getElementById('content-area');
  area.style.opacity = '0';
  area.style.transform = 'translateY(8px)';

  // inject from TABS object — no fetch, works on GitHub Pages
  area.innerHTML = TABS[name] || '<div class="no-posts">tab not found</div>';

  requestAnimationFrame(() => {
    area.style.transition = 'opacity .28s cubic-bezier(.22,1,.36,1), transform .28s cubic-bezier(.22,1,.36,1)';
    area.style.opacity = '1';
    area.style.transform = 'translateY(0)';
  });

  // per-tab init
  if (name === 'home')     loadLatestPost();
  if (name === 'kovaaks')  { loadKovaaksHighscores(); loadPosts(); }
  if (name === 'posts')    loadPosts();
  if (name === 'comments') loadComments();
  if (name === 'routine')  { fmtTotal(); loadLastRoutineCompletion(); }
  if (name === 'pc')       { renderPcParts('studio-pc-rows', STUDIO_PARTS); renderPcParts('gaming-pc-rows', GAMING_PARTS); }
}

/* ── PC parts ── */
const STUDIO_PARTS = [
  { label: 'CPU',         value: 'Intel Core i9-14900K' },
  { label: 'GPU',         value: 'RTX 5070 Ti Super' },
  { label: 'Motherboard', value: 'ASUS ROG Maximus Z790 Dark Hero' },
  { label: 'RAM',         value: '128GB DDR5' },
  { label: 'Storage',     value: 'Samsung 2TB NVMe' },
];
const GAMING_PARTS = [
  { label: 'CPU', value: 'Intel Core i5-4460' },
  { label: 'GPU', value: 'GTX 1660 Ti' },
  { label: 'RAM', value: '16GB DDR3' },
];

function renderPcParts(id, parts) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = parts.map(p => `
    <a class="spec-row" href="https://www.amazon.com/s?k=${encodeURIComponent(p.value)}" target="_blank" rel="noopener">
      <span class="spec-label">${p.label}</span>
      <span class="spec-val">${p.value}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </span>
    </a>`).join('');
}

/* ── configs ── */
function copyConfig(id) {
  navigator.clipboard.writeText(document.getElementById(id).textContent)
    .then(() => showToast('copied ✓'));
}
function downloadConfig(id, filename) {
  const blob = new Blob([document.getElementById(id).textContent], { type: 'text/plain' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

/* ── discord ── */
function copyDiscord() {
  navigator.clipboard.writeText('kuki071').then(() => {
    const el = document.getElementById('discord-row-name');
    if (el) { el.textContent = 'copied ✓'; setTimeout(() => el.textContent = 'Discord', 2000); }
    showToast('discord tag copied ✓');
  });
}

/* ── banner particles ── */
function spawnParticles() {
  const c = document.querySelector('.banner-particles');
  if (!c) return;
  for (let i = 0; i < 22; i++) {
    const s = document.createElement('span');
    const sz = Math.random() * 2 + 1;
    s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${sz}px;height:${sz}px;animation-duration:${Math.random()*9+5}s;animation-delay:${Math.random()*7}s;`;
    c.appendChild(s);
  }
}

/* ── modal/vod close ── */
document.addEventListener('click', e => {
  if (e.target.id === 'delete-modal')       closeModal();
  if (e.target.id === 'vod-player-overlay') closeVodPlayer();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeVodPlayer(); }
});
document.getElementById('pin-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmDelete();
});

/* ── avatar status ── */
document.getElementById('avatar-status-dot').classList.add('gaming');

/* ── init ── */
spawnParticles();
initCounter();      // from supabase.js — calls syncViewCount
switchTab('home');  // load first tab
