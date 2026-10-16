(() => {
  const slider = document.querySelector('[data-hero-slider]');
  if (!slider) return;

  const slides = [...slider.querySelectorAll('[data-hero-slide]')];
  const tabs = [...slider.querySelectorAll('[data-hero-go]')];
  const play = slider.querySelector('[data-hero-play]');
  const playLabel = slider.querySelector('[data-hero-play-label]');
  const status = slider.querySelector('[data-hero-status]');
  const count = slider.querySelector('[data-hero-count] b');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let timer;
  let request = 0;
  let paused = reducedMotion.matches;
  let hovered = false;
  let focused = false;
  let visible = true;

  function schedule() {
    clearTimeout(timer);
    if (!paused && !reducedMotion.matches && !hovered && !focused && visible && !document.hidden) {
      timer = setTimeout(() => show(active + 1), 7000);
    }
  }

  function updatePlay() {
    play.setAttribute('aria-pressed', String(paused));
    play.setAttribute('aria-label', paused ? 'تشغيل العرض التلقائي' : 'إيقاف العرض التلقائي');
    playLabel.textContent = paused ? 'تشغيل تلقائي' : 'إيقاف مؤقت';
  }

  async function show(index, manual = false) {
    const next = (index + slides.length) % slides.length;
    const currentRequest = ++request;
    clearTimeout(timer);
    if (manual) { paused = true; updatePlay(); }
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
      if (currentRequest !== request) return;
      paused = true;
      updatePlay();
      status.textContent = 'تعذر تحميل المشهد. يمكنك اختيار مشهد آخر.';
      return;
    }
    if (currentRequest !== request) return;
    // A pause/focus/visibility change can happen while the image is decoding.
    if (!manual && (paused || reducedMotion.matches || hovered || focused || !visible || document.hidden)) return;
    slides.forEach((slide, i) => {
      const selected = i === next;
      slide.classList.toggle('is-active', selected);
      slide.setAttribute('aria-hidden', String(!selected));
      slide.inert = !selected;
      tabs[i].setAttribute('aria-pressed', String(selected));
    });
    active = next;
    count.textContent = String(next + 1).padStart(2, '0');
    // Automatic changes stay silent for screen-reader users.
    if (manual) status.textContent = slides[next].getAttribute('aria-label');
    schedule();
  }

  tabs.forEach((tab, index) => tab.addEventListener('click', () => show(index, true)));
  slider.querySelector('[data-hero-prev]').addEventListener('click', () => show(active - 1, true));
  slider.querySelector('[data-hero-next]').addEventListener('click', () => show(active + 1, true));
  play.addEventListener('click', () => {
    paused = !paused;
    // The reduced-motion preference always disables automatic changes.
    if (reducedMotion.matches) {
      paused = true;
      status.textContent = 'تقليل الحركة مفعّل. يمكنك التنقل بين المشاهد بالأزرار.';
    }
    updatePlay();
    schedule();
  });
  slider.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const next = { ArrowLeft: active + 1, ArrowRight: active - 1, Home: 0, End: slides.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    show(next, true);
  });
  slider.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') { hovered = true; schedule(); }
  });
  slider.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  slider.addEventListener('focusin', () => { focused = true; schedule(); });
  slider.addEventListener('focusout', () => {
    queueMicrotask(() => { focused = slider.contains(document.activeElement); schedule(); });
  });
  let touchStart;
  slider.querySelectorAll('.dome-scene__media').forEach((media) => {
    media.style.touchAction = 'pan-y';
    media.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch') touchStart = { x: event.clientX, y: event.clientY };
    }, { passive: true });
    media.addEventListener('pointerup', (event) => {
      if (!touchStart || event.pointerType !== 'touch') return;
      const dx = event.clientX - touchStart.x;
      const dy = event.clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) show(active + (dx > 0 ? 1 : -1), true);
    }, { passive: true });
    media.addEventListener('pointercancel', () => { touchStart = null; });
  });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) paused = true;
    updatePlay();
    schedule();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: .15 }).observe(slider);
  }
  slider.querySelector('[data-hero-controls]').hidden = false;
  updatePlay();
  schedule();
})();
