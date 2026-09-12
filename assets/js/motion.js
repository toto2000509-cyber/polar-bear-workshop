(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = document.querySelectorAll('.hero h1, .product-heading-pill, .product-card, .shipping, .quote-header, .steps, .quote-layout');
  targets.forEach((item) => item.classList.add('motion-reveal'));
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
  targets.forEach((item) => observer.observe(item));
})();
