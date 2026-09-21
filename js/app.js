// discord click-to-copy
  const discordItem = document.getElementById('discord-copy');
  if (discordItem) {
    discordItem.addEventListener('click', () => {
      const handle = discordItem.dataset.handle;
      const handleEl = discordItem.querySelector('.social-handle');
      const original = handleEl.textContent;
      navigator.clipboard?.writeText(handle).catch(() => {});
      handleEl.textContent = 'copied!';
      handleEl.classList.add('copied');
      setTimeout(() => {
        handleEl.textContent = original;
        handleEl.classList.remove('copied');
      }, 1200);
    });
  }

  // tabs
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  const indicator = document.getElementById('tabIndicator');

  function moveIndicator(tab) {
    if (!indicator || !tab) return;
    indicator.style.left = tab.offsetLeft + 'px';
    indicator.style.width = tab.offsetWidth + 'px';
  }

  const initialTab = document.querySelector('.tab.active');
  requestAnimationFrame(() => moveIndicator(initialTab));
  window.addEventListener('resize', () => moveIndicator(document.querySelector('.tab.active')));

  function activateTab(panelName) {
    const tab = Array.from(tabs).find(t => t.dataset.panel === panelName);
    if (!tab) return;
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(panelName).classList.add('active');
    moveIndicator(tab);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.dataset.panel));
  });

  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.goto));
  });

  // ==================================================================
  // Supabase backend: posts, comments, live status
  // ==================================================================
  const SUPABASE_URL = 'https://lizqrjwssbulvhwrjefb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpenFyandzc2J1bHZod3JqZWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTU1MDAsImV4cCI6MjA5NzM5MTUwMH0.saaxPRy436i_abIU4Ea1MH9-4oGbl5XuS76PUFg4FZE';
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // pin only lives in memory + sessionStorage on THIS device; the real
  // gate is server-side (see the SQL functions) so this is just so you
  // don't have to retype the pin on every single click this session.
  let adminPin = sessionStorage.getItem('kuki_admin_pin') || null;
  function isAdmin() { return !!adminPin; }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str == null ? '' : String(str);
    return d.innerHTML;
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ---------- admin unlock: click top-right corner 3x, then enter pin ----------
  function setupCornerUnlock(zoneId, onUnlock) {
    const zone = document.getElementById(zoneId);
    if (!zone) return;
    let clicks = 0;
    let resetTimer = null;
    zone.addEventListener('click', () => {
      clicks++;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { clicks = 0; }, 1800);
      if (clicks >= 3) {
        clicks = 0;
        if (isAdmin()) {
          if (confirm('log out of admin?')) {
            adminPin = null;
            sessionStorage.removeItem('kuki_admin_pin');
            renderAll();
          } else if (onUnlock) {
            onUnlock();
          }
          return;
        }
        const entered = window.prompt('pin:');
        if (entered === null) return;
        adminPin = entered.trim();
        sessionStorage.setItem('kuki_admin_pin', adminPin);
        // we don't know yet if it's right — the next real action (posting,
        // deleting, setting status) is what actually gets checked server-side.
        renderAll();
        if (onUnlock) onUnlock();
      }
    });
  }

  setupCornerUnlock('adminUnlockZone');
  setupCornerUnlock('adminUnlockZoneLeft', () => {
    activateTab('posts');
    setTimeout(() => {
      const t = document.getElementById('newPostTitle');
      if (t) t.focus();
    }, 60);
  });

  function renderAll() {
    renderAdminStatusForm();
    renderAdminPostForm();
    loadPosts();
    loadComments();
  }

  async function handlePinError(error) {
    if (error && /pin/i.test(error.message || '')) {
      alert('wrong pin');
      adminPin = null;
      sessionStorage.removeItem('kuki_admin_pin');
      renderAll();
      return true;
    }
    return false;
  }

  // ---------- posts ----------
  async function loadPosts() {
    const list = document.getElementById('postsList');
    if (!list) return;
    const { data, error } = await sb.from('posts').select('*').order('created_at', { ascending: false });
    if (error) {
      list.innerHTML = '<div class="empty">couldn\'t load posts</div>';
      return;
    }
    if (!data || data.length === 0) {
      list.innerHTML = '<div class="empty">no posts yet</div>';
      return;
    }
    list.innerHTML = data.map(p => `
      <div class="post-card" data-id="${p.id}">
        <div class="post-title">
          <span>${escapeHtml(p.title)}</span>
          ${p.tag ? `<span class="tag">${escapeHtml(p.tag)}</span>` : ''}
          ${isAdmin() ? `<button class="admin-delete" data-delete-post="${p.id}" style="margin-left:auto;">delete</button>` : ''}
        </div>
        <div class="post-date">${formatDate(p.created_at)}</div>
        ${renderVideoEmbed(p.video_url)}
        <div class="post-body">${escapeHtml(p.body)}</div>
      </div>
    `).join('');
    list.querySelectorAll('[data-delete-post]').forEach(btn => {
      btn.addEventListener('click', () => deletePost(btn.dataset.deletePost));
    });
  }

  function renderVideoEmbed(url) {
    if (!url) return '';
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    if (yt) {
      return `<div class="post-video"><iframe src="https://www.youtube.com/embed/${yt[1]}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    }
    return `<div class="post-video"><video src="${escapeHtml(url)}" controls preload="metadata"></video></div>`;
  }

  async function createPost(title, videoUrl, body) {
    const { error } = await sb.rpc('create_post', {
      p_pin: adminPin, p_title: title, p_video_url: videoUrl || null, p_body: body
    });
    if (error) {
      if (await handlePinError(error)) return;
      alert('failed to post: ' + error.message);
      return;
    }
    loadPosts();
  }

  async function deletePost(id) {
    if (!confirm('delete this post?')) return;
    const { error } = await sb.rpc('delete_post', { p_pin: adminPin, p_id: id });
    if (error) {
      if (await handlePinError(error)) return;
      alert('failed to delete: ' + error.message);
      return;
    }
    loadPosts();
  }

  function renderAdminPostForm() {
    const el = document.getElementById('adminPostForm');
    if (!el) return;
    if (!isAdmin()) { el.innerHTML = ''; return; }
    el.innerHTML = `
      <div class="admin-block">
        <div class="admin-block-label">new post (admin)</div>
        <div class="form-row">
          <input class="form-input" id="newPostTitle" type="text" placeholder="title" maxlength="120">
          <input class="form-input" id="newPostVideo" type="text" placeholder="video URL (optional — YouTube link or direct video file)" maxlength="500">
          <textarea class="form-textarea" id="newPostBody" placeholder="description..." maxlength="2000"></textarea>
          <button class="form-submit" id="newPostSubmit" type="button">post</button>
        </div>
      </div>
    `;
    document.getElementById('newPostSubmit').addEventListener('click', () => {
      const title = document.getElementById('newPostTitle').value.trim();
      const videoUrl = document.getElementById('newPostVideo').value.trim();
      const body = document.getElementById('newPostBody').value.trim();
      if (!title || !body) { alert('title and description are required'); return; }
      createPost(title, videoUrl, body);
      document.getElementById('newPostTitle').value = '';
      document.getElementById('newPostVideo').value = '';
      document.getElementById('newPostBody').value = '';
    });
  }

  // ---------- comments (open to everyone) ----------
  async function loadComments() {
    const list = document.getElementById('commentsList');
    if (!list) return;
    const { data, error } = await sb.from('comments').select('*').order('created_at', { ascending: false });
    if (error) {
      list.innerHTML = '<div class="empty">couldn\'t load comments</div>';
      return;
    }
    if (!data || data.length === 0) {
      list.innerHTML = '<div class="empty">no comments yet</div>';
      return;
    }
    list.innerHTML = data.map(c => `
      <div class="comment-card" data-id="${c.id}">
        <div class="comment-head">
          <span class="comment-name">${escapeHtml(c.name)}</span>
          <span class="comment-date">${formatDate(c.created_at)}</span>
        </div>
        <div class="comment-body">${escapeHtml(c.comment)}</div>
        ${isAdmin() ? `<button class="admin-delete" data-delete-comment="${c.id}" style="margin-top:8px;">delete</button>` : ''}
      </div>
    `).join('');
    list.querySelectorAll('[data-delete-comment]').forEach(btn => {
      btn.addEventListener('click', () => deleteComment(btn.dataset.deleteComment));
    });
  }

  async function submitComment(name, comment) {
    const { error } = await sb.from('comments').insert({ name, comment });
    if (error) {
      alert('failed to post comment: ' + error.message);
      return;
    }
    loadComments();
  }

  async function deleteComment(id) {
    if (!confirm('delete this comment?')) return;
    const { error } = await sb.rpc('delete_comment', { p_pin: adminPin, p_id: id });
    if (error) {
      if (await handlePinError(error)) return;
      alert('failed to delete: ' + error.message);
      return;
    }
    loadComments();
  }

  function renderCommentForm() {
    const el = document.getElementById('commentForm');
    if (!el) return;
    el.innerHTML = `
      <div class="form-row">
        <input class="form-input" id="commentName" type="text" placeholder="your name" maxlength="40">
        <textarea class="form-textarea" id="commentBody" placeholder="say something..." maxlength="500"></textarea>
        <button class="form-submit" id="commentSubmit" type="button">comment</button>
      </div>
    `;
    document.getElementById('commentSubmit').addEventListener('click', () => {
      const name = document.getElementById('commentName').value.trim();
      const comment = document.getElementById('commentBody').value.trim();
      if (!name || !comment) { alert('name and comment are both required'); return; }
      submitComment(name, comment);
      document.getElementById('commentBody').value = '';
    });
  }

  // ---------- live status (discord-style) ----------
  const STATUS_PRESETS = {
    vscode:   { label: 'Visual Studio Code', icon: 'https://www.google.com/s2/favicons?domain=code.visualstudio.com&sz=64' },
    cs2:      { label: 'Counter-Strike 2',    icon: 'https://www.google.com/s2/favicons?domain=counter-strike.net&sz=64' },
    kovaaks:  { label: 'Kovaaks',             icon: 'https://www.google.com/s2/favicons?domain=kovaaks.com&sz=64' },
    quakelive:{ label: 'Quake Live',          icon: 'https://www.google.com/s2/favicons?domain=quakelive.com&sz=64' },
    aimlabs:  { label: 'Aim Lab',             icon: 'https://www.google.com/s2/favicons?domain=aimlab.gg&sz=64' },
    sleeping: { label: 'Sleeping',            icon: '' },
    custom:   { label: '',                    icon: '' }
  };

  let statusStartedAt = null;

  function formatElapsed(startedAtIso) {
    const ms = Date.now() - new Date(startedAtIso).getTime();
    const mins = Math.max(0, Math.floor(ms / 60000));
    if (mins < 60) return mins + 'm';
    const hrs = Math.floor(mins / 60);
    return hrs + 'h ' + (mins % 60) + 'm';
  }

  function renderStatus(row) {
    const pill = document.getElementById('statusPill');
    if (!pill) return;
    if (!row || !row.icon_key || row.icon_key === 'offline' || !row.label) {
      pill.style.display = 'none';
      statusStartedAt = null;
      return;
    }
    const preset = STATUS_PRESETS[row.icon_key] || {};
    document.getElementById('statusIcon').src = row.icon_url || preset.icon || '';
    document.getElementById('statusIcon').style.display = (row.icon_url || preset.icon) ? 'block' : 'none';
    document.getElementById('statusLabel').textContent = row.label;
    statusStartedAt = row.started_at;
    document.getElementById('statusTime').textContent = formatElapsed(statusStartedAt);
    pill.style.display = 'flex';
  }

  async function loadStatus() {
    const { data, error } = await sb.from('status').select('*').eq('id', 1).maybeSingle();
    if (error) return;
    renderStatus(data);
  }

  async function setStatus(label, iconKey) {
    const { error } = await sb.rpc('set_status', { p_pin: adminPin, p_label: label, p_icon_key: iconKey });
    if (error) {
      if (await handlePinError(error)) return;
      alert('failed to set status: ' + error.message);
      return;
    }
    loadStatus();
  }

  function renderAdminStatusForm() {
    const el = document.getElementById('adminStatusForm');
    if (!el) return;
    if (!isAdmin()) { el.innerHTML = ''; return; }
    const options = Object.keys(STATUS_PRESETS).map(key =>
      `<option value="${key}">${STATUS_PRESETS[key].label || 'custom...'}</option>`
    ).join('');
    el.innerHTML = `
      <div class="admin-block">
        <div class="admin-block-label">set status (admin)</div>
        <div class="form-row">
          <select class="admin-select" id="statusPreset">${options}<option value="offline">offline / clear</option></select>
          <input class="form-input" id="statusLabelInput" type="text" placeholder="status text (e.g. Playing Counter-Strike 2)" maxlength="60">
          <button class="form-submit" id="statusSubmit" type="button">update status</button>
        </div>
      </div>
    `;
    const presetSelect = document.getElementById('statusPreset');
    const labelInput = document.getElementById('statusLabelInput');
    presetSelect.addEventListener('change', () => {
      const preset = STATUS_PRESETS[presetSelect.value];
      if (preset && preset.label) labelInput.value = preset.label;
    });
    document.getElementById('statusSubmit').addEventListener('click', () => {
      const iconKey = presetSelect.value;
      if (iconKey === 'offline') { setStatus('', 'offline'); return; }
      const label = labelInput.value.trim();
      if (!label) { alert('add status text first'); return; }
      setStatus(label, iconKey);
    });
  }

  // ---------- init ----------
  renderCommentForm();
  renderAdminPostForm();
  renderAdminStatusForm();
  loadPosts();
  loadComments();
  loadStatus();
  setInterval(() => {
    if (statusStartedAt) document.getElementById('statusTime').textContent = formatElapsed(statusStartedAt);
  }, 30000);
  setInterval(loadStatus, 90000);
