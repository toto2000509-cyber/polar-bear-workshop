(() => {
  if (matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return;
  const glow = document.createElement('div'); glow.className = 'cursor-glow'; document.body.append(glow);
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  addEventListener('pointermove', (event) => { tx = event.clientX; ty = event.clientY; glow.style.opacity = '1'; }, { passive: true });
  const tick = () => { x += (tx - x) * .12; y += (ty - y) * .12; glow.style.left = `${x}px`; glow.style.top = `${y}px`; requestAnimationFrame(tick); }; tick();
  document.querySelectorAll('.button-primary, .button-dark').forEach((button) => { button.addEventListener('pointermove', (event) => { const rect = button.getBoundingClientRect(); const dx = (event.clientX - rect.left - rect.width / 2) * .08; const dy = (event.clientY - rect.top - rect.height / 2) * .08; button.style.translate = `${dx}px ${dy}px`; }); button.addEventListener('pointerleave', () => { button.style.translate = ''; }); });
})();
