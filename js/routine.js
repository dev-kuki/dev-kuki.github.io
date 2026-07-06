/* routine.js */
let routineRunning = false;
let routineIndex = 0;
let routineSecondsLeft = 0;
let routineTimerId = null;

function getItems()     { return Array.from(document.querySelectorAll('.routine-item')); }
function getDurations() { return getItems().map(el => parseInt(el.dataset.mins, 10) * 60); }

function fmtTotal() {
  const el = document.getElementById('routine-total-time');
  if (!el) return;
  const s = getDurations().reduce((a, b) => a + b, 0);
  el.textContent = (Math.floor(s/3600) ? Math.floor(s/3600)+'h ' : '') + Math.floor((s%3600)/60) + 'm';
}

function fmtClock(sec) {
  return String(Math.floor(sec/60)).padStart(2,'0') + ':' + String(sec%60).padStart(2,'0');
}

function setPlayUI(playing) {
  const lbl = document.getElementById('play-label');
  const ico  = document.getElementById('play-icon');
  const btn  = document.getElementById('routine-play-btn');
  if (lbl) lbl.textContent = playing ? 'pause' : 'play';
  if (ico) ico.innerHTML = playing
    ? '<rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/>'
    : '<path d="M8 5v14l11-7z"/>';
  if (btn) btn.classList.toggle('playing', playing);
}

function toggleRoutine() {
  if (routineRunning) {
    routineRunning = false; clearInterval(routineTimerId); setPlayUI(false);
  } else if (routineIndex < getItems().length && routineSecondsLeft > 0) {
    routineRunning = true; setPlayUI(true);
    routineTimerId = setInterval(tickRoutine, 1000);
  } else {
    startRoutine();
  }
}

function startRoutine() {
  routineRunning = true; routineIndex = 0;
  getItems().forEach(el => {
    el.classList.remove('active','done');
    el.querySelector('.routine-bar').style.width = '0%';
    el.querySelector('.ri-check').textContent = '○';
  });
  const clock = document.getElementById('routine-clock');
  if (clock) clock.style.display = 'block';
  setPlayUI(true); beginBlock(0);
}

function beginBlock(i) {
  const items = getItems(), durs = getDurations();
  if (i >= items.length) { finishRoutine(); return; }
  routineIndex = i; routineSecondsLeft = durs[i];
  items.forEach((it, k) => {
    if (k < i) { it.classList.add('done'); it.classList.remove('active'); it.querySelector('.routine-bar').style.width='100%'; it.querySelector('.ri-check').textContent='✓'; }
  });
  items[i].classList.add('active'); items[i].querySelector('.ri-check').textContent = '●';
  const lbl = document.getElementById('routine-clock-label');
  const sub = document.getElementById('routine-clock-sub');
  const tim = document.getElementById('routine-clock-time');
  if (lbl) lbl.textContent = items[i].querySelector('.ri-name').textContent;
  if (sub) sub.textContent = `block ${i+1} of ${items.length}`;
  if (tim) tim.textContent = fmtClock(routineSecondsLeft);
  clearInterval(routineTimerId);
  routineTimerId = setInterval(tickRoutine, 1000);
}

function tickRoutine() {
  routineSecondsLeft--;
  const items = getItems(), durs = getDurations();
  const el = items[routineIndex];
  if (!el) return;
  el.querySelector('.routine-bar').style.width = Math.min(100, 100*(1-routineSecondsLeft/durs[routineIndex])) + '%';
  const tim = document.getElementById('routine-clock-time');
  if (tim) tim.textContent = fmtClock(Math.max(0, routineSecondsLeft));
  if (routineSecondsLeft <= 0) { clearInterval(routineTimerId); beginBlock(routineIndex+1); }
}

function finishRoutine() {
  routineRunning = false; routineIndex = 0; routineSecondsLeft = 0; setPlayUI(false);
  getItems().forEach(it => {
    it.classList.add('done'); it.classList.remove('active');
    it.querySelector('.routine-bar').style.width='100%'; it.querySelector('.ri-check').textContent='✓';
  });
  const lbl=document.getElementById('routine-clock-label'), tim=document.getElementById('routine-clock-time'), sub=document.getElementById('routine-clock-sub');
  if(lbl) lbl.textContent='routine complete'; if(tim) tim.textContent='✓'; if(sub) sub.textContent='nice work';
  showToast('routine complete 🎯');
  saveRoutineCompletion();
}
