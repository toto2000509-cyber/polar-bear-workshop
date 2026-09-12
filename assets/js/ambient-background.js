(() => {
  const canvas = document.querySelector('[data-ambient-canvas]');
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const context = canvas.getContext('2d');
  const compact = matchMedia('(max-width: 700px)').matches;
  const particles = Array.from({ length: compact ? 28 : 88 }, () => ({ x: Math.random(), y: Math.random(), z: .25 + Math.random(), v: .00008 + Math.random() * .00018 }));
  let width = 0, height = 0, raf = 0, visible = true, pointer = { x: .5, y: .5, tx: .5, ty: .5 };
  const resize = () => { const rect = canvas.getBoundingClientRect(); const ratio = Math.min(devicePixelRatio || 1, 2); width = rect.width; height = rect.height; canvas.width = width * ratio; canvas.height = height * ratio; context.setTransform(ratio, 0, 0, ratio, 0, 0); };
  const draw = (time) => { if (!visible) return; pointer.x += (pointer.tx - pointer.x) * .035; pointer.y += (pointer.ty - pointer.y) * .035; context.clearRect(0, 0, width, height); particles.forEach((p, index) => { p.y -= p.v * (compact ? 1 : 1.6); if (p.y < -.03) { p.y = 1.03; p.x = Math.random(); } const dx = p.x - pointer.x, dy = p.y - pointer.y, d = Math.hypot(dx, dy); const drift = Math.min(.016, .003 / Math.max(d, .08)); const x = (p.x + dx * drift) * width; const y = (p.y + dy * drift) * height; const radius = p.z * (index % 9 === 0 ? 2 : .85); context.beginPath(); context.fillStyle = index % 9 === 0 ? 'rgba(225,155,60,.55)' : 'rgba(225,235,226,.28)'; context.arc(x, y, radius, 0, Math.PI * 2); context.fill(); }); raf = requestAnimationFrame(draw); };
  addEventListener('pointermove', (event) => { pointer.tx = event.clientX / innerWidth; pointer.ty = event.clientY / innerHeight; }, { passive: true });
  addEventListener('resize', resize, { passive: true }); document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); } });
  resize(); raf = requestAnimationFrame(draw);
})();
