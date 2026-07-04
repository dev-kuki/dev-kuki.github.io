/* supabase.js — all database interactions */

const SUPABASE_URL = 'https://lizqrjwssbulvhwrjefb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpenFyandzc2J1bHZod3JqZWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTU1MDAsImV4cCI6MjA5NzM5MTUwMH0.saaxPRy436i_abIU4Ea1MH9-4oGbl5XuS76PUFg4FZE';

// Pin hashes would be better; leaving as-is since it's your site
const DELETE_PIN = '1928182';
const POST_PIN   = '8182182';
const KOVAAKS_USERNAME = 'kuki0771';

let postsUnlocked  = false;
let scoresUnlocked = false;
let pendingDeleteId    = null;
let pendingDeleteTable = null;

/* ── low-level fetch wrapper ── */
function api(path, opts = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': opts.prefer || '',
      ...opts.headers,
    },
    ...opts,
  });
}

/* ── utilities ── */
function esc(s) {
  return String(s)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function youtubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\\w-]{11})/);
  return m ? m[1] : null;
}
function youtubeEmbed(url) {
  const id = youtubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
function youtubeThumb(url) {
  const id = youtubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

/* ── visit counter ── */
async function initCounter() {
  try {
    await api('rpc/increment_visits', { method: 'POST', body: JSON.stringify({}) });
    const r = await api('visits?id=eq.1&select=count');
    const d = await r.json();
    syncViewCount(d[0].count);
  } catch {
    syncViewCount('—');
  }
}

/* ── comments ── */
async function loadComments() {
  try {
    const r = await api('comments?select=*&order=created_at.desc');
    renderComments(await r.json());
  } catch { renderComments([]); }
}

function renderComments(comments) {
  const list  = document.getElementById('comments-list');
  const empty = document.getElementById('no-comments');
  list.querySelectorAll('.comment-card').forEach(c => c.remove());

  if (!comments || comments.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  comments.forEach(c => {
    const el = document.createElement('div');
    el.className = 'comment-card';
    el.innerHTML = `
      <div class="comment-header">
        <span class="comment-name">${esc(c.name)}</span>
        <span style="display:flex;align-items:center;gap:8px">
          <span class="comment-time">${formatDate(c.created_at)}</span>
          <button class="delete-btn" onclick="askDelete('${c.id}','comments')" title="delete">✕</button>
        </span>
      </div>
      <div class="comment-text">${esc(c.text)}</div>`;
    list.appendChild(el);
  });
}

async function submitComment() {
  const name = document.getElementById('comment-name').value.trim();
  const text = document.getElementById('comment-text').value.trim();
  if (!name) { document.getElementById('comment-name').focus(); return; }
  if (!text) { document.getElementById('comment-text').focus(); return; }

  const btn = document.querySelector('#tab-comments .submit-btn');
  btn.textContent = 'posting...';
  btn.disabled = true;

  try {
    await api('comments', { method: 'POST', prefer: 'return=minimal', body: JSON.stringify({ name, text }) });
    document.getElementById('comment-name').value = '';
    document.getElementById('comment-text').value = '';
    await loadComments();
  } catch { alert('failed to post, try again'); }

  btn.textContent = 'post comment';
  btn.disabled = false;
}

/* ── posts ── */
function unlockPosts() {
  const val = document.getElementById('post-pin-input').value;
  const msg = document.getElementById('post-pin-msg');
  if (val === POST_PIN) {
    postsUnlocked = true;
    document.getElementById('post-pin-gate').style.display = 'none';
    document.getElementById('post-unlocked-badge').style.display = 'inline-flex';
    document.getElementById('post-form').classList.add('unlocked');
    msg.textContent = '';
    renderPosts(window._lastPosts || []);
  } else {
    msg.textContent = 'wrong pin';
  }
  document.getElementById('post-pin-input').value = '';
}

async function loadPosts() {
  try {
    const r = await api('posts?select=*&order=created_at.desc');
    const posts = await r.json();
    window._lastPosts = Array.isArray(posts) ? posts : [];
  } catch { window._lastPosts = []; }

  renderPosts(window._lastPosts);
  renderKovaaksVods(window._lastPosts);
  renderLatestPostCard(window._lastPosts);
}

function renderLatestPostCard(posts) {
  const wrap = document.getElementById('latest-post-card');
  if (!wrap) return;
  if (!posts || posts.length === 0) {
    wrap.innerHTML = '<div class="no-posts">no posts yet</div>';
    return;
  }
  const el = document.createElement('div');
  el.className = 'post-card';
  el.innerHTML = postCardHTML(posts[0], false);
  wrap.innerHTML = '';
  wrap.appendChild(el);
}

function isKovaaksPost(p) {
  return `${p.title || ''} ${p.text || ''}`.toLowerCase().includes('kovaaks');
}

function getLikedPostIds() {
  try { return JSON.parse(localStorage.getItem('liked_posts') || '[]'); }
  catch { return []; }
}
function hasLiked(id) { return getLikedPostIds().includes(id); }
function markLiked(id) {
  const liked = getLikedPostIds();
  liked.push(id);
  localStorage.setItem('liked_posts', JSON.stringify(liked));
}

function postCardHTML(p, allowDelete) {
  const embed   = youtubeEmbed(p.video_url);
  const tag     = isKovaaksPost(p) ? '<span class="post-tag">kovaaks</span>' : '';
  const liked   = hasLiked(p.id);
  const likeCount = p.likes || 0;
  return `
    <div class="post-header">
      <span class="post-title">${esc(p.title)}${tag}</span>
      <span class="post-time">${formatDate(p.created_at)}</span>
    </div>
    <div class="post-text">${esc(p.text)}</div>
    ${embed ? `<div class="post-video"><iframe src="${embed}" allowfullscreen></iframe></div>` : ''}
    <div class="post-actions">
      <button class="post-like-btn ${liked ? 'liked' : ''}" onclick="likePost('${p.id}', this)" ${liked ? 'disabled' : ''}>
        <svg viewBox="0 0 24 24" fill="${liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span class="post-like-count">${likeCount}</span>
      </button>
      ${allowDelete ? `<button class="delete-btn" onclick="askDelete('${p.id}','posts')">✕ delete</button>` : ''}
    </div>`;
}

async function likePost(id, btnEl) {
  if (hasLiked(id)) return;
  markLiked(id);
  btnEl.classList.add('liked');
  btnEl.disabled = true;
  btnEl.querySelector('svg').setAttribute('fill', 'currentColor');
  const countEl   = btnEl.querySelector('.post-like-count');
  const newCount  = parseInt(countEl.textContent, 10) + 1;
  countEl.textContent = newCount;
  try {
    await api(`posts?id=eq.${id}`, { method: 'PATCH', prefer: 'return=minimal', body: JSON.stringify({ likes: newCount }) });
    const cached = (window._lastPosts || []).find(p => p.id === id);
    if (cached) cached.likes = newCount;
  } catch { /* local like persists even if sync fails */ }
}

let currentPostFilter = 'all';
function setPostFilter(filter) {
  currentPostFilter = filter;
  document.querySelectorAll('.tag-filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.filter === filter)
  );
  renderPosts(window._lastPosts || []);
}

function renderPosts(posts) {
  const list  = document.getElementById('posts-list');
  const empty = document.getElementById('no-posts');
  list.querySelectorAll('.post-card').forEach(c => c.remove());

  const filtered = currentPostFilter === 'kovaaks'
    ? (posts || []).filter(isKovaaksPost)
    : (posts || []);

  if (!filtered.length) {
    empty.textContent = currentPostFilter === 'kovaaks' ? 'no kovaaks posts yet' : 'no posts yet';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  filtered.forEach(p => {
    const el = document.createElement('div');
    el.className = 'post-card';
    el.innerHTML = postCardHTML(p, postsUnlocked);
    list.appendChild(el);
  });
}

function renderKovaaksVods(posts) {
  const grid = document.getElementById('vod-grid');
  const vods = (posts || []).filter(p => isKovaaksPost(p) && youtubeId(p.video_url));
  grid.innerHTML = '';
  if (vods.length === 0) {
    grid.innerHTML = '<div class="vod-empty">no kovaaks vods yet — post one tagged "kovaaks" from the Posts tab</div>';
    return;
  }
  vods.forEach(p => {
    const thumb = youtubeThumb(p.video_url);
    const embed = youtubeEmbed(p.video_url);
    const card  = document.createElement('div');
    card.className = 'vod-card';
    card.onclick = () => openVodPlayer(embed);
    card.innerHTML = `
      <div class="vod-thumb">
        <img src="${thumb}" alt="${esc(p.title)}">
        <span class="vod-date">${formatDate(p.created_at)}</span>
      </div>
      <div class="vod-title">${esc(p.title)}</div>`;
    grid.appendChild(card);
  });
}

function openVodPlayer(embedUrl) {
  document.getElementById('vod-player-frame').innerHTML =
    `<iframe src="${embedUrl}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  document.getElementById('vod-player-overlay').classList.add('open');
}
function closeVodPlayer() {
  document.getElementById('vod-player-overlay').classList.remove('open');
  document.getElementById('vod-player-frame').innerHTML = '';
}

async function submitPost() {
  if (!postsUnlocked) { showToast('unlock with pin first'); return; }
  const title     = document.getElementById('post-title').value.trim();
  const text      = document.getElementById('post-text').value.trim();
  const video_url = document.getElementById('post-video').value.trim();
  if (!title) { document.getElementById('post-title').focus(); return; }
  if (!text)  { document.getElementById('post-text').focus();  return; }

  const btn = document.querySelector('.post-submit-btn');
  btn.textContent = 'posting...';
  btn.disabled = true;

  try {
    await api('posts', { method: 'POST', prefer: 'return=minimal', body: JSON.stringify({ title, text, video_url: video_url || null }) });
    document.getElementById('post-title').value = '';
    document.getElementById('post-text').value  = '';
    document.getElementById('post-video').value = '';
    await loadPosts();
    showToast('posted ✓');
  } catch { showToast('failed to post, try again'); }

  btn.textContent = 'post';
  btn.disabled = false;
}

/* ── kovaaks scores ── */
/* ── Kovaaks live API fetch (3-tier: direct → proxy → manual Supabase) ── */

const KOVAAKS_API_BASE  = 'https://kovaaks.com/webapp-backend';
const ALLORIGINS_PROXY  = 'https://api.allorigins.win/raw?url=';
const CORS_SH_PROXY     = 'https://corsproxy.io/?';

async function fetchKovaaksScores() {
  const endpoint = `${KOVAAKS_API_BASE}/user/profile/${KOVAAKS_USERNAME}/scores/recent`;

  // Attempt 1: direct (works if Kovaaks ever sets CORS headers)
  try {
    const r = await fetch(endpoint, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    const arr  = Array.isArray(data) ? data : (data.scores || data.data || []);
    if (arr.length) return { scores: arr, source: 'live' };
    throw new Error('empty');
  } catch { /* try proxy */ }

  // Attempt 2: allorigins proxy
  try {
    const r = await fetch(ALLORIGINS_PROXY + encodeURIComponent(endpoint), {
      signal: AbortSignal.timeout(7000),
    });
    if (!r.ok) throw new Error(`proxy HTTP ${r.status}`);
    const data = await r.json();
    const arr  = Array.isArray(data) ? data : (data.scores || data.data || []);
    if (arr.length) return { scores: arr, source: 'live' };
    throw new Error('empty');
  } catch { /* try second proxy */ }

  // Attempt 3: corsproxy.io
  try {
    const r = await fetch(CORS_SH_PROXY + encodeURIComponent(endpoint), {
      signal: AbortSignal.timeout(7000),
    });
    if (!r.ok) throw new Error(`proxy2 HTTP ${r.status}`);
    const data = await r.json();
    const arr  = Array.isArray(data) ? data : (data.scores || data.data || []);
    if (arr.length) return { scores: arr, source: 'live' };
    throw new Error('empty');
  } catch { /* fall through to manual */ }

  return null;
}

function renderLiveScores(scores) {
  const grid = document.getElementById('highscore-grid');
  grid.innerHTML = '';
  // API returns most recent plays — deduplicate by scenarioName, keep best score
  const best = {};
  scores.forEach(s => {
    const name = s.scenarioName || s.name;
    if (!best[name] || s.score > best[name].score) best[name] = s;
  });
  const deduped = Object.values(best).slice(0, 6);
  deduped.forEach(s => {
    const card = document.createElement('div');
    card.className = 'highscore-card';
    const ts = s.timestamp || s.date || s.created_at;
    card.innerHTML = `
      <div class="highscore-date">${ts ? formatDate(ts) : ''}</div>
      <div class="highscore-name">${esc(s.scenarioName || s.name || 'scenario')}</div>
      <div class="highscore-score">${Number(s.score).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
      ${s.attributes?.accuracy != null ? `<div class="highscore-accuracy">${(s.attributes.accuracy * 100).toFixed(1)}% acc</div>` : ''}`;
    grid.appendChild(card);
  });
}

async function loadKovaaksHighscores() {
  const grid       = document.getElementById('highscore-grid');
  const profileUrl = `https://kovaaks.com/kovaaks/profile?username=${KOVAAKS_USERNAME}`;

  // loading state
  grid.innerHTML = `
    <div class="highscore-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="animation:spin 1s linear infinite">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      fetching live scores...
    </div>`;

  // try live API first
  const result = await fetchKovaaksScores();
  if (result) {
    renderLiveScores(result.scores);
    // update live indicator
    const badge = document.getElementById('kovaaks-live-badge');
    if (badge) { badge.style.display = 'inline-flex'; }
    return;
  }

  // fall back to manual Supabase scores
  try {
    const r = await api('kovaaks_scores?select=*&order=score_date.desc&limit=6');
    const scores = await r.json();
    window._lastScores = Array.isArray(scores) ? scores : [];
    if (window._lastScores.length === 0) throw new Error('empty');
    renderHighscores(window._lastScores);
    const badge = document.getElementById('kovaaks-live-badge');
    if (badge) { badge.style.display = 'none'; }
  } catch {
    window._lastScores = [];
    grid.innerHTML = `
      <div class="highscore-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/>
          <path d="M5 4H3v2a4 4 0 0 0 4 4M19 4h2v2a4 4 0 0 1-4 4"/>
        </svg>
        couldn't load live scores —
        <a href="${profileUrl}" target="_blank" rel="noopener">view on Kovaaks →</a>
      </div>`;
  }
}

function renderHighscores(scores) {
  const grid = document.getElementById('highscore-grid');
  grid.innerHTML = '';
  scores.forEach(s => {
    const card = document.createElement('div');
    card.className = 'highscore-card';
    card.innerHTML = `
      <div class="highscore-date">${s.score_date ? formatDate(s.score_date) : ''}</div>
      <div class="highscore-name">${esc(s.scenario)}</div>
      <div class="highscore-score">${esc(s.score)}</div>
      ${s.accuracy ? `<div class="highscore-accuracy">${esc(s.accuracy)} acc</div>` : ''}
      ${scoresUnlocked ? `<button class="delete-btn" onclick="askDelete('${s.id}','kovaaks_scores')" style="margin-top:6px;">✕</button>` : ''}`;
    grid.appendChild(card);
  });
}

function unlockScores() {
  const val = document.getElementById('score-pin-input').value;
  const msg = document.getElementById('score-pin-msg');
  if (val === POST_PIN) {
    scoresUnlocked = true;
    document.getElementById('score-pin-gate').style.display = 'none';
    document.getElementById('score-unlocked-badge').style.display = 'inline-flex';
    document.getElementById('score-form').classList.add('unlocked');
    msg.textContent = '';
    if (window._lastScores) renderHighscores(window._lastScores);
  } else {
    msg.textContent = 'wrong pin';
  }
  document.getElementById('score-pin-input').value = '';
}

async function submitScore() {
  if (!scoresUnlocked) { showToast('unlock with pin first'); return; }
  const scenario  = document.getElementById('score-scenario').value.trim();
  const score     = document.getElementById('score-value').value.trim();
  const accuracy  = document.getElementById('score-accuracy').value.trim();
  const score_date = document.getElementById('score-date').value || new Date().toISOString().slice(0, 10);
  if (!scenario) { document.getElementById('score-scenario').focus(); return; }
  if (!score)    { document.getElementById('score-value').focus();    return; }

  const btn = document.querySelector('#score-form .post-submit-btn');
  btn.textContent = 'adding...';
  btn.disabled = true;

  try {
    await api('kovaaks_scores', { method: 'POST', prefer: 'return=minimal', body: JSON.stringify({ scenario, score, accuracy: accuracy || null, score_date }) });
    document.getElementById('score-scenario').value = '';
    document.getElementById('score-value').value    = '';
    document.getElementById('score-accuracy').value = '';
    document.getElementById('score-date').value     = '';
    showToast('score added ✓');
    await loadKovaaksHighscores();
  } catch { showToast('failed to add score'); }

  btn.textContent = 'add score';
  btn.disabled = false;
}

/* ── delete modal ── */
function askDelete(id, table) {
  pendingDeleteId    = id;
  pendingDeleteTable = table;
  document.getElementById('pin-input').value        = '';
  document.getElementById('pin-error').textContent  = '';
  document.getElementById('delete-modal-text').textContent =
    (table === 'posts' || table === 'kovaaks_scores') ? 'enter post pin to confirm' : 'enter pin to confirm';
  document.getElementById('delete-modal').classList.add('open');
  setTimeout(() => document.getElementById('pin-input').focus(), 80);
}

function closeModal() {
  pendingDeleteId    = null;
  pendingDeleteTable = null;
  document.getElementById('delete-modal').classList.remove('open');
}

async function confirmDelete() {
  const entered    = document.getElementById('pin-input').value;
  const correctPin = (pendingDeleteTable === 'posts' || pendingDeleteTable === 'kovaaks_scores') ? POST_PIN : DELETE_PIN;
  if (entered !== correctPin) {
    document.getElementById('pin-error').textContent = 'wrong pin';
    document.getElementById('pin-input').value = '';
    document.getElementById('pin-input').focus();
    return;
  }
  try {
    await api(`${pendingDeleteTable}?id=eq.${pendingDeleteId}`, { method: 'DELETE' });
    if (pendingDeleteTable === 'posts') await loadPosts();
    else if (pendingDeleteTable === 'kovaaks_scores') await loadKovaaksHighscores();
    else await loadComments();
    showToast('deleted');
  } catch { showToast('delete failed'); }
  closeModal();
}

/* ── routine log ── */
async function saveRoutineCompletion() {
  try {
    await api('routine_log', { method: 'POST', prefer: 'return=minimal', body: JSON.stringify({ completed_at: new Date().toISOString() }) });
    loadLastRoutineCompletion();
  } catch { /* non-critical */ }
}

async function loadLastRoutineCompletion() {
  const el = document.getElementById('routine-last-completed');
  try {
    const r    = await api('routine_log?select=completed_at&order=completed_at.desc&limit=1');
    const data = await r.json();
    if (data && data.length > 0) {
      const d = new Date(data[0].completed_at);
      el.textContent = `last completed: ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      el.textContent = '';
    }
  } catch { el.textContent = ''; }
}

/* ── discord copy ── */
function copyDiscord() {
  navigator.clipboard.writeText('kuki071').then(() => {
    const tip     = document.getElementById('discord-tip');
    const rowName = document.getElementById('discord-row-name');
    if (tip)     { tip.textContent     = 'copied! ✓'; setTimeout(() => tip.textContent     = 'Discord', 2000); }
    if (rowName) { rowName.textContent = 'copied ✓';  setTimeout(() => rowName.textContent = 'Discord', 2000); }
  });
}

/* ── sync view count to both elements ── */
function syncViewCount(n) {
  ['view-count','view-count-2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = Number(n).toLocaleString();
  });
}

/* ── latest post for home tab ── */
function loadLatestPost() {
  const wrap = document.getElementById('latest-post-card');
  if (!wrap) return;
  const posts = window._lastPosts;
  if (posts && posts.length > 0) {
    renderLatestPostCard(posts);
    return;
  }
  api('posts?select=*&order=created_at.desc&limit=1')
    .then(r => r.json())
    .then(data => {
      window._lastPosts = Array.isArray(data) ? data : [];
      renderLatestPostCard(window._lastPosts);
    })
    .catch(() => { wrap.innerHTML = '<div class="no-posts">no posts yet</div>'; });
}
