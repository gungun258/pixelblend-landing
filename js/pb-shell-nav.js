/* Normalize Studio left nav: active item, top CTA, credits card */
(function () {
  var PLUS_ICON =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M12 5v14M5 12h14" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>' +
    '</svg>';

  function normalizePage(name) {
    var n = (name || '').toLowerCase().split('?')[0].split('#')[0];
    if (n.slice(-5) === '.html') n = n.slice(0, -5);
    return n;
  }

  function fileName() {
    try {
      var p = (location.pathname || '').split('/').pop() || '';
      return normalizePage(decodeURIComponent(p)) || 'dashboard';
    } catch (e) {
      return 'dashboard';
    }
  }

  function activeKey(file) {
    var f = normalizePage(file);
    if (f === 'discover' || f === 'results' || f === 'top-sellers' || f === 'followed-sellers' || f === 'all-listings') return 'discover';
    if (f === 'generate' || f === 'generating' || f === 'generated-result') return 'generate';
    if (f === 'gallery') return 'gallery';
    if (f === 'login' || f === 'signup' || f === 'forgot-password' || f === 'verify-otp' || f === 'reset-password') return '';
    if (
      f === 'account' ||
      f === 'edit-profile' ||
      f === 'settings' ||
      f === 'buy-credits' ||
      f === 'notifications' ||
      f === 'wishlist' ||
      f === 'referrals' ||
      f === 'refunds' ||
      f === 'faqs' ||
      f === 'privacy-policy' ||
      f === 'terms-of-service' ||
      f === 'contact-support' ||
      f === 'seller-dashboard' ||
      f === 'seller-profile' ||
      f === 'seller-benefits'
    ) return 'account';
    return 'home';
  }

  function hrefKey(href) {
    var h = normalizePage((href || '').split('?')[0].split('#')[0].split('/').pop());
    if (h === 'dashboard' || h === '' || h === 'index' || h === 'home') return 'home';
    if (h === 'discover' || h === 'results' || h === 'top-sellers' || h === 'followed-sellers' || h === 'all-listings') return 'discover';
    if (h === 'generate' || h === 'generating' || h === 'generated-result') return 'generate';
    if (h === 'gallery') return 'gallery';
    if (h === 'account') return 'account';
    return '';
  }

  function restoreTopCta(root) {
    var btn = root.querySelector('.pb-newblend');
    if (!btn) {
      /* Re-insert original top CTA if it was removed from markup */
      var brand = root.querySelector('.pb-brand');
      var nav = root.querySelector('.pb-nav');
      if (!brand || !nav) return;
      btn = document.createElement('a');
      btn.className = 'pb-newblend';
      btn.href = 'generate.html';
      brand.insertAdjacentElement('afterend', btn);
    }
    btn.style.display = '';
    btn.setAttribute('href', 'generate.html');
    btn.setAttribute('aria-label', 'New blend');
    var orb = btn.querySelector('.pb-gen-orb');
    if (orb) orb.remove();
    var label = btn.querySelector('.pb-label');
    if (!label) {
      Array.prototype.forEach.call(btn.childNodes, function (node) {
        if (node.nodeType === 3 && node.textContent.trim()) node.textContent = '';
      });
      label = document.createElement('span');
      label.className = 'pb-label';
      btn.appendChild(label);
    }
    label.textContent = 'New blend';
    var svg = btn.querySelector('svg');
    if (!svg || btn.querySelector('.pb-gen-ico')) {
      if (svg) svg.remove();
      btn.insertAdjacentHTML('afterbegin', PLUS_ICON);
    }
  }

  /* App Generate orb — reference match: gradient circle + outline sparkle + 2 mini sparkles */
  var GEN_ORB =
    '<span class="pb-gen-orb" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none">' +
        '<path d="M12 2.8L13.35 9.55 20.2 10.9 13.35 12.25 12 19 10.65 12.25 3.8 10.9 10.65 9.55Z" stroke="#fff" stroke-width="1.85" stroke-linejoin="round"/>' +
        '<path d="M18.35 3.6l.48 1.35 1.35.48-1.35.48-.48 1.35-.48-1.35-1.35-.48 1.35-.48z" fill="#fff"/>' +
        '<path d="M17.55 15.35l.38 1.08 1.08.38-1.08.38-.38 1.08-.38-1.08-1.08-.38 1.08-.38z" fill="#fff"/>' +
      '</svg>' +
    '</span>';

  function enhanceGenerateNavIcon(root) {
    root.querySelectorAll('.pb-nav > a').forEach(function (a) {
      if (hrefKey(a.getAttribute('href')) !== 'generate') return;
      a.classList.add('pb-nav-generate');
      var orb = a.querySelector('.pb-gen-orb');
      if (orb) orb.outerHTML = GEN_ORB;
      else a.insertAdjacentHTML('afterbegin', GEN_ORB);
      var label = a.querySelector('.pb-navlabel');
      if (label) label.textContent = 'Generate';
    });
  }

  function setActiveNav(root, key) {
    var links = root.querySelectorAll('.pb-nav > a');
    if (!links.length) return;
    links.forEach(function (a) {
      a.classList.remove('active');
      if (a.getAttribute('style')) {
        var s = a.getAttribute('style') || '';
        if (/background|#C42E8B|#FBEEF6|font-weight/i.test(s) && hrefKey(a.getAttribute('href'))) {
          a.style.background = '';
          a.style.color = '';
          a.style.fontWeight = '';
        }
      }
      if (hrefKey(a.getAttribute('href')) === key) a.classList.add('active');
    });
  }

  function ensureCredits(root) {
    var box = root.querySelector('.pb-credits');
    if (!box) return;
    if (!box.querySelector('.pb-credits-cta')) {
      box.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;">' +
          '<span style="font-size:10px;font-weight:700;color:#8A7E92;letter-spacing:.02em;">Credits left</span>' +
          '<span style="font-size:13.5px;font-weight:800;color:#1E1422;letter-spacing:-.02em;">150</span>' +
        '</div>' +
        '<div style="height:6px;border-radius:999px;background:#F0E6F2;overflow:hidden;margin-bottom:11px;">' +
          '<div style="height:100%;width:75%;border-radius:999px;background:linear-gradient(90deg,#A855F7,#EC4899,#F43F5E);"></div>' +
        '</div>' +
        '<a href="buy-credits.html" class="pb-credits-cta"><span style="font-size:11px;line-height:1;">⚡</span> Get more credits</a>';
    }
  }

  function isLoggedIn() {
    try {
      if (window.pbAuth) return pbAuth.isLoggedIn();
      return !!localStorage.getItem('pb-studio-auth');
    } catch (e) {
      return false;
    }
  }

  function clearStudioSession() {
    try {
      if (window.pbAuth) pbAuth.logout();
      else localStorage.removeItem('pb-studio-auth');
      sessionStorage.removeItem('pb-last-generate');
      sessionStorage.removeItem('pb-prefill-bg');
      sessionStorage.removeItem('pb-prefill-bg-title');
      sessionStorage.removeItem('pb-prefill-listing');
      sessionStorage.removeItem('pb-prefill-source');
      sessionStorage.removeItem('pb-gallery-saved-for');
      sessionStorage.removeItem('pb-listing-fallback');
    } catch (e) {}
  }

  var LOGOUT_ICO =
    '<span class="pb-ico" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none">' +
      '<path d="M10 7V5.8A1.8 1.8 0 0111.8 4h6.4A1.8 1.8 0 0120 5.8v12.4a1.8 1.8 0 01-1.8 1.8h-6.4A1.8 1.8 0 0110 18.2V17" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>' +
      '<path d="M14 12H4m0 0l2.8-2.8M4 12l2.8 2.8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg></span>';
  var SUPPORT_ICO =
    '<span class="pb-ico" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none">' +
      '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>' +
      '<path d="M9.5 9.2a2.5 2.5 0 114.1 1.9c-.7.6-1.6 1.1-1.6 2.4V14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '<circle cx="12" cy="17" r=".9" fill="currentColor"/>' +
    '</svg></span>';

  /* Footer: Log out → Support → credits */
  function ensureAuthButton(root) {
    var credits = root.querySelector('.pb-credits');
    if (!credits) return;

    var foot = root.querySelector('.pb-sidebar-foot');
    if (!foot) {
      foot = document.createElement('div');
      foot.className = 'pb-sidebar-foot';
      credits.parentNode.insertBefore(foot, credits);
      foot.appendChild(credits);
    } else if (credits.parentNode !== foot) {
      foot.appendChild(credits);
    }

    var existing = foot.querySelector('.pb-auth-btn');
    if (!existing) {
      existing = document.createElement('button');
      existing.className = 'pb-auth-btn';
      existing.type = 'button';
      foot.insertBefore(existing, credits);
    } else if (existing.tagName === 'A') {
      var btn = document.createElement('button');
      btn.className = 'pb-auth-btn';
      btn.type = 'button';
      existing.parentNode.replaceChild(btn, existing);
      existing = btn;
    }

    existing.type = 'button';
    existing.removeAttribute('href');
    if (isLoggedIn()) {
      existing.classList.remove('is-login');
      existing.innerHTML = LOGOUT_ICO + '<span class="pb-auth-label">Log out</span>';
      existing.onclick = function (e) {
        e.preventDefault();
        clearStudioSession();
        window.location.href = 'dashboard.html';
      };
    } else {
      existing.classList.add('is-login');
      existing.innerHTML = LOGOUT_ICO + '<span class="pb-auth-label">Log in</span>';
      existing.onclick = function (e) {
        e.preventDefault();
        var next = (location.pathname.split('/').pop() || 'dashboard.html') + (location.search || '');
        window.location.href = 'login.html?next=' + encodeURIComponent(next);
      };
    }

    var support = foot.querySelector('.pb-support-btn');
    if (!support) {
      support = document.createElement('a');
      support.className = 'pb-support-btn';
      foot.insertBefore(support, credits);
    }
    support.setAttribute('href', 'account.html#ac-support');
    support.innerHTML = SUPPORT_ICO + '<span class="pb-auth-label">Support</span>';

    foot.insertBefore(existing, credits);
    foot.insertBefore(support, credits);
  }

  function run() {
    var sidebars = document.querySelectorAll('.pb-sidebar');
    if (!sidebars.length) return;
    var key = activeKey(fileName());
    sidebars.forEach(function (side) {
      restoreTopCta(side);
      enhanceGenerateNavIcon(side);
      setActiveNav(side, key);
      ensureCredits(side);
      ensureAuthButton(side);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  setTimeout(run, 80);
  setTimeout(run, 400);
})();
