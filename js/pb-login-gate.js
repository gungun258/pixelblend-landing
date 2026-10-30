/* Softgen login gates — full page or credits blur */
(function (global) {
  var LOCK_SVG =
    '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<rect x="5" y="11" width="14" height="10" rx="2.2" stroke="currentColor" stroke-width="1.9"/>' +
      '<path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>' +
    '</svg>';

  function gateHtml(href) {
    return (
      '<div class="pb-gate" role="dialog" aria-labelledby="pb-gate-title">' +
        '<div class="pb-gate-ico">' + LOCK_SVG + '</div>' +
        '<h1 id="pb-gate-title">Login Required</h1>' +
        '<p>Please log in or sign up to access this feature and explore everything PixelBlend has to offer.</p>' +
        '<a class="pb-gate-cta" href="' + href + '">Login / Sign Up</a>' +
      '</div>'
    );
  }

  function lockFull(opts) {
    opts = opts || {};
    if (!global.pbAuth || pbAuth.isLoggedIn()) return false;
    var content = document.querySelector(opts.target || '.pb-content');
    if (!content) return false;
    document.body.classList.add('pb-gated');
    content.innerHTML = gateHtml(pbAuth.loginHref(opts.next));
    return true;
  }

  function lockCredits(opts) {
    opts = opts || {};
    if (!global.pbAuth || pbAuth.isLoggedIn()) return false;
    var wrap = document.querySelector(opts.target || '.cr-balance') || document.querySelector('.cr-top');
    if (!wrap) return false;
    if (wrap.classList.contains('pb-credits-gate') || wrap.closest('.pb-credits-gate')) return true;
    var shell = document.createElement('div');
    shell.className = 'pb-credits-gate is-locked';
    wrap.parentNode.insertBefore(shell, wrap);
    shell.appendChild(wrap);
    var overlay = document.createElement('div');
    overlay.className = 'pb-credits-gate-overlay';
    overlay.innerHTML = '<a class="pb-credits-gate-btn" href="' + pbAuth.loginHref(opts.next || 'buy-credits.html') + '">Sign In / Sign Up</a>';
    shell.appendChild(overlay);
    document.body.classList.add('pb-credits-gated');
    return true;
  }

  function clearGatePending() {
    try {
      document.documentElement.classList.remove('pb-gate-pending');
    } catch (e) {}
  }

  function auto() {
    try {
      var body = document.body;
      if (!body) return;
      var mode = body.getAttribute('data-pb-gate');
      if (!mode) return;
      if (mode === 'credits') lockCredits();
      else lockFull();
    } finally {
      clearGatePending();
    }
  }

  function boot() {
    var gated = document.body && document.body.getAttribute('data-pb-gate');
    if (gated) auto();
    else clearGatePending();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.pbLoginGate = {
    lockFull: lockFull,
    lockCredits: lockCredits
  };
})(window);
