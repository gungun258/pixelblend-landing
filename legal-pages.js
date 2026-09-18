(function () {
  /* FAQ accordion + search + categories */
  var faqList = document.getElementById('faq-list');
  if (faqList) {
    var items = Array.prototype.slice.call(faqList.querySelectorAll('.lp-faq-item'));
    var emptyEl = document.getElementById('faq-empty');
    var labelEl = document.getElementById('faq-cat-label');
    var searchEl = document.getElementById('faq-search');
    var activeCat = 'all';
    var labels = {
      all: 'All questions',
      start: 'Getting started',
      users: 'For users',
      sellers: 'For sellers',
      market: 'Marketplace',
      billing: 'Billing & refunds',
      account: 'Account & privacy',
      tech: 'Technical'
    };

    function setActiveCat(cat) {
      activeCat = cat || 'all';
      document.querySelectorAll('.faq-cat').forEach(function (b) {
        b.classList.toggle('is-active', (b.getAttribute('data-cat') || 'all') === activeCat);
      });
      applyFilter();
      var activePill = document.querySelector('.faq-mobile-pills .faq-cat.is-active');
      if (activePill && activePill.scrollIntoView) {
        activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }

    function applyFilter() {
      var q = ((searchEl && searchEl.value) || '').trim().toLowerCase();
      var visible = 0;
      items.forEach(function (item) {
        var cats = (item.getAttribute('data-cat') || '').split(/\s+/);
        var question = (item.getAttribute('data-q') || '').toLowerCase();
        var answer = '';
        var body = item.querySelector('.lp-faq-body');
        if (body) answer = (body.textContent || '').toLowerCase();
        var text = question + ' ' + answer;
        var catOk = activeCat === 'all' || cats.indexOf(activeCat) !== -1;
        var qOk = !q || text.indexOf(q) !== -1;
        var show = catOk && qOk;
        item.hidden = !show;
        if (!show) {
          item.classList.remove('is-open');
          var btn = item.querySelector('button');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
        if (show) visible += 1;
      });
      if (emptyEl) emptyEl.hidden = visible > 0;
      if (labelEl) labelEl.textContent = labels[activeCat] || 'Questions';
    }

    faqList.addEventListener('click', function (e) {
      var btn = e.target.closest('.lp-faq-item button');
      if (!btn || !faqList.contains(btn)) return;
      var item = btn.closest('.lp-faq-item');
      if (!item || item.hidden) return;
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.querySelectorAll('.faq-cat').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setActiveCat(btn.getAttribute('data-cat') || 'all');
      });
    });

    if (searchEl) {
      searchEl.addEventListener('input', applyFilter);
    }
    applyFilter();
  }

  /* Gallery page */
  var grid = document.getElementById('lp-gal-grid');
  if (!grid) return;

  function U(id, w) {
    var local = (window.__resources && window.__resources['u_' + id]);
    if (local) return local;
    return 'https://images.unsplash.com/photo-' + id + '?w=' + (w || 600) + '&q=80&auto=format&fit=crop';
  }

  var items = [
    { category: 'Lifestyle', handle: '@studio.noir', user: U('1511499767150-a48a237f0083', 360), cloth: U('1507525428034-b723cf961d3e', 360), result: U('1600185365483-26d7a4cc7519', 560), h: 332 },
    { category: 'Studio', handle: '@coastal.frames', user: U('1542291026-7eec264c27ff', 360), cloth: U('1517842645767-c639042777db', 360), result: U('1595950653106-6c9ebd614d3a', 520), h: 252 },
    { category: 'Nature', handle: '@wildframe', user: U('1523275335684-37898b6baf30', 360), cloth: U('1441974231531-c6227db76b6e', 360), result: U('1434056886845-dac89ffe9b56', 520), h: 300 },
    { category: 'Cosmetics', handle: '@glow.labs', user: U('1586495777744-4413f21062fa', 360), cloth: U('1557683316-973673baf926', 360), result: U('1522335789203-aabd1fc54bc9', 520), h: 240 },
    { category: 'Lifestyle', handle: '@north.loom', user: U('1505740420928-5e560c06d30e', 360), cloth: U('1519681393784-d120267933ba', 360), result: U('1509042239860-f550ce710b93', 520), h: 300 },
    { category: 'Fragrance', handle: '@maison.rose', user: U('1541643600914-78b084683601', 360), cloth: U('1517842645767-c639042777db', 360), result: U('1594035910387-fea47794261f', 520), h: 252 },
    { category: 'Furniture', handle: '@dwell.co', user: U('1584917865442-de89df76afd3', 360), cloth: U('1513694203232-719a280e022f', 360), result: U('1550226891-ef816aed4a98', 520), h: 316 },
    { category: 'Modern', handle: '@ria.creative', user: U('1516035069371-29a1b244cc32', 360), cloth: U('1441974231531-c6227db76b6e', 360), result: U('1507525428034-b723cf961d3e', 520), h: 238 },
    { category: 'Festive', handle: '@priya.studio', user: U('1460353581641-37baddab0fa2', 360), cloth: U('1517842645767-c639042777db', 360), result: U('1600185365483-26d7a4cc7519', 520), h: 288 },
    { category: 'Skincare', handle: '@aarav.labs', user: U('1556228578-8c89e6adf883', 360), cloth: U('1441974231531-c6227db76b6e', 360), result: U('1522335789203-aabd1fc54bc9', 520), h: 262 }
  ];

  var filter = 'all';
  var lbIndex = -1;
  var emptyEl = document.getElementById('lp-gal-empty');
  var lb = document.getElementById('lp-lb');

  function render() {
    var list = items.filter(function (it) {
      return filter === 'all' || it.category === filter;
    });
    grid.innerHTML = list.map(function (it, i) {
      var realIdx = items.indexOf(it);
      return (
        '<button type="button" class="lp-gal-card" data-idx="' + realIdx + '" style="--h:' + it.h + 'px">' +
          '<img src="' + it.result + '" alt="' + it.category + ' blend by ' + it.handle + '" loading="lazy">' +
          '<span class="lp-gal-cat">' + it.category + '</span>' +
          '<div class="lp-gal-foot">' +
            '<div class="lp-gal-recipe">' +
              '<span class="lp-gal-mini"><img src="' + it.user + '" alt=""></span>' +
              '<span class="lp-gal-op">+</span>' +
              '<span class="lp-gal-mini"><img src="' + it.cloth + '" alt=""></span>' +
            '</div>' +
            '<span class="lp-gal-handle">' + it.handle + '</span>' +
            '<span class="lp-gal-expand" aria-hidden="true">⤢</span>' +
          '</div>' +
        '</button>'
      );
    }).join('');
    if (emptyEl) emptyEl.hidden = list.length > 0;
  }

  function openLB(idx) {
    lbIndex = idx;
    var it = items[idx];
    if (!it || !lb) return;
    document.getElementById('lp-lb-user').src = it.user;
    document.getElementById('lp-lb-cloth').src = it.cloth;
    document.getElementById('lp-lb-result').src = it.result;
    document.getElementById('lp-lb-handle').textContent = it.handle;
    document.getElementById('lp-lb-cat').textContent = it.category;
    lb.hidden = false;
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLB() {
    if (!lb) return;
    lb.hidden = true;
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbIndex = -1;
  }

  document.querySelectorAll('.lp-gal-filters button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.lp-gal-filters button').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      filter = btn.getAttribute('data-filter') || 'all';
      render();
    });
  });

  grid.addEventListener('click', function (e) {
    var card = e.target.closest('.lp-gal-card');
    if (!card) return;
    openLB(parseInt(card.getAttribute('data-idx'), 10));
  });

  if (lb) {
    lb.addEventListener('click', function (e) {
      if (e.target.closest('[data-lb-close]')) closeLB();
      if (e.target.closest('[data-lb-prev]')) openLB((lbIndex - 1 + items.length) % items.length);
      if (e.target.closest('[data-lb-next]')) openLB((lbIndex + 1) % items.length);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (lbIndex < 0) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') openLB((lbIndex - 1 + items.length) % items.length);
    if (e.key === 'ArrowRight') openLB((lbIndex + 1) % items.length);
  });

  /* Before / after slider */
  var ba = document.getElementById('lp-ba');
  if (ba) {
    var clip = ba.querySelector('.lp-ba-clip');
    var inner = ba.querySelector('.lp-ba-clip-inner');
    var handle = ba.querySelector('.lp-ba-handle');
    function setPct(clientX) {
      var r = ba.getBoundingClientRect();
      var pct = ((clientX - r.left) / r.width) * 100;
      if (pct < 8) pct = 8;
      if (pct > 92) pct = 92;
      if (clip) clip.style.width = pct + '%';
      if (handle) handle.style.left = pct + '%';
      if (inner) inner.style.width = (10000 / pct) + '%';
    }
    var dragging = false;
    ba.addEventListener('pointerdown', function (e) {
      dragging = true;
      try { ba.setPointerCapture(e.pointerId); } catch (err) {}
      setPct(e.clientX);
      e.preventDefault();
    });
    ba.addEventListener('pointermove', function (e) {
      if (dragging || e.pointerType === 'mouse') setPct(e.clientX);
    });
    function endDrag() { dragging = false; }
    ba.addEventListener('pointerup', endDrag);
    ba.addEventListener('pointercancel', endDrag);
  }

  render();
})();
