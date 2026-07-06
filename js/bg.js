/* bg.js — constellation canvas with bounce/shatter/merge */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, dpr, points = [];
  let nextId = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initPoints();
  }

  function spawnPoint(x, y, r, vx, vy) {
    return {
      id: nextId++,
      x: x ?? Math.random() * w,
      y: y ?? Math.random() * h,
      vx: vx ?? (Math.random() - 0.5) * 1.1,
      vy: vy ?? (Math.random() - 0.5) * 1.1,
      r: r ?? (Math.random() * 0.9 + 0.4),
      mergeCooldown: 0,
    };
  }

  function initPoints() {
    const count = Math.floor((w * h) / 9000);
    points = [];
    nextId = 0;
    for (let i = 0; i < count; i++) points.push(spawnPoint());
  }

  resize();
  window.addEventListener('resize', resize);

  const MIN_R = 0.4;
  const MAX_R = 2.6;
  const SHATTER_MIN_R = 0.9;

  function handleWalls(p) {
    let hitWall = false;
    if (p.x < p.r)     { p.x = p.r;     p.vx *= -1; hitWall = true; }
    if (p.x > w - p.r) { p.x = w - p.r; p.vx *= -1; hitWall = true; }
    if (p.y < p.r)     { p.y = p.r;     p.vy *= -1; hitWall = true; }
    if (p.y > h - p.r) { p.y = h - p.r; p.vy *= -1; hitWall = true; }

    if (hitWall && p.r >= SHATTER_MIN_R && Math.random() < 0.55) {
      const childR = Math.max(MIN_R, p.r * 0.62);
      const spread = 0.9;
      const a1 = Math.atan2(p.vy, p.vx) + spread;
      const a2 = Math.atan2(p.vy, p.vx) - spread;
      const speed = Math.hypot(p.vx, p.vy) * 1.05;
      const f1 = spawnPoint(p.x, p.y, childR, Math.cos(a1) * speed, Math.sin(a1) * speed);
      const f2 = spawnPoint(p.x, p.y, childR, Math.cos(a2) * speed, Math.sin(a2) * speed);
      f1.mergeCooldown = f2.mergeCooldown = 40;
      points.push(f1, f2);
      p._dead = true;
    }
  }

  function handleMerges() {
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      if (a._dead || a.mergeCooldown > 0) continue;
      for (let j = i + 1; j < points.length; j++) {
        const b = points[j];
        if (b._dead || b.mergeCooldown > 0) continue;
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < (a.r + b.r) * 0.9) {
          const aA = a.r * a.r, aB = b.r * b.r;
          const total = aA + aB;
          a.vx = (a.vx * aA + b.vx * aB) / total;
          a.vy = (a.vy * aA + b.vy * aB) / total;
          a.x  = (a.x  * aA + b.x  * aB) / total;
          a.y  = (a.y  * aA + b.y  * aB) / total;
          a.r  = Math.min(MAX_R, Math.sqrt(total));
          a.mergeCooldown = 40;
          b._dead = true;
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#080b10';
    ctx.fillRect(0, 0, w, h);

    points.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.mergeCooldown > 0) p.mergeCooldown--;
      handleWalls(p);
    });

    handleMerges();
    points = points.filter(p => !p._dead);

    const target = Math.floor((w * h) / 9000);
    while (points.length < target) points.push(spawnPoint());
    if (points.length > target * 1.6) points.length = Math.floor(target * 1.6);

    const linkDist = 130;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDist) {
          const alpha = (1 - dist / linkDist) * 0.13;
          ctx.strokeStyle = `rgba(57,208,192,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }
    }

    points.forEach(p => {
      ctx.fillStyle = 'rgba(150,230,224,0.5)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
