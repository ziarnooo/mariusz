(() => {
  'use strict';
  const scenes = [...document.querySelectorAll('.scene')];
  const next = document.getElementById('next');
  const back = document.getElementById('back');
  const progress = document.querySelector('.progress');
  const current = document.getElementById('current');
  const announcement = document.getElementById('announcement');
  const labels = ['Otwórz życzenia', 'Ruszamy dalej', 'Nowy rozdział', 'To, co najbliższe', 'Jeszcze jedno', 'Odkryj prezent', 'Zobacz Wasz voucher', 'Przeczytaj jeszcze raz'];
  const names = ['Samych wspaniałości z okazji urodzin', 'Zdrowie i 120 lat', 'Podróże i motocykle', 'Nowa praca', 'Rodzina i spokój', 'Celne strzały', 'Prezent dla Was', 'Wasz voucher'];
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

  const fullscreenButton = document.getElementById('fullscreen-toggle');
  const fullscreenLabel = fullscreenButton.querySelector('.fullscreen-label');
  const fullscreenSupported = Boolean(document.fullscreenEnabled && document.documentElement.requestFullscreen);
  let fullscreenPending = false;
  let fullscreenWasActive = false;
  let fullscreenDismissed = false;

  function syncFullscreen() {
    const active = Boolean(document.fullscreenElement);
    if (fullscreenWasActive && !active) fullscreenDismissed = true;
    fullscreenWasActive = active;
    fullscreenButton.hidden = !fullscreenSupported;
    fullscreenButton.setAttribute('aria-pressed', String(active));
    fullscreenButton.setAttribute('aria-label', active ? 'Wyjdź z pełnego ekranu' : 'Włącz pełny ekran');
    fullscreenLabel.textContent = active ? 'Zmniejsz' : 'Pełny ekran';
  }

  async function enterFullscreen() {
    if (!fullscreenSupported || document.fullscreenElement || fullscreenPending) return;
    fullscreenPending = true;
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Przeglądarka może wymagać kliknięcia lub nie udostępniać pełnego ekranu.
    } finally {
      fullscreenPending = false;
      syncFullscreen();
    }
  }

  fullscreenButton.addEventListener('click', async () => {
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch { syncFullscreen(); }
    } else {
      fullscreenDismissed = false;
      enterFullscreen();
    }
  });
  document.addEventListener('fullscreenchange', syncFullscreen);
  syncFullscreen();

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

  next.addEventListener('click', () => {
    if (index === 0 && !fullscreenDismissed) enterFullscreen();
    go(index === scenes.length - 1 ? 0 : index + 1);
  });
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
  enterFullscreen();
})();
