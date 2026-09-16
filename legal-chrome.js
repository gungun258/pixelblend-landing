(function () {
  function ix(href) {
    if (href.charAt(0) === '#') return 'index.html' + href;
    if (/\.html$/.test(href)) return href;
    return href;
  }

  var drawerLinks = [
    { label: 'How it works', href: 'how-it-works.html' },
    { label: 'Marketplace', href: '#marketplace' },
    { label: 'Sellers', href: '#sellers' },
    { label: 'Pricing', href: 'pricing.html' },
    { label: 'Gallery', href: 'gallery.html' },
    { label: 'FAQ', href: 'faq.html' }
  ];

  var footerCols = [
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: 'about.html' },
        { label: 'Contact Us', href: 'contact.html' },
        { label: 'Leave us Feedback', href: 'contact.html' },
        { label: 'Gallery', href: 'gallery.html' }
      ]
    },
    {
      title: 'Useful Links',
      links: [
        { label: 'Pricing', href: 'pricing.html' },
        { label: 'FAQs', href: 'faq.html' },
        { label: 'How It Works', href: 'how-it-works.html' },
        { label: 'Terms of use', href: 'terms.html' },
        { label: 'Privacy Policy', href: 'privacy.html' },
        { label: 'Refund Policy', href: 'refund.html' }
      ]
    }
  ];

  var socials = ['\uD835\uDD4F', '\u25CE', '\u25B6', 'in'];

  function linkRow(links) {
    return links.map(function (l) {
      return '<a href="' + ix(l.href) + '" style="font-size: 14.5px; color: rgba(255,255,255,.78); text-decoration: none;">' + l.label + '</a>';
    }).join('');
  }

  function drawerRow() {
    return drawerLinks.map(function (l) {
      return '<a href="' + ix(l.href) + '" data-pb-close style="font-size: 18px; font-weight: 700; color: #1E1422; text-decoration: none; padding: 15px 4px; border-bottom: 1px solid #F0E6F2;">' + l.label + '</a>';
    }).join('');
  }

  var headerHtml =
    '<nav>' +
      '<div style="max-width: 1160px; margin: 0 auto; padding: 0 32px; height: 72px; display: flex; align-items: center; justify-content: space-between;">' +
        '<a href="index.html" style="display: flex; align-items: center; gap: 11px; text-decoration: none;">' +
          '<span class="pb-logo-mark" style="width: 34px; height: 34px; border-radius: 11px; background: linear-gradient(113.667deg, #A855F7, #EC4899, #F43F5E); display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(196,46,139,.32);">' +
            '<span style="width: 13px; height: 13px; border: 2.5px solid #fff; border-radius: 50%;"></span>' +
          '</span>' +
          '<span class="pb-logo-word">PixelBlend</span>' +
        '</a>' +
        '<div style="display: flex; align-items: center; gap: 12px;" class="nav-cta">' +
          '<a href="' + ix('#hero-cta') + '" style="font-size: 14.5px; font-weight: 600; color: #1E1422; text-decoration: none;" class="nav-dl">Log in</a>' +
          '<a href="' + ix('#download') + '" style="font-size: 14.5px; font-weight: 700; color: #1E1422; text-decoration: none; padding: 9px 16px; border-radius: 999px; border: 1.5px solid #F0E6F2; background: #fff; display: inline-flex; align-items: center; gap: 6px;">Download App</a>' +
          '<a href="' + ix('#hero-cta') + '" style="font-size: 14.5px; font-weight: 700; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 999px; background: linear-gradient(113.667deg, #A855F7, #EC4899, #F43F5E); box-shadow: 0 8px 20px rgba(236,72,153,.35);">Open Studio</a>' +
        '</div>' +
        '<button type="button" aria-label="Open menu" class="nav-burger" data-pb-menu-open style="width: 46px; height: 46px; border-radius: 14px; border: 1.5px solid #F0E6F2; background: #fff; cursor: pointer; align-items: center; justify-content: center; box-shadow: 0 4px 14px -8px rgba(196,46,139,.5); padding: 0;">' +
          '<span style="display: flex; flex-direction: column; gap: 4px; align-items: center;">' +
            '<span style="width: 19px; height: 2.4px; border-radius: 2px; background: #1E1422;"></span>' +
            '<span style="width: 19px; height: 2.4px; border-radius: 2px; background: #1E1422;"></span>' +
            '<span style="width: 19px; height: 2.4px; border-radius: 2px; background: #1E1422;"></span>' +
          '</span>' +
        '</button>' +
      '</div>' +
    '</nav>' +
    '<div class="pb-drawer-backdrop" data-pb-menu-close aria-hidden="true"></div>' +
    '<aside class="pb-drawer" aria-hidden="true">' +
      '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">' +
        '<a href="index.html" data-pb-close style="display: flex; align-items: center; gap: 10px; text-decoration: none;">' +
          '<span class="pb-logo-mark" style="width: 32px; height: 32px; border-radius: 11px; background: linear-gradient(113.667deg, #A855F7, #EC4899, #F43F5E); display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(196,46,139,.32);"><span style="width: 12px; height: 12px; border: 2.5px solid #fff; border-radius: 50%;"></span></span>' +
          '<span class="pb-logo-word" style="font-size: 18px;">PixelBlend</span>' +
        '</a>' +
        '<button type="button" data-pb-menu-close aria-label="Close menu" style="width: 40px; height: 40px; border-radius: 12px; border: 1px solid #F0E6F2; background: #fff; cursor: pointer; font-size: 20px; color: #1E1422; line-height: 1; display: flex; align-items: center; justify-content: center;">\u2715</button>' +
      '</div>' +
      '<div class="pb-drawer-links" style="display: flex; flex-direction: column; margin-top: 14px;">' + drawerRow() + '</div>' +
      '<div class="pb-drawer-cta" style="display: flex; flex-direction: column; gap: 12px; margin-top: auto; padding-top: 24px;">' +
        '<a href="' + ix('#download') + '" data-pb-close style="text-align: center; font-size: 16px; font-weight: 700; color: #1E1422; text-decoration: none; padding: 14px; border-radius: 999px; border: 1.5px solid #F0E6F2; background: #fff;">Download App</a>' +
        '<a href="' + ix('#hero-cta') + '" data-pb-close style="text-align: center; font-size: 16px; font-weight: 700; color: #fff; text-decoration: none; padding: 15px; border-radius: 999px; background: linear-gradient(113.667deg, #A855F7, #EC4899, #F43F5E); box-shadow: 0 10px 26px rgba(236,72,153,.4);">Open Studio — Free</a>' +
        '<a href="' + ix('#hero-cta') + '" data-pb-close style="text-align: center; font-size: 14.5px; font-weight: 600; color: #5b5060; text-decoration: none; padding: 4px;">Log in</a>' +
      '</div>' +
    '</aside>';

  var footerHtml =
    '<footer style="background: linear-gradient(160deg, #2A1240, #3E1850); color: #fff; padding: 52px 32px 36px;">' +
      '<div style="max-width: 1160px; margin: 0 auto;">' +
        '<div style="display: grid; grid-template-columns: 1.7fr 1fr 1.15fr 1fr; gap: 40px; padding-bottom: 48px; border-bottom: none;" class="footer-grid">' +
          '<div>' +
            '<a href="index.html" style="display: flex; align-items: center; gap: 11px; text-decoration: none; margin-bottom: 18px;">' +
              '<span style="width: 34px; height: 34px; border-radius: 11px; background: linear-gradient(113.667deg, #A855F7, #EC4899, #F43F5E); display: flex; align-items: center; justify-content: center;"><span style="width: 13px; height: 13px; border: 2.5px solid #fff; border-radius: 50%;"></span></span>' +
              '<span style="font-size: 19px; font-weight: 800; color: #fff;">PixelBlend</span>' +
            '</a>' +
            '<p style="font-size: 14.5px; line-height: 1.6; color: rgba(255,255,255,.62); margin: 0; max-width: 280px;">AI background blend for the way brands create next. Any product, any scene, in seconds.</p>' +
            '<div class="store-btns footer-stores">' +
              '<a href="' + ix('#download') + '" class="store-btn store-badge" aria-label="Download on the App Store">' +
                '<svg viewBox="0 0 384 512" width="22" height="26" aria-hidden="true"><path fill="#fff" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"></path></svg>' +
                '<span><small>Download on the</small><strong>App Store</strong></span>' +
              '</a>' +
              '<a href="' + ix('#download') + '" class="store-btn store-badge" aria-label="Get it on Google Play">' +
                '<svg viewBox="0 0 512 512" width="22" height="24" aria-hidden="true">' +
                  '<path fill="#00C3FF" d="M60 42 60 470 274 256z"></path>' +
                  '<path fill="#00E676" d="M60 42 274 256 392 150z"></path>' +
                  '<path fill="#FF3D47" d="M60 470 274 256 392 362z"></path>' +
                  '<path fill="#FFCE00" d="M392 150 452 256 392 362 274 256z"></path>' +
                '</svg>' +
                '<span><small>GET IT ON</small><strong>Google Play</strong></span>' +
              '</a>' +
            '</div>' +
          '</div>' +
          footerCols.map(function (col) {
            return '<div><div style="font-size: 13px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: rgba(255,255,255,.5); margin-bottom: 16px;">' + col.title + '</div>' +
              '<div style="display: flex; flex-direction: column; gap: 11px;">' + linkRow(col.links) + '</div></div>';
          }).join('') +
          '<div>' +
            '<div style="font-size: 13px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: rgba(255,255,255,.5); margin-bottom: 16px;">Stay Connected</div>' +
            '<div style="display: flex; flex-wrap: wrap; gap: 10px;">' +
              '<a href="mailto:hello@pixelblend.app" aria-label="Email us" style="width: 38px; height: 38px; border-radius: 10px; background: rgba(255,255,255,.08); display: flex; align-items: center; justify-content: center; font-size: 14px; color: #fff; text-decoration: none;">@</a>' +
              '<a href="contact.html" aria-label="Contact" style="width: 38px; height: 38px; border-radius: 10px; background: rgba(255,255,255,.08); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; text-decoration: none;">in</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="pb-footer-guarantees">' +
          '<a class="pb-fg" href="refund.html" style="text-decoration:none;color:inherit"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"></rect><path d="M2 10h20"></path></svg><div><strong>Money-Back Guarantee</strong><p>Don\'t like your result? Get a refund.</p></div></a>' +
          '<a class="pb-fg" href="privacy.html" style="text-decoration:none;color:inherit"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg><div><strong>Privacy First</strong><p>Your photos are private and secure.</p></div></a>' +
          '<a class="pb-fg" href="contact.html" style="text-decoration:none;color:inherit"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M8 10h.01M12 10h.01M16 10h.01"></path></svg><div><strong>Customer Support</strong><p>Friendly customer support</p></div></a>' +
        '</div>' +
        '<div class="pb-footer-copy"><span>\u00A9 2026 PixelBlend Technologies. All rights reserved.</span></div>' +
      '</div>' +
    '</footer>';

  var headerEl = document.getElementById('pb-chrome-header');
  var footerEl = document.getElementById('pb-chrome-footer');
  if (headerEl) headerEl.innerHTML = headerHtml;
  if (footerEl) footerEl.innerHTML = footerHtml;
  document.body.classList.add('lp-page');

  var strayBack = document.querySelector('.lp-back');
  if (strayBack) strayBack.remove();
  var titleRow = document.querySelector('.lp-title-row');
  if (titleRow) {
    var nestedTitle = titleRow.querySelector('h1');
    if (nestedTitle) titleRow.parentNode.insertBefore(nestedTitle, titleRow);
    titleRow.remove();
  }

  /* Breadcrumbs — inside page content (above title), not header chrome */
  (function mountBreadcrumbs() {
    var labels = {
      'how-it-works.html': 'How it works',
      'gallery.html': 'Gallery',
      'about.html': 'About',
      'faq.html': 'FAQ',
      'pricing.html': 'Pricing',
      'contact.html': 'Contact',
      'privacy.html': 'Privacy Policy',
      'terms.html': 'Terms of use',
      'refund.html': 'Refund Policy'
    };
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    if (!file || file === 'index.html' || file === '') return;
    var label = labels[file];
    if (!label) {
      var t = document.title || '';
      label = t.replace(/\s*[\u2014\u2013|].*$/, '').trim() || 'Page';
    }

    Array.prototype.forEach.call(document.querySelectorAll('.lp-crumbs, .lp-crumb-bar'), function (el) {
      el.remove();
    });

    if (!document.getElementById('pb-crumbs-css')) {
      var css = document.createElement('style');
      css.id = 'pb-crumbs-css';
      css.textContent =
        '.lp-crumb-bar{position:relative;z-index:1;background:transparent;border:none;margin:0 0 14px;padding:0}' +
        '.lp-crumb-bar-inner{max-width:none;margin:0;padding:0}' +
        'nav.lp-crumbs{position:static!important;top:auto!important;left:auto!important;right:auto!important;width:auto!important;z-index:auto!important;background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;border:none!important;border-radius:0!important;box-shadow:none!important;display:flex;flex-wrap:wrap;align-items:center;gap:0;margin:0;padding:0;font-size:13px;font-weight:500;line-height:1.35;letter-spacing:.01em;color:#6B6170;font-family:inherit}' +
        '.lp-crumbs a{color:#6B6170;text-decoration:none;font-weight:500;transition:color .15s ease}' +
        '.lp-crumbs a:hover{color:#1E1422}' +
        '.lp-crumbs-sep{display:inline-block;flex:none;margin:0 9px;color:#C4B8C8;font-weight:400;font-size:13px;line-height:1;user-select:none}' +
        '.lp-crumbs [aria-current="page"]{color:#1E1422;font-weight:600}' +
        '.hiw-hero-copy > .lp-crumb-bar,' +
        '.gal-hero-copy > .lp-crumb-bar,' +
        '.ab-hero-copy > .lp-crumb-bar{margin:0 0 16px}' +
        '.hiw-hero-copy > .lp-crumb-bar,' +
        '.ab-hero-copy > .lp-crumb-bar{display:flex;justify-content:center}' +
        '.lp-wrap > .lp-crumb-bar{margin:0 0 12px}' +
        '@media (max-width:720px){nav.lp-crumbs{font-size:12.5px}.lp-crumbs-sep{margin:0 7px}' +
        '.hiw-hero-copy > .lp-crumb-bar,.gal-hero-copy > .lp-crumb-bar,.ab-hero-copy > .lp-crumb-bar{margin:0 0 12px}}';
      document.head.appendChild(css);
    }

    var bar = document.createElement('div');
    bar.className = 'lp-crumb-bar';
    bar.innerHTML =
      '<div class="lp-crumb-bar-inner">' +
        '<nav class="lp-crumbs" aria-label="Breadcrumb">' +
          '<a href="index.html">Home</a>' +
          '<span class="lp-crumbs-sep" aria-hidden="true">/</span>' +
          '<span aria-current="page">' + label + '</span>' +
        '</nav>' +
      '</div>';

    var slot =
      document.querySelector('[data-pb-crumbs]') ||
      document.querySelector('.lp-wrap') ||
      document.querySelector('.hiw-hero-copy') ||
      document.querySelector('.gal-hero-copy') ||
      document.querySelector('.ab-hero-copy');

    if (slot) {
      if (slot.hasAttribute('data-pb-crumbs')) {
        slot.appendChild(bar);
      } else {
        slot.insertBefore(bar, slot.firstChild);
      }
      return;
    }

    var header = document.getElementById('pb-chrome-header');
    if (!header || !header.parentNode) return;
    if (header.nextSibling) header.parentNode.insertBefore(bar, header.nextSibling);
    else header.parentNode.appendChild(bar);
  })();

  function setMenu(open) {
    document.body.classList.toggle('pb-menu-open', open);
    var backdrop = document.querySelector('.pb-drawer-backdrop');
    var drawer = document.querySelector('.pb-drawer');
    if (backdrop) backdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (drawer) drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-pb-menu-open]')) {
      e.preventDefault();
      setMenu(true);
      return;
    }
    if (e.target.closest('[data-pb-menu-close]') || e.target.closest('[data-pb-close]')) {
      setMenu(false);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* Same back-to-top button as homepage — all chrome pages */
  (function mountBackToTop() {
    function scrollY() {
      return Math.max(window.pageYOffset || 0, document.documentElement.scrollTop || 0, document.body.scrollTop || 0);
    }
    function setY(y) {
      /* Must be instant — legal.css has scroll-behavior:smooth which
         otherwise slows every RAF step and feels much slower than home. */
      var root = document.documentElement;
      var prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      try {
        window.scrollTo({ top: y, left: 0, behavior: 'auto' });
      } catch (e) {
        window.scrollTo(0, y);
      }
      root.scrollTop = y;
      document.body.scrollTop = y;
      root.style.scrollBehavior = prev;
    }
    function ensureCss() {
      if (document.getElementById('pb-to-top-page-css')) return;
      var css = document.createElement('style');
      css.id = 'pb-to-top-page-css';
      css.textContent =
        '#pb-to-top{position:fixed!important;right:22px!important;bottom:calc(22px + env(safe-area-inset-bottom,0px) + var(--pb-vv-bottom,0px))!important;left:auto!important;z-index:99999!important;width:48px!important;height:48px!important;border:none!important;border-radius:50%!important;cursor:pointer;display:flex!important;align-items:center;justify-content:center;color:#fff!important;background:linear-gradient(113.667deg,#A855F7,#EC4899,#F43F5E)!important;box-shadow:0 12px 28px -10px rgba(196,46,139,.55);opacity:0!important;visibility:hidden!important;pointer-events:none!important;transform:translateY(18px) scale(.88);transition:opacity .32s cubic-bezier(.22,1,.36,1),transform .32s cubic-bezier(.22,1,.36,1),visibility .32s ease}' +
        '#pb-to-top.pb-layout.pb-on,#pb-to-top.pb-on{opacity:1!important;visibility:visible!important;pointer-events:auto!important;transform:none}' +
        '#pb-to-top:hover{filter:brightness(1.05)}';
      document.head.appendChild(css);
    }
    function boot() {
      ensureCss();
      if (document.getElementById('pb-to-top')) return;

      var going = false;
      function shouldShow() {
        if (going) return false;
        var y = scrollY();
        var vh = window.innerHeight || 600;
        return y > Math.min(220, vh * 0.35);
      }
      function sync(btn) {
        if (!btn) return;
        btn.classList.add('pb-layout');
        if (shouldShow()) btn.classList.add('pb-on');
        else btn.classList.remove('pb-on');
      }

      var btn = document.createElement('button');
      btn.id = 'pb-to-top';
      btn.type = 'button';
      btn.className = 'pb-layout';
      btn.setAttribute('aria-label', 'Back to top');
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
      btn.addEventListener('click', function () {
        if (going) return;
        var start = scrollY();
        if (start < 1) {
          sync(btn);
          return;
        }
        going = true;
        btn.classList.remove('pb-on');
        var t0 = performance.now();
        var dur = 700;
        function tick(now) {
          var p = (now - t0) / dur;
          if (p > 1) p = 1;
          var ease = 1 - Math.pow(1 - p, 3);
          setY(start * (1 - ease));
          if (p < 1) requestAnimationFrame(tick);
          else {
            setY(0);
            going = false;
            sync(btn);
          }
        }
        requestAnimationFrame(tick);
      });

      function onScroll() { sync(btn); }
      window.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('scroll', onScroll, { passive: true, capture: true });
      window.addEventListener('resize', onScroll);

      (document.body || document.documentElement).appendChild(btn);
      sync(btn);
    }

    if (document.body) boot();
    else document.addEventListener('DOMContentLoaded', boot);
  })();
})();
