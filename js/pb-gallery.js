/* PixelBlend Studio gallery — localStorage list + unread sidebar badge */
(function (global) {
  var GEN_KEY = 'pb-gallery-generated';
  var UP_KEY = 'pb-gallery-uploads';
  var MAX_ITEMS = 40;

  /* Your 4 generations — static in repo so client sees them after deploy */
  var SEED_GENERATED = [
    {
      id: "user-gen-1",
      source: "assets/gallery-seed/gen-1-source.jpg",
      background: "assets/gallery-seed/gen-1-bg.jpg",
      result: "assets/gallery-seed/gen-1-result.jpg",
      at: 1792650472716,
      seen: true,
      seeded: true,
      flat: true
    },
    {
      id: "user-gen-2",
      source: "assets/gallery-seed/gen-2-source.jpg",
      background: "assets/gallery-seed/gen-2-bg.jpg",
      result: "assets/gallery-seed/gen-2-result.jpg",
      at: 1792650243012,
      seen: true,
      seeded: true,
      flat: true
    },
    {
      id: "user-gen-3",
      source: "assets/gallery-seed/gen-3-source.jpg",
      background: "assets/gallery-seed/gen-3-bg.jpg",
      result: "assets/gallery-seed/gen-3-result.jpg",
      at: 1792650121794,
      seen: true,
      seeded: true,
      flat: true
    },
    {
      id: "user-gen-4",
      source: "assets/gallery-seed/gen-4-source.jpg",
      background: "assets/gallery-seed/gen-4-bg.jpg",
      result: "assets/gallery-seed/gen-4-result.jpg",
      at: 1792650095514,
      seen: true,
      seeded: true,
      flat: true
    }
  ];

  function read(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return [];
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function write(key, list) {
    var next = Array.isArray(list) ? list.slice(0, MAX_ITEMS) : [];
    // Empty list must still overwrite storage (last-item delete was a no-op before)
    if (!next.length) {
      try {
        localStorage.setItem(key, '[]');
        return true;
      } catch (e) {
        try { localStorage.removeItem(key); } catch (e2) {}
        return false;
      }
    }
    while (next.length) {
      try {
        localStorage.setItem(key, JSON.stringify(next));
        return true;
      } catch (e) {
        // QuotaExceeded — drop oldest until it fits
        if (next.length <= 1) {
          try { localStorage.removeItem(key); } catch (e2) {}
          return false;
        }
        next = next.slice(0, next.length - 1);
      }
    }
    return false;
  }

  function uid() {
    return Date.now().toString(16) + Math.random().toString(16).slice(2, 10);
  }

  function ensureSeed() {
    var list = read(GEN_KEY);
    // Drop old demo seeds; keep user's own non-seeded items
    var next = [];
    var have = {};
    for (var i = 0; i < list.length; i++) {
      var cur = list[i];
      if (cur && cur.seeded && String(cur.id).indexOf('user-gen-') !== 0) continue;
      if (cur && cur.seeded && String(cur.id).indexOf('seed-gen-') === 0) continue;
      next.push(cur);
      if (cur && cur.id) have[cur.id] = true;
    }
    var added = false;
    for (var s = 0; s < SEED_GENERATED.length; s++) {
      var item = SEED_GENERATED[s];
      if (!have[item.id]) {
        next.push({
          id: item.id,
          source: item.source,
          background: item.background,
          result: item.result,
          at: item.at,
          seen: true,
          seeded: true,
          flat: item.flat !== false
        });
        added = true;
      } else {
        // refresh paths for existing seeded user gens
        for (var j = 0; j < next.length; j++) {
          if (next[j].id === item.id && next[j].seeded) {
            next[j].source = item.source;
            next[j].background = item.background;
            next[j].result = item.result;
            next[j].flat = item.flat !== false;
            next[j].seen = true;
            added = true;
          }
        }
      }
    }
    // Newest first (recent generations at the top)
    next.sort(function (a, b) {
      return (Number(b.at) || 0) - (Number(a.at) || 0);
    });
    if (added || next.length !== list.length) write(GEN_KEY, next);
    return next;
  }

  function getGenerated() {
    ensureSeed();
    var list = read(GEN_KEY).slice();
    list.sort(function (a, b) {
      return (Number(b.at) || 0) - (Number(a.at) || 0);
    });
    return list;
  }

  function getUploads() {
    var list = read(UP_KEY).slice();
    list.sort(function (a, b) {
      return (Number(b.at) || 0) - (Number(a.at) || 0);
    });
    return list;
  }

  function generatedCount() {
    return getGenerated().length;
  }

  function unseenCount() {
    return getGenerated().filter(function (x) { return !x.seen; }).length;
  }

  function addGenerated(item) {
    if (!item) return null;
    var list = getGenerated();
    var entry = {
      id: item.id || uid(),
      result: item.result || item.source || '',
      source: item.source || '',
      background: item.background || (item.backgrounds && item.backgrounds[0]) || '',
      at: item.at || Date.now(),
      seen: false
    };
    if (item.listing && item.listing.id) {
      entry.listing = {
        id: item.listing.id,
        title: item.listing.title || '',
        seller: item.listing.seller || '',
        sellerId: item.listing.sellerId || '',
        sellerAvatar: item.listing.sellerAvatar || '',
        sellerPhone: item.listing.sellerPhone || '',
        sellerWhatsapp: item.listing.sellerWhatsapp || '',
        img: item.listing.img || '',
        gallery: Array.isArray(item.listing.gallery) ? item.listing.gallery.filter(Boolean).slice(0, 12) : []
      };
    }
    if (!entry.result && !entry.source && !entry.background) return null;
    list = list.filter(function (x) { return x.id !== entry.id; });
    list.unshift(entry);
    write(GEN_KEY, list);
    refreshBadges();
    return entry;
  }

  function markAllGeneratedSeen() {
    var list = getGenerated();
    var changed = false;
    for (var i = 0; i < list.length; i++) {
      if (!list[i].seen) {
        list[i].seen = true;
        changed = true;
      }
    }
    if (changed) write(GEN_KEY, list);
    refreshBadges();
  }

  function addUpload(item) {
    if (!item || !item.url) return null;
    var list = getUploads();
    var entry = {
      id: item.id || uid(),
      url: item.url,
      kind: item.kind || 'photo',
      at: item.at || Date.now()
    };
    if (list[0] && list[0].url === entry.url) return list[0];
    list.unshift(entry);
    write(UP_KEY, list);
    return entry;
  }

  function removeGenerated(id) {
    var sid = String(id);
    write(GEN_KEY, getGenerated().filter(function (x) { return String(x.id) !== sid; }));
    refreshBadges();
  }

  function removeUpload(id) {
    var sid = String(id);
    write(UP_KEY, getUploads().filter(function (x) { return String(x.id) !== sid; }));
  }

  function refreshBadges() {
    var n = unseenCount();
    var nodes = document.querySelectorAll('[data-pb-gallery-count]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (n > 0) {
        el.textContent = String(n);
        el.hidden = false;
        el.removeAttribute('hidden');
        el.style.display = '';
      } else {
        el.textContent = '';
        el.hidden = true;
        el.style.display = 'none';
      }
    }
  }

  var api = {
    getGenerated: getGenerated,
    getUploads: getUploads,
    generatedCount: generatedCount,
    unseenCount: unseenCount,
    addGenerated: addGenerated,
    markAllGeneratedSeen: markAllGeneratedSeen,
    addUpload: addUpload,
    removeGenerated: removeGenerated,
    removeUpload: removeUpload,
    refreshBadges: refreshBadges
  };

  global.pbGallery = api;

  function boot() {
    ensureSeed();
    refreshBadges();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
