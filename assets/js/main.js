const WHATSAPP_NUMBER = '966531021644';
const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');
menuButton?.addEventListener('click', () => { const open = menu.classList.toggle('is-open'); menuButton.setAttribute('aria-expanded', String(open)); document.body.classList.toggle('has-menu-open', open); });
menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { menu.classList.remove('is-open'); menuButton?.setAttribute('aria-expanded', 'false'); }));
function whatsappUrl(product = 'استفسار عام', fields = {}) { const lines = ['السلام عليكم،', 'أرغب بطلب عرض سعر.', '', 'نوع المنتج:', product, '', 'اسم المؤسسة / الشركة أو المدير:', fields.business || '', 'المدينة:', fields.city || '', 'رقم الجوال:', fields.phone || '', 'العدد:', fields.quantity || '', 'مواصفات إضافية:', fields.details || '']; return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`; }
document.querySelectorAll('[data-quote-product]').forEach((link) => { link.href = whatsappUrl(link.dataset.quoteProduct || 'استفسار عام'); });
const form = document.querySelector('[data-quote-form]');
form?.addEventListener('submit', (event) => { event.preventDefault(); if (!form.checkValidity()) return form.reportValidity(); const data = Object.fromEntries(new FormData(form)); window.open(whatsappUrl(data.product || 'استفسار عام', data), '_blank', 'noopener'); });
const dialog = document.querySelector('[data-lightbox]'); const dialogImage = dialog?.querySelector('[data-lightbox-image]'); const dialogCaption = dialog?.querySelector('[data-lightbox-caption]'); let opener;
document.querySelectorAll('[data-lightbox-trigger]').forEach((button) => button.addEventListener('click', () => { const image = button.querySelector('img'); if (!image || !dialogImage) return; opener = button; dialogImage.src = image.currentSrc || image.src; dialogImage.alt = image.alt; if (dialogCaption) dialogCaption.textContent = image.dataset.caption || image.alt; dialog.showModal(); }));
const closeLightbox = () => { dialog?.close(); dialogImage?.removeAttribute('src'); opener?.focus(); };
dialog?.querySelector('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
dialog?.addEventListener('click', (event) => { if (event.target === dialog) closeLightbox(); });
