'use strict';
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const hero = document.querySelector('#hero-video');
const toggle = document.querySelector('#hero-toggle');
function loadVideo(video) {
  const source = video.querySelector('source');
  if (source && !source.hasAttribute('src')) {
    source.src = source.dataset.src;
    video.load();
  }
}
function updateHeroToggle() {
  const paused = hero.paused;
  toggle.textContent = paused ? 'Play motion ▷' : 'Pause motion Ⅱ';
  toggle.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
}
if (!motionPreference.matches) {
  loadVideo(hero);
  hero.play().catch(updateHeroToggle);
}
hero.addEventListener('play', updateHeroToggle);
hero.addEventListener('pause', updateHeroToggle);
updateHeroToggle();
toggle.addEventListener('click', () => {
  if (hero.paused) { loadVideo(hero); hero.play().catch(updateHeroToggle); }
  else hero.pause();
});
motionPreference.addEventListener('change', event => { if (event.matches) hero.pause(); });
document.querySelectorAll('video:not(#hero-video)').forEach(video => {
  // Native controls need a source before the first click to remain reliable.
  // preload=none still prevents automatic downloading of the video body.
  loadVideo(video);
  video.addEventListener('play', () => {
    document.querySelectorAll('video:not(#hero-video)').forEach(other => {
      if (other !== video) other.pause();
    });
  });
});
const dialog = document.querySelector('#demo-dialog');
const fullDemo = document.querySelector('#full-demo');
document.querySelector('#watch-demo').addEventListener('click', () => {
  dialog.showModal();
  hero.pause();
  fullDemo.play().catch(() => {});
});
document.querySelector('#close-demo').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
});
dialog.addEventListener('close', () => fullDemo.pause());
const tabs = [...document.querySelectorAll('[role=tab]')];
const revisit = document.querySelector('#revisit-video');
function selectTab(tab, focus = false) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  revisit.pause();
  revisit.poster = `assets/chapter-${tab.dataset.chapter}.jpg`;
  revisit.setAttribute('aria-label', `${tab.dataset.name} comparison`);
  revisit.querySelector('source').src = `assets/chapter-${tab.dataset.chapter}.mp4`;
  revisit.load();
  document.querySelector('#revisit-panel').setAttribute('aria-labelledby', tab.id);
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTab(tabs[next], true); }
  });
});
document.querySelector('#copy-citation').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(document.querySelector('#bibtex').textContent);
    status.textContent = 'Copied';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('#bibtex'));
    const selection = window.getSelection();
    selection.removeAllRanges(); selection.addRange(range);
    status.textContent = 'Text selected — copy manually';
  }
});
if ('IntersectionObserver' in window && !motionPreference.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.section-heading,.intro-grid,.method-steps,.revisit-heading,.mechanism-note').forEach(el => {
    el.classList.add('reveal'); observer.observe(el);
  });
}
