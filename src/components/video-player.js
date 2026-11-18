import { qsa, reducedMotion } from '../utils/dom.js';

const ICON = {
  play: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 4.500v15l12-7.500L7 4.500Z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6 4.500h4v15H6zM14 4.500h4v15h-4z"/></svg>',
  muted: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.500v5h3.500L12 18.500v-13L7.500 9.500H4Z" fill="currentColor"/><path d="m16 9.500 5 5m0-5-5 5"/></svg>',
  sound: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.500v5h3.500L12 18.500v-13L7.500 9.500H4Z" fill="currentColor"/><path d="M15.500 9a4.200 4.200 0 0 1 0 6M18 6.500a7.800 7.800 0 0 1 0 11"/></svg>',
};

/**
 * Minimal inline video player: [data-video-player] wrapping a <video data-src>
 * and two buttons. Autoplays muted when it scrolls into view, pauses when it
 * leaves; play/pause and sound buttons give the visitor control. A manual
 * pause is respected (it does not restart on the next scroll). With reduced
 * motion it never autoplays.
 */
export function initVideoPlayers(root = document) {
  qsa('[data-video-player]', root).forEach((host) => {
    const video = host.querySelector('video');
    const playBtn = host.querySelector('[data-player="play"]');
    const muteBtn = host.querySelector('[data-player="mute"]');
    let userPaused = reducedMotion();

    const paint = () => {
      const playing = !video.paused && !video.ended;
      playBtn.innerHTML = playing ? ICON.pause : ICON.play;
      playBtn.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
      muteBtn.innerHTML = video.muted ? ICON.muted : ICON.sound;
      muteBtn.setAttribute('aria-label', video.muted ? 'Turn sound on' : 'Turn sound off');
      host.classList.toggle('is-playing', playing);
    };
    const load = () => {
      if (!video.getAttribute('src')) video.src = video.dataset.src;
    };
    const play = () => {
      load();
      video.play().catch(() => paint());
    };

    playBtn.addEventListener('click', () => {
      if (video.paused) {
        userPaused = false;
        play();
      } else {
        userPaused = true;
        video.pause();
      }
    });
    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      if (!video.muted && video.paused) {
        userPaused = false;
        play();
      }
      paint();
    });
    video.addEventListener('click', () => playBtn.click());
    ['play', 'pause', 'ended', 'volumechange'].forEach((e) => video.addEventListener(e, paint));

    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!userPaused) play();
      } else if (!video.paused) {
        video.pause(); // leaving view is not a manual pause
      }
    }, { threshold: 0.35 }).observe(host);
    paint();
  });
}
