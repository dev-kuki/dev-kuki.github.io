/* music.js — sidebar audio player */

// Edit this list: drop mp3s in a music/ folder next to index.html
const MUSIC_TRACKS = [
  // { name: 'track name here', src: 'music/track1.mp3' },
];

let musicIndex = 0;
const musicAudio = new Audio();
musicAudio.preload = 'metadata';

function loadTrack(i, autoplay) {
  if (MUSIC_TRACKS.length === 0) {
    document.getElementById('music-track-name').textContent = 'no tracks loaded';
    return;
  }
  musicIndex = (i + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
  const track = MUSIC_TRACKS[musicIndex];
  musicAudio.src = track.src;
  document.getElementById('music-track-name').textContent = track.name;
  if (autoplay) musicAudio.play().catch(() => {});
}

function toggleMusic() {
  if (MUSIC_TRACKS.length === 0) {
    showToast('add your mp3s to MUSIC_TRACKS first');
    return;
  }
  if (!musicAudio.src) loadTrack(0, false);
  if (musicAudio.paused) {
    musicAudio.play().catch(() => showToast("couldn't play track"));
  } else {
    musicAudio.pause();
  }
}

function nextTrack() { loadTrack(musicIndex + 1, true); }
function prevTrack() { loadTrack(musicIndex - 1, true); }

function seekMusic(e) {
  if (!musicAudio.duration) return;
  const bar = document.getElementById('music-progress-bar');
  const pct = (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth;
  musicAudio.currentTime = pct * musicAudio.duration;
}

musicAudio.addEventListener('play', () => {
  document.getElementById('music-play-icon').innerHTML =
    '<rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/>';
});
musicAudio.addEventListener('pause', () => {
  document.getElementById('music-play-icon').innerHTML = '<path d="M8 5v14l11-7z"/>';
});
musicAudio.addEventListener('timeupdate', () => {
  if (!musicAudio.duration) return;
  const pct = (musicAudio.currentTime / musicAudio.duration) * 100;
  document.getElementById('music-progress-fill').style.width = pct + '%';
});
musicAudio.addEventListener('ended', () => nextTrack());

if (MUSIC_TRACKS.length > 0) loadTrack(0, false);
