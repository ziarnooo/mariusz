(() => {
  'use strict';
  const scenes = [...document.querySelectorAll('.scene')];
  const next = document.getElementById('next');
  const back = document.getElementById('back');
  const progress = document.querySelector('.progress');
  const current = document.getElementById('current');
  const announcement = document.getElementById('announcement');
  const labels = ['Otwórz życzenia', 'Ruszamy dalej', 'Nowy rozdział', 'To, co najbliższe', 'Jeszcze jedno', 'Odkryj prezent', 'Zobacz Wasz voucher', 'Przeczytaj jeszcze raz'];
  const names = ['Najlepsze przed Tobą', 'Zdrowie i 120 lat', 'Podróże i motocykle', 'Nowa praca', 'Rodzina i spokój', 'Celne strzały', 'Prezent dla Was', 'Wasz voucher'];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let busy = false;
  let farthest = 0;
  let touchStart = null;

  const dots = scenes.map((_, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Ekran ${i + 1}: ${names[i]}`);
    button.addEventListener('click', () => go(i));
    progress.appendChild(button);
    return button;
  });

  document.querySelectorAll('[data-photo-slot]').forEach(slot => {
    const photo = window.BIRTHDAY_PHOTOS?.[slot.dataset.photoSlot];
    if (!photo?.src) return;
    const image = new Image();
    image.alt = photo.alt || '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('load', () => slot.querySelector('.photo-placeholder')?.replaceWith(image), { once: true });
    image.src = photo.src;
  });

  function loadAssets(scene) {
    scene.querySelectorAll('img[data-src]').forEach(image => {
      image.src = image.dataset.src;
      delete image.dataset.src;
    });
  }

  function render(announce = true) {
    scenes.forEach((scene, i) => { scene.hidden = i !== index; });
    document.body.dataset.scene = String(index + 1);
    current.textContent = String(index + 1).padStart(2, '0');
    back.disabled = index === 0;
    next.firstChild.textContent = `${labels[index]} `;
    dots.forEach((dot, i) => {
      dot.setAttribute('aria-current', String(i === index));
      dot.classList.toggle('visited', i < farthest && i !== index);
    });
    loadAssets(scenes[index]);
    // Rozdział poprzedzający prezent przygotowuje zdjęcie kolejnego ekranu.
    if (index === 5) loadAssets(scenes[6]);
    if (announce) announcement.textContent = `Ekran ${index + 1} z ${scenes.length}. ${names[index]}.`;
  }

  function fromHash() {
    const value = Number(location.hash.slice(1));
    return Number.isInteger(value) && value >= 1 && value <= scenes.length ? value - 1 : 0;
  }

  function go(target, updateHistory = true) {
    if (busy || target === index || target < 0 || target >= scenes.length) return;
    busy = true;
    const outgoing = scenes[index];
    const active = document.activeElement;
    const focusWasInside = outgoing.contains(active);
    outgoing.classList.add('leaving');
    window.setTimeout(() => {
      outgoing.classList.remove('leaving');
      index = target;
      farthest = Math.max(farthest, index);
      render();
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (updateHistory) history.pushState(null, '', `#${index + 1}`);
      // Przejście nie pozostawia fokusu w ukrytym rozdziale.
      if (focusWasInside || (index === 0 && active === back)) next.focus({ preventScroll: true });
      window.setTimeout(() => { busy = false; }, reduced.matches ? 0 : 160);
    }, reduced.matches ? 0 : 220);
  }

  next.addEventListener('click', () => go(index === scenes.length - 1 ? 0 : index + 1));
  back.addEventListener('click', () => go(index - 1));
  document.querySelector('.monogram').addEventListener('click', event => { event.preventDefault(); go(0); });
  window.addEventListener('popstate', () => go(fromHash(), false));
  window.addEventListener('hashchange', () => go(fromHash(), false));
  document.addEventListener('keydown', event => {
    if (event.altKey || event.metaKey || event.ctrlKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); go(Math.min(index + 1, scenes.length - 1)); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
    if (event.key === 'Home') { event.preventDefault(); go(0); }
  });
  document.getElementById('story').addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('a,button,summary,details')) { touchStart = null; return; }
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  document.getElementById('story').addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.8) go(index + (dx < 0 ? 1 : -1));
  }, { passive: true });

  index = fromHash();
  farthest = index;
  render(false);
})();
