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

  function schedule() {
    clearTimeout(timer);
    if (!loading && !reducedMotion.matches && visible && !document.hidden) {
      timer = setTimeout(advance, 7000);
    }
  }

  async function advance() {
    if (loading) return;
    loading = true;
    const next = upcoming;
    upcoming = (upcoming + 1) % slides.length;
    const image = slides[next].querySelector('img');
    if (image.dataset.src) {
      if (image.dataset.srcset) image.srcset = image.dataset.srcset;
      image.src = image.dataset.src;
      delete image.dataset.src;
      delete image.dataset.srcset;
    }
    try {
      await image.decode();
    } catch (_) {
      // Keep the current image when another image cannot be loaded.
      loading = false;
      schedule();
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
  }

  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', schedule);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: .15 }).observe(slider);
  }
  schedule();
})();
