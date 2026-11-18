/** Feel-Good Club sign-up band, shared by the homepage markup and page templates. */
export const newsletterMarkup = (id = 'page-newsletter') => `
  <section class="newsletter" aria-labelledby="${id}-title">
    <div class="newsletter__bg" aria-hidden="true"><div class="newsletter__img" data-parallax="0.42"></div></div>
    <div class="newsletter__inner">
      <h2 class="newsletter__title" id="${id}-title">Join the <em class="marker">feel-<br>good</em> club</h2>
      <p class="newsletter__text">First dibs on new flavors, rituals worth stealing, and 10% off your first order.</p>
      <form class="newsletter__form" data-preview-form="newsletter" data-success="You’re on the list." novalidate>
        <div class="pill-field">
          <label class="sr-only" for="${id}-email">Email address</label>
          <input id="${id}-email" name="email" type="email" autocomplete="email" placeholder="Enter your email address" required>
          <button class="btn btn--dark" type="submit">Submit</button>
        </div>
        <p class="form__status" role="status"></p>
      </form>
    </div>
  </section>`;
