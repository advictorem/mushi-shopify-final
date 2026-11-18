/** Coaching video in its 9:16 frame, shared by the homepage markup and the coaching page. */
export const coachingVideoMarkup = () => `
  <div class="coaching__frame">
    <div class="coaching__media" data-video-player>
      <video class="coaching__video" muted loop playsinline preload="none" poster="/assets/video/coaching-poster.webp" data-src="/assets/video/coaching.mp4" width="720" height="1280" aria-label="A MUSHI coach invites you to train with him"></video>
      <div class="player__controls">
        <button class="player__btn" type="button" data-player="play" aria-label="Play video"></button>
        <button class="player__btn" type="button" data-player="mute" aria-label="Turn sound on"></button>
      </div>
    </div>
  </div>`;
