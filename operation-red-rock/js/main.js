// Mobile menu, smooth scroll, scroll hint, reveal, parallax, and '#' toast.
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var timer = null;
  var t = $('menu-toggle'), nav = $('site-nav');
  if (t && nav) {
    var setOpen = function (o) { t.setAttribute('aria-expanded', o ? 'true' : 'false'); nav.classList.toggle('is-open', o); };
    t.addEventListener('click', function () { setOpen(t.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); t.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth >= 760 && nav.classList.contains('is-open')) setOpen(false); });
  }
  var start = $('start-learning-btn'), steps = $('steps'), hd = $('steps-heading');
  if (start && steps && hd) {
    start.addEventListener('click', function (e) {
      e.preventDefault();
      steps.scrollIntoView({ behavior: rm.matches ? 'auto' : 'smooth', block: 'start' });
      hd.focus({ preventScroll: true });
    });
  }
  var hint = $('scroll-hint');
  if (hint) {
    window.addEventListener('scroll', function onScroll() {
      if (window.scrollY > 24) { hint.classList.add('is-hidden'); window.removeEventListener('scroll', onScroll); }
    }, { passive: true });
  }
  var hero = document.querySelector('.hero'), sky = document.querySelector('.hero-bg');
  if (hero && sky && !rm.matches && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      sky.style.setProperty('--px', (((e.clientX - r.left) / r.width - 0.5) * 16).toFixed(1) + 'px');
      sky.style.setProperty('--py', (((e.clientY - r.top) / r.height - 0.5) * 10).toFixed(1) + 'px');
    });
  }
  var cards = document.querySelectorAll('.reveal-card');
  if (cards.length) {
    if (rm.matches || !('IntersectionObserver' in window)) {
      cards.forEach(function (c) { c.classList.add('is-visible'); });
    } else {
      document.documentElement.classList.add('js-reveal');
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); } });
      }, { threshold: 0.15 });
      cards.forEach(function (c) { obs.observe(c); });
    }
  }
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link || (link.getAttribute('href') !== '#' && link.dataset.comingSoon !== 'true')) return;
    e.preventDefault();
    var toast = $('toast');
    if (!toast) return;
    toast.textContent = (typeof TEXT !== 'undefined' && TEXT.comingSoon) ? TEXT.comingSoon : 'Coming soon';
    toast.hidden = false;
    void toast.offsetWidth;
    toast.classList.add('is-visible');
    clearTimeout(timer);
    timer = setTimeout(function () {
      toast.classList.remove('is-visible');
      timer = setTimeout(function () { toast.hidden = true; }, 220);
    }, 2400);
  });
})();
