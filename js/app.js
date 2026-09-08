  // rain background: generate drops as direct children of #rainRoot
  // (siblings of the .wind-zone divs, so the ~ hover selectors reach them)
  const rainRoot = document.getElementById('rainRoot');
  if (rainRoot) {
    const DROP_COUNT = 260; // scaled down from the original 500 for perf; still dense
    const frag = document.createDocumentFragment();
    for (let i = 0; i < DROP_COUNT; i++) {
      const d = document.createElement('div');
      d.className = 'drop';
      const left = (Math.random() * 120).toFixed(2) + 'vw';
      const borderLeft = (Math.random() * 8).toFixed(2) + 'vmin';
      const opacity = (0.1 + Math.random() * 0.8).toFixed(2);
      const duration = (0.15 + Math.random() * 2.1).toFixed(2) + 's';
      const delay = (-(0.5 + Math.random() * 12)).toFixed(2) + 's';
      d.style.left = left;
      d.style.borderLeftWidth = borderLeft;
      d.style.opacity = opacity;
      d.style.animationDuration = duration;
      d.style.animationDelay = delay;
      frag.appendChild(d);
    }
    rainRoot.appendChild(frag);
  }

  // random lightning flash, every 2-5s
  function triggerLightning() {
    if (rainRoot) {
      rainRoot.classList.remove('auto-flash');
      void rainRoot.offsetWidth; // restart the animation
      rainRoot.classList.add('auto-flash');
      setTimeout(() => rainRoot.classList.remove('auto-flash'), 500);
    }
  }

  function scheduleLightning() {
    const delay = 2000 + Math.random() * 3000; // every 2-5s
    setTimeout(() => {
      triggerLightning();
      scheduleLightning();
    }, delay);
  }
  scheduleLightning();

  // custom cursor
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  window.addEventListener('mousemove', (e) => {
    cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    cursorRing.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
  });
  document.querySelectorAll('a, button, .discord-copy, [id="discord-copy"], #rainRoot').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('active'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('active'));
  });

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

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.panel).classList.add('active');
      moveIndicator(tab);
    });
  });
