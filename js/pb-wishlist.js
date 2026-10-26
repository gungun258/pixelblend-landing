/* PixelBlend Studio — wishlist (localStorage) + heart binding */
(function (global) {
  var KEY = 'pb-wishlist';
  var INIT = 'pb-wishlist-seeded';
  var MAX = 60;

  var SEED = [
    { id: 'rustic-charm', title: 'Rustic Charm', seller: 'Visual Vibes', tag: 'Nature', img: 'assets/dashboard/images/img2.jpg', trending: true, at: 1 },
    { id: 'studio-softbox', title: 'Studio Softbox', seller: 'Pixel House', tag: 'Studio', img: 'assets/dashboard/images/img5.jpg', trending: true, at: 2 },
    { id: 'marble-luxe', title: 'Marble Luxe', seller: 'Arclight Co', tag: 'Product', img: 'assets/dashboard/images/img8.jpg', trending: false, at: 3 },
    { id: 'golden-hour', title: 'Golden Hour', seller: 'Scene Lab', tag: 'Outdoor', img: 'assets/dashboard/images/img12.jpg', trending: true, at: 4 }
  ];

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return [];
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function write(list) {
    var next = Array.isArray(list) ? list.slice(0, MAX) : [];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      return true;
    } catch (e) {
      return false;
    }
  }

  function ensureSeed() {
    try {
      if (localStorage.getItem(INIT)) return;
      if (!read().length) write(SEED.slice());
      localStorage.setItem(INIT, '1');
    } catch (e) {}
  }

  function slug(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || ('item-' + Date.now());
  }

  function has(id) {
    if (!id) return false;
    return read().some(function (x) { return x.id === id; });
  }

  function list() {
    ensureSeed();
    return read().slice().sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
  }

  function remove(id) {
    if (!id) return false;
    var next = read().filter(function (x) { return x.id !== id; });
    write(next);
    syncHearts();
    return true;
  }

  function upsert(item) {
    if (!item || !item.id) return null;
    var cur = read().filter(function (x) { return x.id !== item.id; });
    cur.unshift({
      id: item.id,
      title: item.title || 'Background',
      seller: item.seller || 'Seller',
      tag: item.tag || 'Scene',
      img: item.img || '',
      trending: !!item.trending,
      at: Date.now()
    });
    write(cur);
    return cur[0];
  }

  function toggle(item) {
    if (!item || !item.id) return { on: false };
    if (has(item.id)) {
      remove(item.id);
      return { on: false, item: item };
    }
    upsert(item);
    return { on: true, item: item };
  }

  function paint(btn, on) {
    if (!btn) return;
    btn.classList.toggle('is-liked', !!on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    var path = btn.querySelector('.pb-heart-path, .sp-heart-path, path');
    if (path) {
      if (on) {
        path.setAttribute('fill', '#EC4899');
        path.setAttribute('stroke', '#EC4899');
      } else {
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#EC4899');
      }
    }
    if (btn.classList.contains('tr') || btn.getAttribute('data-wish-btn') === 'emoji') {
      btn.textContent = on ? '♥' : '♡';
      btn.style.color = '#EC4899';
    }
  }

  function itemFromButton(btn) {
    if (!btn) return null;
    var card =
      btn.closest('[data-wish-id]') ||
      btn.closest('.pb-trend-card') ||
      btn.closest('.dc-bg') ||
      btn.closest('.sp-card') ||
      btn.closest('.wl-card') ||
      btn.parentElement;

    var id = btn.getAttribute('data-wish-id') || (card && card.getAttribute('data-wish-id'));
    var title = btn.getAttribute('data-wish-title') || (card && card.getAttribute('data-wish-title'));
    var img = btn.getAttribute('data-wish-img') || (card && card.getAttribute('data-wish-img'));
    var seller = btn.getAttribute('data-wish-seller') || (card && card.getAttribute('data-wish-seller')) || 'Seller';
    var tag = btn.getAttribute('data-wish-tag') || (card && card.getAttribute('data-wish-tag')) || 'Scene';
    var trending = (btn.getAttribute('data-wish-trending') || (card && card.getAttribute('data-wish-trending'))) === '1';

    if (card && card.classList.contains('pb-trend-card')) {
      var blend = card.querySelector('.pb-blend-btn');
      var listing = card.getAttribute('data-listing') || '';
      if (!id && listing) {
        var m = listing.match(/[?&]id=([^&]+)/);
        id = m ? decodeURIComponent(m[1]) : slug(listing);
      }
      if (!title && blend) title = blend.getAttribute('data-title') || '';
      if (!img && blend) img = blend.getAttribute('data-bg') || '';
      trending = true;
      seller = seller === 'Seller' ? 'Trending' : seller;
      tag = tag === 'Scene' ? 'Background' : tag;
    }

    if (card && card.classList.contains('dc-bg')) {
      var dimg = card.querySelector('img');
      if (!img && dimg) img = dimg.getAttribute('src') || '';
      if (!id) {
        var base = (img || '').split('/').pop() || '';
        id = slug(base.replace(/\.[^.]+$/, '') || title || 'discover');
      }
      if (!title) title = (img || '').split('/').pop().replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') || 'Background';
      title = title.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      seller = seller === 'Seller' ? 'Discover' : seller;
      trending = !!card.querySelector('.tl');
    }

    if (card && card.classList.contains('sp-card')) {
      var href = card.getAttribute('href') || '';
      if (!id) {
        var m2 = href.match(/[?&]id=([^&]+)/);
        id = m2 ? decodeURIComponent(m2[1]) : slug(href);
      }
      if (!title) {
        var h3 = card.querySelector('.sp-card-title');
        title = h3 ? h3.textContent.trim() : 'Background';
      }
      if (!img) {
        var simg = card.querySelector('.sp-card-media img');
        img = simg ? simg.getAttribute('src') : '';
      }
      trending = !!card.querySelector('.sp-trend');
      var nameEl = document.getElementById('sp-name');
      if (seller === 'Seller' && nameEl) seller = nameEl.textContent.trim() || seller;
    }

    if (!id) id = slug(title || img);
    if (!title) title = 'Background';
    if (!img) img = 'assets/dashboard/images/img2.jpg';

    return { id: id, title: title, seller: seller, tag: tag, img: img, trending: trending };
  }

  var toastEl;
  var toastT;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.setAttribute('role', 'status');
      toastEl.style.cssText =
        'position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(16px);' +
        'background:#1E1422;color:#fff;padding:12px 18px;border-radius:999px;' +
        'font-size:13px;font-weight:700;opacity:0;pointer-events:none;' +
        'transition:.25s ease;z-index:200;font-family:inherit;';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    toastEl.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toastT);
    toastT = setTimeout(function () {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateX(-50%) translateY(16px)';
    }, 2000);
  }

  function syncHearts(root) {
    ensureSeed();
    var scope = root || document;
    scope.querySelectorAll('.pb-heart-btn, .sp-heart, .dc-bg .tr, [data-pb-wish]').forEach(function (btn) {
      var item = itemFromButton(btn);
      if (!item) return;
      paint(btn, has(item.id));
    });
  }

  function bind(btn) {
    if (!btn || btn.__pbWishBound) return;
    btn.__pbWishBound = true;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var item = itemFromButton(btn);
      if (!item) return;
      var res = toggle(item);
      paint(btn, res.on);
      toast(res.on ? 'Saved to Wishlist · ' + item.title : 'Removed from Wishlist');
      try {
        global.dispatchEvent(new CustomEvent('pb-wishlist-change', { detail: res }));
      } catch (err) {}
    });
  }

  function bindAll(root) {
    ensureSeed();
    var scope = root || document;
    scope.querySelectorAll('.pb-heart-btn, .sp-heart, .dc-bg .tr, [data-pb-wish]').forEach(bind);
    syncHearts(scope);
  }

  // Auto-bind after DOM ready + observe late-rendered cards (dashboard sc-for)
  function boot() {
    ensureSeed();
    bindAll(document);
    try {
      var obs = new MutationObserver(function (muts) {
        var need = false;
        muts.forEach(function (m) {
          m.addedNodes && m.addedNodes.forEach(function (n) {
            if (n.nodeType !== 1) return;
            if (
              n.matches &&
              (n.matches('.pb-heart-btn, .sp-heart, .dc-bg .tr, [data-pb-wish]') ||
                n.querySelector &&
                n.querySelector('.pb-heart-btn, .sp-heart, .dc-bg .tr, [data-pb-wish]'))
            ) {
              need = true;
            }
          });
        });
        if (need) bindAll(document);
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.pbWishlist = {
    list: list,
    has: has,
    toggle: toggle,
    remove: remove,
    upsert: upsert,
    bindAll: bindAll,
    syncHearts: syncHearts,
    itemFromButton: itemFromButton,
    paint: paint,
    toast: toast,
    ensureSeed: ensureSeed
  };
})(typeof window !== 'undefined' ? window : this);
