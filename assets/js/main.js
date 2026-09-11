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
  if (Object.keys(fields).length === 0) {
    const message = `السلام عليكم،\nأرغب بطلب عرض سعر.\n\nنوع المنتج: ${product}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  const lines = [
    'السلام عليكم،',
    'أرغب بطلب عرض سعر.',
    '',
    'اسم المؤسسة / الشركة أو المدير:', fields.business || '',
    '',
    'المدينة:', fields.city || '',
    '',
    'رقم الجوال:', fields.phone || '',
    '',
    'نوع المنتج:', product,
    '',
    'العدد:', fields.quantity || '',
    '',
    'مواصفات إضافية:', fields.details || '',
  ];
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}

document.querySelectorAll('[data-quote-product]').forEach((link) => {
  link.href = whatsappUrl(link.dataset.quoteProduct || 'استفسار عام');
});

const quoteForm = document.querySelector('[data-quote-form]');
if (quoteForm) {
  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!quoteForm.checkValidity()) {
      quoteForm.reportValidity();
      return;
    }

    const data = new FormData(quoteForm);
    window.open(whatsappUrl(String(data.get('product') || 'استفسار عام'), {
      business: String(data.get('business') || ''),
      city: String(data.get('city') || ''),
      phone: String(data.get('phone') || ''),
      quantity: String(data.get('quantity') || ''),
      details: String(data.get('details') || ''),
    }), '_blank', 'noopener');
  });
}

const dialog = document.querySelector('[data-lightbox]');
const dialogImage = document.querySelector('[data-lightbox-image]');
const dialogCaption = document.querySelector('[data-lightbox-caption]');
let lightboxOpener = null;

function closeLightbox() {
  if (!dialog) return;
  dialog.close();
  dialogImage?.removeAttribute('src');
  lightboxOpener?.focus();
}

document.querySelectorAll('[data-lightbox-trigger]').forEach((button) => {
  button.addEventListener('click', () => {
    const image = button.querySelector('img');
    if (!dialog || !dialogImage || !image) return;
    lightboxOpener = button;
    dialogImage.src = image.currentSrc || image.src;
    dialogImage.alt = image.alt;
    if (dialogCaption) dialogCaption.textContent = image.dataset.caption || image.alt;
    dialog.showModal();
  });
});

document.querySelectorAll('[data-lightbox-close]').forEach((button) => {
  button.addEventListener('click', closeLightbox);
});

dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) closeLightbox();
});

document.querySelectorAll('[data-slider]').forEach((slider) => {
  const track = slider.querySelector('[data-slider-track]');
  const slides = Array.from(slider.querySelectorAll('.product-slide'));
  const dots = Array.from(slider.querySelectorAll('[data-slider-dot]'));
  const previous = slider.querySelector('[data-slider-prev]');
  const next = slider.querySelector('[data-slider-next]');
  let activeIndex = 0;

  if (!track || slides.length < 2) return;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  };

  const setActiveDot = (index) => {
    activeIndex = index;
    dots.forEach((dot, dotIndex) => dot.setAttribute('aria-current', String(dotIndex === index)));
  };

  previous?.addEventListener('click', () => showSlide(activeIndex - 1));
  next?.addEventListener('click', () => showSlide(activeIndex + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveDot(slides.indexOf(entry.target));
      });
    }, { root: track, threshold: 0.65 });
    slides.forEach((slide) => observer.observe(slide));
  }
});
