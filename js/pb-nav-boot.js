/* Early head boot — soft in-site hops: skip splash, cover hydrate blank */
function pbLoaderMark() {
  return '<div data-pb-nav-mark style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;gap:11px;">' +
    '<span class="pb-logo-pulse" style="width:34px;height:34px;border-radius:11px;background:linear-gradient(113.667deg,#A855F7,#EC4899,#F43F5E);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(196,46,139,.32);flex:none;">' +
      '<span style="width:13px;height:13px;border:2.5px solid #fff;border-radius:50%;box-sizing:border-box;"></span>' +
    '</span>' +
    '<span style="font-family:\'Hanken Grotesk\',sans-serif;font-size:19px;font-weight:600;letter-spacing:-.02em;line-height:1;background:linear-gradient(90deg,#9333EA,#DB2777);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:#9333EA;">PixelBlend</span>' +
  '</div>';
}
(function () {
  if (document.getElementById('pb-load-line-css')) return;
  var s = document.createElement('style');
  s.id = 'pb-load-line-css';
  s.textContent = '@keyframes pbLogoPulse{0%,100%{box-shadow:0 6px 16px rgba(196,46,139,.32)}50%{box-shadow:0 8px 22px rgba(236,72,153,.5)}}' +
    '.pb-logo-pulse{animation:pbLogoPulse 1.4s ease-in-out infinite}' +
    '@media (prefers-reduced-motion:reduce){.pb-logo-pulse{animation:none}}';
  (document.head || document.documentElement).appendChild(s);
})();
(function () {
  try {
    if (sessionStorage.getItem('pb-nav') !== '1') return;
    document.documentElement.classList.add('pb-nav-enter');

    var s = document.createElement('style');
    s.id = 'pb-nav-enter-css';
    s.textContent =
      /* Skip homepage boot splash (logo tile) */
      'html.pb-nav-enter.pb-booting,html.pb-nav-enter.pb-booting body{overflow:auto!important;background:#FAF4FB!important}' +
      'html.pb-nav-enter.pb-booting body{visibility:visible!important}' +
      'html.pb-nav-enter #pb-boot-cover{opacity:0!important;visibility:hidden!important;pointer-events:none!important;display:none!important}' +
      /* Force reveals / hero entrances visible (no delayed fade-in glitch) */
      'html.pb-nav-enter [data-reveal],html.pb-nav-enter .pb-reveal,html.pb-nav-enter .pb-reveal-scroll,html.pb-nav-enter .pb-pop,' +
      'html.pb-nav-enter .hiw-soft,html.pb-nav-enter .hiw-hero-enter,' +
      'html.pb-nav-enter .hero-anim-copy,html.pb-nav-enter .hero-anim-card,html.pb-nav-enter .hero-anim-proofs,html.pb-nav-enter .hero-anim-tri > div,html.pb-nav-enter .hero-anim-tri > .tri-op{' +
      'opacity:1!important;transform:none!important;transition:none!important;animation:none!important}' +
      /* Continuous pink veil until page signals ready (hides Softgen empty #dc-root + chrome-only flash) */
      '#pb-nav-enter-cover{position:fixed;inset:0;z-index:2147483646;background:#FAF4FB;opacity:1;pointer-events:auto;' +
      'transition:opacity .2s ease;-webkit-transition:opacity .2s ease}' +
      '#pb-nav-enter-cover.is-off{opacity:0;pointer-events:none}' +
      '@keyframes pbLogoPulse{0%,100%{box-shadow:0 6px 16px rgba(196,46,139,.32)}50%{box-shadow:0 8px 22px rgba(236,72,153,.5)}}' +
      '.pb-logo-pulse{animation:pbLogoPulse 1.4s ease-in-out infinite}' +
      '@media (prefers-reduced-motion:reduce){.pb-logo-pulse{animation:none}}';
    (document.head || document.documentElement).appendChild(s);

    function ensureCover() {
      if (document.getElementById('pb-nav-enter-cover')) return;
      var el = document.createElement('div');
      el.id = 'pb-nav-enter-cover';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = pbLoaderMark();
      (document.body || document.documentElement).appendChild(el);
    }
    ensureCover();

    function settleEntrances() {
      /* Inline locks so removing pb-nav-enter CSS does not restart fadeUp from opacity 0 */
      var heroSel =
        '.hero-anim-copy,.hero-anim-card,.hero-anim-proofs,.hero-anim-tri > div,.hero-anim-tri > .tri-op,' +
        '.hiw-hero-enter,.hiw-soft';
      Array.prototype.forEach.call(document.querySelectorAll(heroSel), function (el) {
        el.style.setProperty('animation', 'none', 'important');
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('transform', 'none', 'important');
        el.style.setProperty('transition', 'none', 'important');
        el.classList.add('is-in');
      });
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      Array.prototype.forEach.call(document.querySelectorAll('[data-reveal],.pb-reveal,.pb-reveal-scroll,.pb-pop'), function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh * 0.98) el.classList.add('is-in');
      });
    }

    var done = false;
    window.__pbNavReady = function () {
      if (done) return;
      done = true;
      try { sessionStorage.removeItem('pb-nav'); } catch (e) {}
      document.documentElement.classList.add('pb-nav-settled');
      try { settleEntrances(); } catch (e2) {}

      var cover = document.getElementById('pb-nav-enter-cover');
      if (cover && cover.parentNode) cover.parentNode.removeChild(cover);
      document.documentElement.classList.remove('pb-nav-enter');
      var css = document.getElementById('pb-nav-enter-css');
      if (css && css.parentNode) css.parentNode.removeChild(css);
      var leave = document.getElementById('pb-nav-leave');
      if (leave) {
        leave.classList.remove('is-on');
        leave.style.pointerEvents = 'none';
      }
    };

    /* Safety — never leave the veil forever */
    setTimeout(function () {
      if (document.documentElement.classList.contains('pb-nav-enter') && window.__pbNavReady) {
        window.__pbNavReady();
      }
    }, 2500);
  } catch (e) {}
})();
