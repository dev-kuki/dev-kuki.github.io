/* app.js */

/* ── toast ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

/* ── tab loader ── */
const TAB_CACHE = {};

async function switchTab(name) {
  // update nav
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === name)
  );

  const area = document.getElementById('content-area');

  // show loading skeleton briefly if not cached
  if (!TAB_CACHE[name]) {
    area.style.opacity = '0';
    area.style.transform = 'translateY(8px)';
  }

  // fetch tab html
  if (!TAB_CACHE[name]) {
    try {
      const r = await fetch(`tabs/${name}.html`);
      TAB_CACHE[name] = await r.text();
    } catch {
      TAB_CACHE[name] = `<div class="no-posts">failed to load tab</div>`;
    }
  }

  area.innerHTML = TAB_CACHE[name];

  // animate in
  requestAnimationFrame(() => {
    area.style.transition = 'opacity .28s cubic-bezier(.22,1,.36,1), transform .28s cubic-bezier(.22,1,.36,1)';
    area.style.opacity = '1';
    area.style.transform = 'translateY(0)';
  });

  // run tab-specific init
  onTabLoad(name);
}

function onTabLoad(name) {
  if (name === 'home') {
    loadLatestPost();
  } else if (name === 'kovaaks') {
    loadKovaaksHighscores();
    loadPosts(); // needed for vods
  } else if (name === 'posts') {
    loadPosts();
  } else if (name === 'comments') {
    loadComments();
  } else if (name === 'routine') {
    // re-attach routineItems after DOM swap
    reinitRoutine();
    loadLastRoutineCompletion();
  } else if (name === 'pc') {
    renderPcParts('studio-pc-rows', STUDIO_PARTS);
    renderPcParts('gaming-pc-rows', GAMING_PARTS);
  }
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
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob), download: filename
  });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

/* ── discord ── */
function copyDiscord() {
  navigator.clipboard.writeText('kuki071').then(() => {
    ['discord-row-name'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const orig = el.textContent;
      el.textContent = 'copied ✓';
      setTimeout(() => el.textContent = orig, 2000);
    });
    showToast('discord tag copied ✓');
  });
}

/* ── banner particles ── */
function spawnParticles() {
  const c = document.querySelector('.banner-particles');
  if (!c) return;
  for (let i = 0; i < 20; i++) {
    const s = document.createElement('span');
    const sz = Math.random() * 2 + 1;
    s.style.cssText = `
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      width:${sz}px; height:${sz}px;
      animation-duration:${Math.random()*9+5}s;
      animation-delay:${Math.random()*7}s;
    `;
    c.appendChild(s);
  }
}

/* ── routine reinit (DOM is replaced on tab load) ── */
function reinitRoutine() {
  // routine.js uses Array.from at init time, needs re-running after DOM swap
  const items = Array.from(document.querySelectorAll('.routine-item'));
  if (!items.length) return;
  // expose fresh items to routine.js functions
  window._routineItems = items;
  window._routineDurations = items.map(el => parseInt(el.dataset.mins, 10) * 60);
  fmtTotal();
}

/* ── view counter sync (show in both spots) ── */
function syncViewCount(n) {
  ['view-count', 'view-count-2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = Number(n).toLocaleString();
  });
}

/* ── modal & vod overlay wiring (delegated since DOM changes) ── */
document.addEventListener('click', e => {
  const overlay = e.target.closest('#delete-modal');
  if (overlay && e.target === overlay) closeModal();
  const vod = e.target.closest('#vod-player-overlay');
  if (vod && e.target === vod) closeVodPlayer();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeVodPlayer();
  }
});
document.getElementById('pin-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmDelete();
});

/* ── avatar status ── */
const STATUS = 'gaming'; // 'online' | 'gaming' | 'away' | 'offline'
document.getElementById('avatar-status-dot').classList.add(STATUS);

/* ── init ── */
spawnParticles();
initCounter();           // supabase.js — also calls syncViewCount
switchTab('home');       // load first tab
