/* tabs.js — all tab content as JS strings, no fetch/404 issues on GitHub Pages */

const TABS = {

home: `
<div class="section-title">about</div>
<div class="card home-about">
  i'm kuki — developer, gamer, and someone who spends way too much time in CS2 and Kovaaks.
  i like story games a lot, especially Wolfenstein.
  coding is my escape check out my github.
</div>
<div class="section-title" style="margin-top:16px">latest post</div>
<div class="posts-list" id="latest-post-card">
  <div class="no-posts">loading...</div>
</div>
`,

kovaaks: `
<div class="section-title">recent highscores</div>
<div class="live-badge" id="kovaaks-live-badge">
  <span class="live-dot"></span>
  live from kovaaks.com
</div>
<div class="pin-gate" id="score-pin-gate">
  <input type="password" id="score-pin-input" placeholder="pin to update scores" maxlength="12">
  <button class="btn btn-primary" onclick="unlockScores()">unlock</button>
</div>
<div class="pin-msg" id="score-pin-msg"></div>
<div class="unlocked-badge" id="score-unlocked-badge">✓ unlocked</div>
<div class="score-form" id="score-form">
  <input type="text" id="score-scenario" placeholder="scenario name">
  <div class="form-row-2">
    <input type="text" id="score-value" placeholder="score (e.g. 1259.43)">
    <input type="text" id="score-accuracy" placeholder="accuracy (e.g. 34.2%)">
  </div>
  <input type="date" id="score-date">
  <button class="btn btn-primary" onclick="submitScore()">add score</button>
</div>
<div class="hs-grid" id="highscore-grid">
  <div class="hs-empty">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="animation:spin 1s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
    loading...
  </div>
</div>
<div class="section-title" style="margin-top:20px">vods</div>
<div class="vod-grid" id="vod-grid">
  <div class="vod-empty">no kovaaks vods yet</div>
</div>
`,

pc: `
<div class="pc-block">
  <div class="section-title">studio pc</div>
  <div class="spec-rows" id="studio-pc-rows"></div>
</div>
<div class="pc-block">
  <div class="section-title">gaming pc</div>
  <div class="spec-rows" id="gaming-pc-rows"></div>
</div>
<div class="section-title">peripherals</div>
<div class="gear-grid">
  <div class="card gear-card"><div class="g-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="2" width="12" height="20" rx="6"/><line x1="12" y1="6" x2="12" y2="10"/></svg></div><div><div class="g-label">Mouse</div><div class="g-val">Razer DeathAdder V4 Pro</div><div class="g-sub">1000Hz · raw input</div></div></div>
  <div class="card gear-card"><div class="g-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/></svg></div><div><div class="g-label">Keyboard</div><div class="g-val">MageGee MK Star 61</div></div></div>
  <div class="card gear-card"><div class="g-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div><div><div class="g-label">Monitor</div><div class="g-val">ASUS ROG Swift</div><div class="g-sub">360Hz · 24.5"</div></div></div>
  <div class="card gear-card"><div class="g-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg></div><div><div class="g-label">Headset</div><div class="g-val">EIMS</div></div></div>
</div>
<div class="section-title">mouse settings</div>
<div class="gear-grid">
  <div class="card gear-card"><div class="g-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="6"/><line x1="12" y1="6" x2="12" y2="10"/></svg></div><div><div class="g-label">DPI</div><div class="g-val">800</div></div></div>
  <div class="card gear-card"><div class="g-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg></div><div><div class="g-label">Sensitivity</div><div class="g-val">1.7</div></div></div>
  <div class="card gear-card"><div class="g-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg></div><div><div class="g-label">eDPI</div><div class="g-val">1360</div></div></div>
  <div class="card gear-card"><div class="g-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div><div><div class="g-label">Zoom Sens</div><div class="g-val">1.3</div></div></div>
</div>
<div class="section-title">crosshair</div>
<div class="gear-grid">
  <div class="card gear-card"><div class="g-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/></svg></div><div><div class="g-label">Style</div><div class="g-val">4 — classic static</div></div></div>
  <div class="card gear-card"><div class="g-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></div><div><div class="g-label">Size</div><div class="g-val">2</div></div></div>
  <div class="card gear-card"><div class="g-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/></svg></div><div><div class="g-label">Thickness</div><div class="g-val">0.5</div></div></div>
  <div class="card gear-card"><div class="g-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="4" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="20"/></svg></div><div><div class="g-label">Gap</div><div class="g-val">-3</div></div></div>
</div>
<div class="section-title">video</div>
<div class="gear-grid">
  <div class="card gear-card"><div class="g-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/></svg></div><div><div class="g-label">Resolution</div><div class="g-val">1440×1080 stretched</div></div></div>
  <div class="card gear-card"><div class="g-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="1"/></svg></div><div><div class="g-label">Aspect Ratio</div><div class="g-val">4:3</div></div></div>
  <div class="card gear-card"><div class="g-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></div><div><div class="g-label">Refresh Rate</div><div class="g-val">360 Hz</div></div></div>
  <div class="card gear-card"><div class="g-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg></div><div><div class="g-label">Brightness</div><div class="g-val">89%</div></div></div>
</div>
`,

posts: `
<div class="section-title">add post</div>
<div class="pin-gate" id="post-pin-gate">
  <input type="password" id="post-pin-input" placeholder="pin to post" maxlength="12">
  <button class="btn btn-primary" onclick="unlockPosts()">unlock</button>
</div>
<div class="pin-msg" id="post-pin-msg"></div>
<div class="unlocked-badge" id="post-unlocked-badge">✓ unlocked</div>
<div class="post-form" id="post-form">
  <input type="text" id="post-title" placeholder="title">
  <textarea id="post-text" placeholder="what's on your mind..."></textarea>
  <input type="text" id="post-video" placeholder="youtube link (optional)">
  <button class="btn btn-primary" onclick="submitPost()">post</button>
</div>
<div class="section-title" style="margin-top:20px">feed</div>
<div class="tag-filter">
  <button class="tag-btn active" data-filter="all" onclick="setPostFilter('all')">all</button>
  <button class="tag-btn" data-filter="kovaaks" onclick="setPostFilter('kovaaks')">kovaaks</button>
</div>
<div class="posts-list" id="posts-list">
  <div class="no-posts" id="no-posts">no posts yet</div>
</div>
`,

routine: `
<div class="card routine-hd" style="margin-bottom:10px">
  <div>
    <span class="routine-total-num" id="routine-total-time">3h 15m</span>
    <span class="routine-total-label">total session</span>
  </div>
  <button class="play-btn" id="routine-play-btn" onclick="toggleRoutine()">
    <svg id="play-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
    <span id="play-label">play</span>
  </button>
</div>
<div class="routine-last" id="routine-last-completed"></div>
<div class="routine-list" id="routine-list">
  <div class="routine-item" data-mins="60"><div class="routine-bar"></div><div class="ri-info"><div class="ri-name">Kovaaks</div><div class="ri-dur">60 min</div></div><div class="ri-check">○</div></div>
  <div class="routine-item" data-mins="30"><div class="routine-bar"></div><div class="ri-info"><div class="ri-name">Aim Labs</div><div class="ri-dur">30 min</div></div><div class="ri-check">○</div></div>
  <div class="routine-item" data-mins="30"><div class="routine-bar"></div><div class="ri-info"><div class="ri-name">3D Aim Trainer</div><div class="ri-dur">30 min</div></div><div class="ri-check">○</div></div>
  <div class="routine-item" data-mins="60"><div class="routine-bar"></div><div class="ri-info"><div class="ri-name">Deathmatch</div><div class="ri-dur">60 min</div></div><div class="ri-check">○</div></div>
  <div class="routine-item" data-mins="15"><div class="routine-bar"></div><div class="ri-info"><div class="ri-name">DDNet</div><div class="ri-dur">15 min</div></div><div class="ri-check">○</div></div>
</div>
<div class="routine-clock" id="routine-clock" style="display:none">
  <div class="rc-label" id="routine-clock-label">Kovaaks</div>
  <div class="rc-time" id="routine-clock-time">60:00</div>
  <div class="rc-sub" id="routine-clock-sub">block 1 of 5</div>
</div>
`,

comments: `
<div class="section-title">leave a comment</div>
<div class="comment-form">
  <input type="text" id="comment-name" placeholder="your username" maxlength="30">
  <textarea id="comment-text" placeholder="leave a comment..."></textarea>
  <button class="btn btn-outline" onclick="submitComment()">post comment</button>
</div>
<div class="comments-list" id="comments-list">
  <div class="no-comments" id="no-comments">no comments yet — be the first!</div>
</div>
`,

socials: `
<div class="section-title">find me</div>
<div class="socials-grid">
  <a class="social-row" href="https://www.youtube.com/@Kuki_tech" target="_blank" rel="noopener"><span class="s-icon" style="color:#FF0000"><svg viewBox="0 0 576 512" fill="currentColor"><path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"/></svg></span><span><div class="s-name">YouTube</div><div class="s-handle">Kuki_tech</div></span></a>
  <a class="social-row" href="https://steamcommunity.com/profiles/76561198782715700/" target="_blank" rel="noopener"><span class="s-icon" style="color:#9fb3c1"><svg viewBox="0 0 496 512" fill="currentColor"><path d="M496 256c0 137-111.2 248-248.4 248-113.8 0-209.7-75.2-239-180.4l95.2 39.3c6.4 32.1 34.9 56.4 68.9 56.4 38.1 0 69.1-29.8 69.1-67.9 0-3.7-.4-7.4-.9-10.9l-81.3-61.5c-8.1.8-16.3 1.3-24.6 1.3-28.3 0-54.8-8.6-76.9-23.4L0 174.8v-13.4C14.5 73.9 87.8 8 176.9 8 280.4 8 366.3 82.9 391 182.1l-170.3-70.3c-35.4-3.4-65.3 21.6-65.3 57.1 0 31.5 25.7 57.1 57.1 57.1 3.1 0 6.1-.3 9.1-.8l161.7 117.3c.5 3.4.8 6.9.8 10.5 0 37.5-30.3 68-67.8 68-33.5 0-61.5-23.1-67.1-54.7L147 313.4C163.7 399.5 240.1 464 332.6 464 431 464 512 384.8 512 288c0-11.1-1.1-21.9-3.2-32.4L496 256z"/></svg></span><span><div class="s-name">Steam</div><div class="s-handle">kuki0771</div></span></a>
  <a class="social-row" href="https://kovaaks.com/kovaaks/profile?username=kuki0771" target="_blank" rel="noopener"><span class="s-icon" style="color:#ff6b1a"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/></svg></span><span><div class="s-name">Kovaaks</div><div class="s-handle">kuki0771</div></span></a>
  <button class="social-row" onclick="copyDiscord()"><span class="s-icon" style="color:#5865F2"><svg viewBox="0 0 640 512" fill="currentColor"><path d="M524.5 69.8a1.5 1.5 0 0 0-.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0-1.9.9 337.5 337.5 0 0 0-14.9 30.6 447.8 447.8 0 0 0-134.4 0 309.5 309.5 0 0 0-15.1-30.6 1.9 1.9 0 0 0-1.9-.9A483.7 483.7 0 0 0 116.1 69.1a1.7 1.7 0 0 0-.8.7C39.1 183.7 18.2 294.7 28.4 404.4a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176 479.9a1.9 1.9 0 0 0 2.1-.7A348.2 348.2 0 0 0 208.1 430.4a1.9 1.9 0 0 0-1-2.6 321.2 321.2 0 0 1-45.9-21.9 1.9 1.9 0 0 1-.2-3.1c3.1-2.3 6.2-4.7 9.1-7.1a1.8 1.8 0 0 1 1.9-.3c96.2 43.9 200.4 43.9 295.5 0a1.8 1.8 0 0 1 1.9.2c2.9 2.4 6 4.9 9.1 7.2a1.9 1.9 0 0 1-.2 3.1 301.4 301.4 0 0 1-45.9 21.8 1.9 1.9 0 0 0-1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2.1.7A486 486 0 0 0 610.7 405.7a1.9 1.9 0 0 0 .8-1.4C623.7 277.6 590.9 167.5 524.5 69.8zM222.5 337.6c-29 0-52.8-26.6-52.8-59.2s23.4-59.2 52.8-59.2c29.7 0 53.3 26.8 52.8 59.2.1 32.6-23.3 59.2-52.8 59.2zm195.4 0c-29 0-52.8-26.6-52.8-59.2s23.4-59.2 52.8-59.2c29.7 0 53.3 26.8 52.8 59.2 0 32.6-23.2 59.2-52.8 59.2z"/></svg></span><span style="text-align:left"><div class="s-name" id="discord-row-name">Discord</div><div class="s-handle">kuki071 — click to copy</div></span></button>
  <a class="social-row" href="https://github.com/dev-kuki" target="_blank" rel="noopener"><span class="s-icon" style="color:#e6edf3"><svg viewBox="0 0 496 512" fill="currentColor"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z"/></svg></span><span><div class="s-name">GitHub</div><div class="s-handle">dev-kuki</div></span></a>
  <a class="social-row" href="https://x.com/dev_kuki" target="_blank" rel="noopener"><span class="s-icon" style="color:#e6edf3"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></span><span><div class="s-name">X / Twitter</div><div class="s-handle">@dev_kuki</div></span></a>
  <a class="social-row" href="https://open.spotify.com/user/31tvq5f35kbqv32vyin7llupnz5y" target="_blank" rel="noopener"><span class="s-icon" style="color:#1DB954"><svg viewBox="0 0 496 512" fill="currentColor"><path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z"/></svg></span><span><div class="s-name">Spotify</div><div class="s-handle">kuki</div></span></a>
  <a class="social-row" href="https://www.twitch.tv/Kuki8598989" target="_blank" rel="noopener"><span class="s-icon" style="color:#9146FF"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L21.43 12.86V0zm13.714 11.857-3.428 3.429h-3.429l-3 3v-3H6.857V1.714h12.857z"/></svg></span><span><div class="s-name">Twitch</div><div class="s-handle">Kuki8598989</div></span></a>
  <a class="social-row" href="https://medal.tv/users/kuki578" target="_blank" rel="noopener"><span class="s-icon" style="color:#FF5C5C"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="6"/><path d="M9.5 13.5L7 22l5-3 5 3-2.5-8.5"/></svg></span><span><div class="s-name">Medal</div><div class="s-handle">kuki578</div></span></a>
  <a class="social-row" href="mailto:uros.jovicic12@tuta.io"><span class="s-icon" style="color:#7d8590"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span><span><div class="s-name">Email</div><div class="s-handle">tuta.io</div></span></a>
</div>
`,

configs: `
<div class="config-block">
  <div class="config-header">
    <span class="config-name">CS2 AUTOEXEC</span>
    <div class="config-actions">
      <button class="config-btn" onclick="copyConfig('cfg-cs2')">copy</button>
      <button class="config-btn" onclick="downloadConfig('cfg-cs2','autoexec.cfg')">download</button>
    </div>
  </div>
  <pre class="config-pre" id="cfg-cs2">// mouse
sensitivity 1.7
zoom_sensitivity_ratio_mouse 1.3
m_rawinput 1
m_customaccel 0

// crosshair
cl_crosshairstyle 4
cl_crosshairsize 2
cl_crosshairthickness 0.5
cl_crosshairgap -3

// video
mat_monitorgamma 1.6
brightness 0.89

// misc
rate 786432
cl_interp 0
cl_interp_ratio 1
fps_max 0</pre>
</div>
<div class="config-block">
  <div class="config-header">
    <span class="config-name">OBS STREAM SETTINGS</span>
    <div class="config-actions">
      <button class="config-btn" onclick="copyConfig('cfg-obs')">copy</button>
      <button class="config-btn" onclick="downloadConfig('cfg-obs','obs-settings.txt')">download</button>
    </div>
  </div>
  <pre class="config-pre" id="cfg-obs">[output]
encoder: x264 / NVENC
bitrate: 6000 kbps
keyframe interval: 2s

[video]
base resolution: 1920x1080
output resolution: 1920x1080
fps: 60</pre>
</div>
<div class="config-note">replace with your exported configs when ready</div>
`,

};
