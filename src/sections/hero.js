import badgeSvg from '../assets/svg/badge.svg?raw';
import { qs, reducedMotion } from '../utils/dom.js';
import { whenAgeConfirmed } from '../components/age-gate.js';

/**
 * Hero video: muted, inline, no controls, no loop. Starts once the age gate
 * is passed, plays through a single time and rests on its last frame. It is
 * never restarted by scrolling or UI updates — only a page refresh replays it.
 */
export function initHero() {
  const hero = qs('.hero');
  if (!hero) return;
  qs('.hero__badge', hero).innerHTML = badgeSvg.replace('<svg ', '<svg aria-hidden="true" focusable="false" ').replace(/ (width|height)="[^"]*"/, '');

  const video = qs('.hero__video', hero);
  if (reducedMotion()) {
    // No autoplaying motion: show the resting frame instead.
    video.poster = video.dataset.endPoster;
    return;
  }
  whenAgeConfirmed(() => {
    const small = window.matchMedia('(max-width: 760px)').matches;
    video.src = small ? video.dataset.srcSmall : video.dataset.src;
    video.addEventListener('ended', () => hero.classList.add('is-played'), { once: true });
    video.play().catch(() => {
      // Autoplay blocked (e.g. Low Power Mode): keep the poster.
      video.removeAttribute('src');
      video.load();
    });
  });
}
