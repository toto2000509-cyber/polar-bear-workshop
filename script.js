const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const backTop = document.querySelector('.back-top');
const cursorGlow = document.querySelector('.cursor-glow');
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxCaption = document.querySelector('#lightbox-caption');
const galleryTriggers = [...document.querySelectorAll('.gallery-trigger')];
let activeGalleryIndex = 0;

menuToggle?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  document.body.classList.toggle('menu-open', isOpen);
  menuToggle.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.main-nav a')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });
sections.forEach((section) => sectionObserver.observe(section));

window.addEventListener('scroll', () => {
  backTop.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

document.addEventListener('mousemove', (event) => {
  if (cursorGlow) {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }
});

const updateLightbox = (index) => {
  activeGalleryIndex = (index + galleryTriggers.length) % galleryTriggers.length;
  const trigger = galleryTriggers[activeGalleryIndex];
  const image = trigger.querySelector('img');
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = trigger.closest('.gallery-item').querySelector('strong').textContent;
};

const closeLightbox = () => {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
  lightboxImage.src = '';
};

galleryTriggers.forEach((trigger, index) => {
  trigger.addEventListener('click', () => {
    updateLightbox(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
  });
});

document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
document.querySelector('.lightbox-next')?.addEventListener('click', () => updateLightbox(activeGalleryIndex - 1));
document.querySelector('.lightbox-prev')?.addEventListener('click', () => updateLightbox(activeGalleryIndex + 1));
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (event) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') updateLightbox(activeGalleryIndex + 1);
  if (event.key === 'ArrowRight') updateLightbox(activeGalleryIndex - 1);
});

const quoteForm = document.querySelector('#quote-form');
const formNote = document.querySelector('#form-note');
quoteForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(quoteForm);
  const message = `مرحباً، أرغب في طلب عرض سعر من ورشة الدب القطبي للصناعة.%0A%0Aالاسم: ${formData.get('name')}%0Aنوع المشروع: ${formData.get('project')}%0Aالتفاصيل: ${formData.get('details') || 'لا توجد تفاصيل إضافية'}`;
  window.open(`https://wa.me/966500000000?text=${message}`, '_blank', 'noopener');
  formNote.textContent = 'تم تجهيز رسالتك، نراك على واتساب.';
  formNote.style.color = '#f2a35d';
});
