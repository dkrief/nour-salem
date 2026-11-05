export {};
const viewer = document.querySelector<HTMLDialogElement>('.lightbox');
const viewImage = viewer?.querySelector<HTMLImageElement>('[data-viewer]');
const caption = viewer?.querySelector<HTMLElement>('figcaption');
let current: HTMLAnchorElement[] = [];
let position = 0;
let opener: HTMLAnchorElement | null = null;
function displayPhoto(index: number) {
  position = (index + current.length) % current.length;
  const link = current[position];
  if (!link || !viewImage || !caption) return;
  viewImage.src = link.href;
  viewImage.alt = link.dataset.caption || '';
  caption.textContent = (position + 1) + ' / ' + current.length + ' — ' + viewImage.alt;
  viewer?.querySelectorAll<HTMLButtonElement>('[data-prev],[data-next]').forEach(button => { button.hidden = current.length < 2; });
}
document.querySelectorAll<HTMLAnchorElement>('[data-lightbox]').forEach(link => {
  link.addEventListener('click', event => {
    if (!viewer || !viewImage || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    current = [...document.querySelectorAll<HTMLAnchorElement>('[data-lightbox]')].filter(item => item.dataset.lightbox === link.dataset.lightbox);
    displayPhoto(current.indexOf(link));
    viewer.showModal();
    document.body.classList.add('viewer-open');
  });
});
viewer?.querySelector('[data-close]')?.addEventListener('click', () => viewer.close());
viewer?.querySelector('[data-prev]')?.addEventListener('click', () => displayPhoto(position - 1));
viewer?.querySelector('[data-next]')?.addEventListener('click', () => displayPhoto(position + 1));
viewer?.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
viewer?.addEventListener('close', () => { document.body.classList.remove('viewer-open'); opener?.focus(); });
viewer?.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); displayPhoto(position - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); displayPhoto(position + 1); }
});
document.querySelectorAll<HTMLElement>('.gallery-filters').forEach(filters => {
  filters.hidden = false;
  filters.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.querySelectorAll<HTMLElement>('[data-category]').forEach(project => {
        project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter;
      });
    });
  });
});
document.querySelectorAll<HTMLElement>('[data-video]').forEach(container => {
  container.querySelector('button')?.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = container.dataset.video || '';
    iframe.title = container.dataset.videoTitle || 'Nour Salem';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    container.replaceChildren(iframe);
    iframe.focus();
  }, { once: true });
});
