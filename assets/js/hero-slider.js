(() => {
  const slider = document.querySelector('[data-hero-slider]');
  if (!slider) return;
  const slides = [...slider.querySelectorAll('[data-hero-slide]')];
  if (slides.length < 2) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let upcoming = 1;
  let timer;
  let visible = true;
  let loading = false;
  let initialized = false;

  function prepare(index) {
    const image = slides[index].querySelector('img');
    if (image.dataset.src) {
      image.fetchPriority = 'low';
      if (image.dataset.srcset) image.srcset = image.dataset.srcset;
      image.src = image.dataset.src;
      delete image.dataset.src;
      delete image.dataset.srcset;
    }
    return image.decode();
  }

  function preloadUpcoming() {
    if (initialized && !loading && !reducedMotion.matches && visible && !document.hidden) {
      prepare(upcoming).catch(() => { /* The current scene stays visible on load failure. */ });
    }
  }

  function schedule() {
    clearTimeout(timer);
    if (initialized && !loading && !reducedMotion.matches && visible && !document.hidden) {
      timer = setTimeout(advance, 3000);
    }
  }

  async function advance() {
    if (loading) return;
    loading = true;
    const next = upcoming;
    upcoming = (upcoming + 1) % slides.length;
    try {
      await prepare(next);
    } catch (_) {
      loading = false;
      schedule();
      preloadUpcoming();
      return;
    }
    loading = false;
    if (reducedMotion.matches || !visible || document.hidden) {
      upcoming = next;
      return;
    }
    slides[active].classList.remove('is-active');
    slides[active].setAttribute('aria-hidden', 'true');
    slides[active].inert = true;
    slides[next].classList.add('is-active');
    slides[next].setAttribute('aria-hidden', 'false');
    slides[next].inert = false;
    active = next;
    schedule();
    preloadUpcoming();
  }

  function updatePlayback() {
    schedule();
    preloadUpcoming();
  }
  document.addEventListener('visibilitychange', updatePlayback);
  reducedMotion.addEventListener('change', updatePlayback);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updatePlayback(); }, { threshold: .15 }).observe(slider);
  }
  prepare(active).catch(() => {}).then(() => { initialized = true; updatePlayback(); });
})();
