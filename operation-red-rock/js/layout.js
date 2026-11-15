// Shared header, footer, and config-driven text/link hydration.
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var svg = function (cls, w, body) {
    return '<svg class="' + cls + '" width="' + w + '" height="' + w + '" viewBox="0 0 ' + w + ' ' + w + '" fill="none" aria-hidden="true">' + body + '</svg>';
  };
  var LOGO = svg('brand-logo', 28,
    '<circle cx="14" cy="14" r="9" fill="#E2572B"/><circle cx="11" cy="12" r="2" fill="#0B1020"/><circle cx="17" cy="16" r="1.5" fill="#0B1020"/>' +
    '<ellipse cx="14" cy="14" rx="13" ry="4.5" transform="rotate(-22 14 14)" stroke="#FFF" stroke-width="1.5"/>');
  var MENU = svg('icon-menu', 24, '<path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" stroke-width="2"/>') +
    svg('icon-close', 24, '<path d="M5 5L19 19M19 5L5 19" stroke="currentColor" stroke-width="2"/>');
  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  var navHtml = function (cur, ftr) {
    var items = NAV_ITEMS.map(function (i) {
      var act = i.id === cur;
      var cls = !ftr && i.isAccent ? 'btn btn-accent nav-btn' : (act ? 'nav-link is-active' : 'nav-link');
      return '<li class="nav-item"><a class="' + cls + '" href="' + esc(i.href) + '"' + (act ? ' aria-current="page"' : '') +
        (i.href === '#' ? ' data-coming-soon="true"' : '') + '>' + esc(i.label) + '</a></li>';
    }).join('');
    if (!ftr) {
      items += '<li class="nav-item"><a class="nav-settings-btn" href="game.html#settings" title="Settings" aria-label="Settings">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' +
        '</a></li>';
    }
    return items;
  };
  var id = (document.body && document.body.dataset.page) || 'home';
  var brand = '<a class="brand" href="' + esc(LINKS.home) + '"><span class="brand-name">' + esc(TEXT.siteName) + '</span></a>';
  if ($('site-header')) {
    $('site-header').innerHTML = '<div class="container header-inner">' + brand +
      '<button type="button" class="menu-toggle" id="menu-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Toggle navigation menu">' +
      MENU + '</button><nav class="site-nav" id="site-nav" aria-label="Main navigation"><ul class="nav-list">' +
      navHtml(id, false) + '</ul></nav></div>';
  }
  if ($('site-footer')) {
    $('site-footer').innerHTML = '<div class="container footer-inner"><div class="footer-brand">' + brand +
      '<p class="footer-tagline">' + esc(TEXT.tagline) + '</p></div><nav class="footer-nav" aria-label="Footer navigation"><ul class="footer-links">' +
      navHtml(id, true) + '</ul></nav><p class="footer-notice">' + esc(TEXT.footer.notice) + '</p></div>';
  }
  var txt = function (elId, val) { if ($(elId)) $(elId).textContent = val; };
  if (id === 'home') {
    txt('hero-title', TEXT.heroTitle);
    txt('hero-subtitle', TEXT.heroSubtitle);
    txt('start-learning-btn', TEXT.heroButton);
    txt('scroll-hint-label', TEXT.scrollHint);
    txt('steps-heading', TEXT.stepsHeading);
    txt('game-band-text', TEXT.gameBand.text);
    document.querySelectorAll('#steps-grid .step-card').forEach(function (card, idx) {
      var s = TEXT.steps[idx];
      if (!s) return;
      card.querySelector('.step-number').textContent = s.number;
      card.querySelector('.step-title').textContent = s.title;
      card.querySelector('.step-desc').textContent = s.description;
      var b = card.querySelector('.step-action .btn');
      b.innerHTML = '<span>' + esc(s.buttonText) + '</span><span class="btn-arrow" aria-hidden="true">&rarr;</span>';
      b.setAttribute('href', s.href);
      b.toggleAttribute('data-coming-soon', s.href === '#');
    });
    var g = $('game-band-btn');
    if (g) {
      g.textContent = TEXT.gameBand.buttonText;
      g.setAttribute('href', TEXT.gameBand.href);
      g.toggleAttribute('data-coming-soon', TEXT.gameBand.href === '#');
    }
  } else if (TEXT.pages[id]) {
    var p = TEXT.pages[id];
    txt('placeholder-heading', p.heading);
    txt('placeholder-badge', p.badge);
    txt('placeholder-message', p.message);
    if ($('placeholder-back')) {
      $('placeholder-back').textContent = p.backText;
      $('placeholder-back').setAttribute('href', LINKS.home);
    }
  }
  if (!$('toast')) {
    var t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    t.hidden = true;
    document.body.appendChild(t);
  }
})();
