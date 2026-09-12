const WHATSAPP_NUMBER = '966531021644';

const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');
if (menuButton && menu) {
  menuButton.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('has-menu-open', isOpen);
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('has-menu-open');
  }));
}

function whatsappUrl(product = 'استفسار عام', fields = {}) {
  const lines = Object.keys(fields).length ? [
    'السلام عليكم،', 'أرغب بطلب عرض سعر.', '',
    'اسم المؤسسة / الشركة أو المدير:', fields.business || '', '', 'المدينة:', fields.city || '', '',
    'رقم الجوال:', fields.phone || '', '', 'نوع المنتج:', product, '', 'العدد:', fields.quantity || '', '',
    'مواصفات إضافية:', fields.details || '',
  ] : ['السلام عليكم،', 'أرغب بطلب عرض سعر.', '', `نوع المنتج: ${product}`];
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}

document.querySelectorAll('[data-quote-product]').forEach((link) => {
  link.href = whatsappUrl(link.dataset.quoteProduct || 'استفسار عام');
});

const quoteForm = document.querySelector('[data-quote-form]');
quoteForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!quoteForm.checkValidity()) return quoteForm.reportValidity();
  const data = new FormData(quoteForm);
  window.open(whatsappUrl(String(data.get('product') || 'استفسار عام'), Object.fromEntries(data)), '_blank', 'noopener');
});

function addDragBehavior(viewport, moveBy, onDragging) {
  let pointerId = null;
  let startX = 0;
  let deltaX = 0;
  let dragging = false;
  let blockClickUntil = 0;
  viewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerId = event.pointerId; startX = event.clientX; deltaX = 0; dragging = false;
    viewport.setPointerCapture?.(pointerId);
  });
  viewport.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    deltaX = event.clientX - startX;
    if (Math.abs(deltaX) > 7) { dragging = true; onDragging(true, deltaX); event.preventDefault(); }
  });
  const finishDrag = (event) => {
    if (event.pointerId !== pointerId) return;
    if (dragging) { blockClickUntil = Date.now() + 350; moveBy(deltaX < 0 ? 1 : -1, Math.abs(deltaX) > 45); }
    onDragging(false, 0); pointerId = null;
  };
  viewport.addEventListener('pointerup', finishDrag);
  viewport.addEventListener('pointercancel', finishDrag);
  return () => Date.now() < blockClickUntil;
}

function setupCarousel(root) {
  const viewport = root.querySelector('[data-carousel-viewport]');
  const track = root.querySelector('[data-carousel-track]');
  const slides = Array.from(root.querySelectorAll('.carousel-slide'));
  const dots = root.querySelector('[data-carousel-dots]');
  const previous = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  if (!viewport || !track || !slides.length) return;
  let index = 0;
  root.classList.add('is-ready');
  if (slides.length < 2) { root.classList.add('is-single'); return; }
  root.classList.add('has-multiple');
  const show = (nextIndex, immediate = false) => {
    index = (nextIndex + slides.length) % slides.length;
    track.style.transitionDuration = immediate ? '0ms' : '';
    track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
    dots?.querySelectorAll('.carousel-dot').forEach((dot, dotIndex) => dot.setAttribute('aria-current', String(dotIndex === index)));
    window.setTimeout(() => { track.style.transitionDuration = ''; }, 0);
  };
  slides.forEach((_, dotIndex) => {
    const dot = document.createElement('button');
    dot.type = 'button'; dot.className = 'carousel-dot'; dot.setAttribute('aria-label', `الصورة ${dotIndex + 1}`);
    dot.addEventListener('click', () => show(dotIndex)); dots?.append(dot);
  });
  show(0, true);
  previous?.addEventListener('click', () => show(index - 1));
  next?.addEventListener('click', () => show(index + 1));
  const shouldBlockClick = addDragBehavior(viewport, (direction, movedEnough) => { if (movedEnough) show(index + direction); else show(index); }, (dragging, offset) => {
    track.classList.toggle('is-dragging', dragging);
    if (dragging) track.style.transform = `translate3d(calc(${-index * 100}% + ${offset}px), 0, 0)`;
  });
  root.querySelectorAll('a').forEach((link) => link.addEventListener('click', (event) => { if (shouldBlockClick()) event.preventDefault(); }));
}

document.querySelectorAll('[data-carousel]').forEach(setupCarousel);

const dialog = document.querySelector('[data-lightbox]');
const lightboxImage = dialog?.querySelector('[data-lightbox-image]');
const lightboxCaption = dialog?.querySelector('[data-lightbox-caption]');
const lightboxDots = dialog?.querySelector('[data-lightbox-dots]');
const lightboxStage = dialog?.querySelector('[data-lightbox-stage]');
let lightboxItems = [];
let lightboxIndex = 0;
let lightboxOpener = null;

function renderLightbox(index) {
  if (!lightboxImage || !lightboxItems.length) return;
  lightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
  const item = lightboxItems[lightboxIndex];
  lightboxImage.src = item.src; lightboxImage.alt = item.alt;
  if (lightboxCaption) lightboxCaption.textContent = item.caption || item.alt;
  lightboxDots?.replaceChildren(...lightboxItems.map((_, itemIndex) => {
    const dot = document.createElement('button');
    dot.type = 'button'; dot.className = 'carousel-dot'; dot.setAttribute('aria-label', `الصورة ${itemIndex + 1}`);
    dot.setAttribute('aria-current', String(itemIndex === lightboxIndex)); dot.addEventListener('click', () => renderLightbox(itemIndex));
    return dot;
  }));
  dialog?.classList.toggle('has-multiple', lightboxItems.length > 1);
}

function closeLightbox() {
  if (!dialog?.open) return;
  dialog.close(); lightboxImage?.removeAttribute('src'); lightboxOpener?.focus();
}

document.querySelectorAll('[data-lightbox-trigger]').forEach((button) => button.addEventListener('click', () => {
  const carousel = button.closest('[data-carousel]');
  const triggers = carousel ? Array.from(carousel.querySelectorAll('[data-lightbox-trigger]')) : [button];
  lightboxItems = triggers.map((trigger) => {
    const image = trigger.querySelector('img');
    return { src: image.currentSrc || image.src, alt: image.alt, caption: image.dataset.caption };
  });
  lightboxOpener = button; renderLightbox(triggers.indexOf(button)); dialog?.showModal();
}));

dialog?.querySelector('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
dialog?.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => renderLightbox(lightboxIndex - 1));
dialog?.querySelector('[data-lightbox-next]')?.addEventListener('click', () => renderLightbox(lightboxIndex + 1));
dialog?.addEventListener('click', (event) => { if (event.target === dialog) closeLightbox(); });
dialog?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); renderLightbox(lightboxIndex + 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); renderLightbox(lightboxIndex - 1); }
});
if (lightboxStage) addDragBehavior(lightboxStage, (direction, movedEnough) => {
  if (movedEnough && lightboxItems.length > 1) renderLightbox(lightboxIndex + direction);
}, (dragging) => lightboxStage.classList.toggle('is-dragging', dragging));
