 
    
document.addEventListener('DOMContentLoaded', async function() {
  const loading = document.getElementById('__bundler_loading');
  function setStatus(msg) { if (loading) loading.textContent = msg; }

  // Keep errors in the console only — never paint a debug overlay on the page.
  window.addEventListener('error', function(e) {
    console.error('[bundle]', e.message || e.type,
      e.filename ? (e.filename.slice(0, 80) + ':' + e.lineno) : '');
  }, true);

  try {
    const manifestEl = document.querySelector('script[type="__bundler/manifest"]');
    const templateEl = document.querySelector('script[type="__bundler/template"]');
    if (!manifestEl || !templateEl) {
      setStatus('Error: missing bundle data');
      console.error('[bundler] Missing script tags — manifestEl:', !!manifestEl, 'templateEl:', !!templateEl);
      return;
    }

    const manifest = JSON.parse(manifestEl.textContent);
    let template = JSON.parse(templateEl.textContent);

    const uuids = Object.keys(manifest);
    setStatus('Unpacking ' + uuids.length + ' assets...');

    const blobUrls = {};
    await Promise.all(uuids.map(async (uuid) => {
      const entry = manifest[uuid];
      try {
        const binaryStr = atob(entry.data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

        let finalBytes = bytes;
        if (entry.compressed) {
          if (typeof DecompressionStream !== 'undefined') {
            const ds = new DecompressionStream('gzip');
            const writer = ds.writable.getWriter();
            const reader = ds.readable.getReader();
            writer.write(bytes);
            writer.close();
            const chunks = [];
            let totalLen = 0;
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              chunks.push(value);
              totalLen += value.length;
            }
            finalBytes = new Uint8Array(totalLen);
            let offset = 0;
            for (const chunk of chunks) { finalBytes.set(chunk, offset); offset += chunk.length; }
          } else {
            console.warn('DecompressionStream not available, asset ' + uuid + ' may not render');
          }
        }

        blobUrls[uuid] = URL.createObjectURL(new Blob([finalBytes], { type: entry.mime }));
      } catch (err) {
        console.error('Failed to decode asset ' + uuid + ':', err);
        blobUrls[uuid] = URL.createObjectURL(new Blob([], { type: entry.mime }));
      }
    }));

    const extResEl = document.querySelector('script[type="__bundler/ext_resources"]');
    const extResources = extResEl ? JSON.parse(extResEl.textContent) : [];
    const resourceMap = {};
    for (const entry of extResources) {
      if (blobUrls[entry.uuid]) resourceMap[entry.id] = blobUrls[entry.uuid];
    }

    setStatus('Rendering...');
    for (const uuid of uuids) template = template.split(uuid).join(blobUrls[uuid]);

    // Strip integrity + crossorigin — blob URLs from a file:// document inherit
    // a null origin, so crossorigin forces a CORS fetch that SRI then rejects.
    // The manifest bytes are ours; SRI protects against CDN compromise, not this.
    template = template.replace(/\s+integrity="[^"]*"/gi, '').replace(/\s+crossorigin="[^"]*"/gi, '');

    const resourceScript = '<script>window.__resources = ' +
      JSON.stringify(resourceMap).split('</' + 'script>').join('<\\/' + 'script>') +
      ';</' + 'script>';
    // Inject after <head> so the DOCTYPE stays first; prepending the script
    // would push the parser into quirks mode. DOMParser always emits a <head>
    // (synthesizing one if the source HTML omitted it) but may carry
    // attributes through, so match the full opening tag. slice() rather than
    // replace() keeps us clear of $-pattern substitution in resourceScript.
    const headOpen = template.match(/<head[^>]*>/i);
    if (headOpen) {
      const i = headOpen.index + headOpen[0].length;
      template = template.slice(0, i) + resourceScript + template.slice(i);
    }

    // Parse the template and swap the root element. Scripts inserted via
    // DOMParser/replaceWith are inert per spec — re-create each with
    // createElement so they execute, awaiting onload for src scripts to
    // preserve ordering (React before ReactDOM before Babel before text/babel).
    const doc = new DOMParser().parseFromString(template, 'text/html');
    // Cover + hide CSS must live on the *parsed* document so the first paint
    // after replaceWith is never the raw {{ template }} layout (mobile flash).
    doc.documentElement.classList.add('pb-booting');
    var bootCss = doc.createElement('style');
    bootCss.id = 'pb-boot-css';
    bootCss.textContent = 'html.pb-booting,html.pb-booting body{background:#FAF4FB!important;overflow:hidden!important}html.pb-booting body{visibility:hidden!important}html.pb-booting #pb-boot-cover{visibility:visible!important}';
    (doc.head || doc.documentElement).appendChild(bootCss);
    var cover = doc.createElement('div');
    cover.id = 'pb-boot-cover';
    cover.setAttribute('aria-hidden', 'true');
    cover.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#FAF4FB;display:flex;align-items:center;justify-content:center;';
    cover.innerHTML = '<div style="width:72px;height:72px;border-radius:22px;background:linear-gradient(113.667deg,#A855F7,#EC4899,#F43F5E);"></div>';
    doc.documentElement.appendChild(cover);
    var oldFixes = doc.getElementById('pb-responsive-fixes');
    if (oldFixes) oldFixes.remove();
    var cssLink = doc.createElement('link');
    cssLink.id = 'pb-responsive-fixes';
    cssLink.rel = 'stylesheet';
    cssLink.href = 'styles.css';
    (doc.head || doc.documentElement).appendChild(cssLink);

    document.documentElement.replaceWith(doc.documentElement);
    cssLink = document.getElementById('pb-responsive-fixes');

    var cssReady = !cssLink;
    function markCssReady() { cssReady = true; }
    if (cssLink) {
      cssLink.addEventListener('load', markCssReady);
      cssLink.addEventListener('error', markCssReady);
      try { if (cssLink.sheet) cssReady = true; } catch (e) {}
    }

    function pbReveal() {
      document.documentElement.classList.remove('pb-booting');
      var c = document.getElementById('pb-boot-cover');
      if (c && c.parentNode) c.parentNode.removeChild(c);
      var s = document.getElementById('pb-boot-css');
      if (s && s.parentNode) s.parentNode.removeChild(s);
    }
    function pbHydrated() {
      var body = document.body;
      if (!body) return false;
      var els = body.querySelectorAll('*:not(script):not(style):not(noscript)');
      for (var i = 0; i < els.length; i++) {
        var kids = els[i].childNodes;
        for (var j = 0; j < kids.length; j++) {
          if (kids[j].nodeType === 3 && kids[j].nodeValue.indexOf('{{') !== -1) return false;
        }
      }
      return !!document.querySelector('nav');
    }

    const dead = Array.from(document.scripts);
    for (const old of dead) {
      const s = document.createElement('script');
      for (const a of old.attributes) s.setAttribute(a.name, a.value);
      s.textContent = old.textContent;
      // text/babel scripts with a src: fetch and inline. transformScriptTags
      // does XHR against the src, but blob:null/ from a file:// origin is
      // silently dropped. Inlining makes it a plain inline babel script,
      // which transformScriptTags handles unconditionally.
      if ((s.type === 'text/babel' || s.type === 'text/jsx') && s.src) {
        const r = await fetch(s.src);
        s.textContent = await r.text();
        s.removeAttribute('src');
      }
      const p = s.src ? new Promise(function(r) { s.onload = s.onerror = r; }) : null;
      old.replaceWith(s);
      if (p) await p;
    }
    // Babel standalone auto-transforms type=text/babel on DOMContentLoaded,
    // which fired before we swapped the document. Trigger manually if present.
    if (window.Babel && typeof window.Babel.transformScriptTags === 'function') {
      window.Babel.transformScriptTags();
    }

    var waitMs = 0;
    var hid = setInterval(function () {
      waitMs += 50;
      if (!pbHydrated() && window.Babel && typeof window.Babel.transformScriptTags === 'function' && waitMs % 500 === 0) {
        try { window.Babel.transformScriptTags(); } catch (e) {}
      }
      if ((cssReady && pbHydrated()) || waitMs > 20000) {
        clearInterval(hid);
        if (cssReady && pbHydrated()) {
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              pbReveal();
              setTimeout(bindPbMotion, 80);
            });
          });
        } else {
          pbReveal();
          setTimeout(bindPbMotion, 80);
        }
      }
    }, 50);

    function bindBaSlider() {
      var root = document.querySelector('.ba-slider');
      if (!root || root.getAttribute('data-ba-bound')) return !!root;
      root.setAttribute('data-ba-bound', '1');
      var clip = root.querySelector('.ba-clip');
      var inner = root.querySelector('.ba-clip-inner');
      var handle = root.querySelector('.ba-handle');
      function setPct(clientX) {
        var r = root.getBoundingClientRect();
        var pct = ((clientX - r.left) / r.width) * 100;
        if (pct < 8) pct = 8;
        if (pct > 92) pct = 92;
        if (clip) clip.style.width = pct + '%';
        if (handle) handle.style.left = pct + '%';
        if (inner) inner.style.width = (10000 / pct) + '%';
      }
      var dragging = false;
      root.addEventListener('pointerdown', function (e) {
        dragging = true;
        try { root.setPointerCapture(e.pointerId); } catch (err) {}
        setPct(e.clientX);
        e.preventDefault();
      });
      root.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'mouse' || dragging) setPct(e.clientX);
      });
      function endDrag() { dragging = false; }
      root.addEventListener('pointerup', endDrag);
      root.addEventListener('pointercancel', endDrag);
      return true;
    }
    var baTries = 0;
    var baTimer = setInterval(function () {
      baTries += 1;
      if (bindBaSlider() || baTries > 40) clearInterval(baTimer);
    }, 250);

    function bindHowSwap() {
      var bg = document.querySelector('.how-swap[data-how="bg"]');
      var res = document.querySelector('.how-swap[data-how="result"]');
      if (!bg || !res || bg.getAttribute('data-how-bound')) return !!bg;
      bg.setAttribute('data-how-bound', '1');
      var bgImgs = bg.querySelectorAll('img');
      var resImgs = res.querySelectorAll('img');
      var tag = bg.querySelector('.how-bg-tag');
      var labels = ['🏞️ STUDIO', '🏞️ MARBLE', '🏞️ NATURE'];
      var i = 0;
      var n = Math.min(bgImgs.length, resImgs.length, labels.length);
      if (n < 2) return true;
      function show(idx) {
        var k;
        for (k = 0; k < n; k++) {
          bgImgs[k].classList.toggle('how-on', k === idx);
          resImgs[k].classList.toggle('how-on', k === idx);
        }
        if (tag) tag.textContent = labels[idx];
      }
      show(0);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
      var playing = false;
      var timer = null;
      function tick() {
        i = (i + 1) % n;
        show(i);
      }
      function start() {
        if (playing) return;
        playing = true;
        timer = setInterval(tick, 3400);
      }
      function stop() {
        playing = false;
        if (timer) clearInterval(timer);
        timer = null;
      }
      if (typeof IntersectionObserver !== 'undefined') {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) start();
            else stop();
          });
        }, { threshold: 0.25 });
        io.observe(bg.closest('.how-grid') || bg);
      } else start();
      return true;
    }
    var howSwapTries = 0;
    var howSwapTimer = setInterval(function () {
      howSwapTries += 1;
      if (bindHowSwap() || howSwapTries > 40) clearInterval(howSwapTimer);
    }, 250);

    function bindPbMotion() {
      if (document.documentElement.getAttribute('data-pb-motion') === '1') return true;
      if (!document.querySelector('section')) return false;
      var heroRight = document.querySelector('.hero-demo-col');
      if (!heroRight) return false;
      var heroCards = [];
      Array.prototype.forEach.call(heroRight.querySelectorAll('.hero-eq'), function (eq) {
        var wrap = eq.parentNode;
        heroCards.push(wrap && wrap !== heroRight ? wrap : eq);
      });
      if (heroCards.length < 1) return false;
      document.documentElement.setAttribute('data-pb-motion', '1');
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;

      /* ---- Hero: keep strong immediate entrance ---- */
      var heroLeft = document.querySelector('header .hero-grid > div:first-child');
      if (heroLeft) {
        Array.prototype.forEach.call(heroLeft.children, function (ch, i) {
          if (!ch || ch.classList.contains('store-btn') || ch.classList.contains('hero-stores')) return;
          if (ch.classList && ch.classList.contains('store-btns')) return;
          ch.classList.add('pb-reveal', 'pb-from-left');
          ch.style.setProperty('--pb-d', (80 + i * 110) + 'ms');
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { ch.classList.add('pb-in'); });
          });
        });
      }
      Array.prototype.forEach.call(heroCards, function (card, i) {
        card.classList.add('pb-reveal', 'pb-from-right', 'pb-card');
        card.style.setProperty('--pb-d', (220 + i * 160) + 'ms');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { card.classList.add('pb-in'); });
        });
      });

      /* ---- Rest of page: scroll-triggered fade-up (later + clearer) ---- */
      var scrollEls = [];
      function addScroll(el, delay, asCard) {
        if (!el || el.__pbScroll) return;
        if (el.closest && (el.closest('.hero-grid') || el.closest('.lb-stage') || el.closest('nav') || el.id === 'pb-to-top' || el.id === 'pb-dl-bar')) return;
        if (el.classList && (el.classList.contains('how-op') || el.classList.contains('store-btn') || el.classList.contains('store-badge'))) return;
        if (el.closest && el.closest('.hero-stores, .footer-stores, .dl-stores, .or-sep')) return;
        el.__pbScroll = 1;
        if (asCard) el.__pbIsCard = 1;
        el.classList.add('pb-reveal-scroll');
        if (typeof delay === 'number') el.style.setProperty('--pb-d', delay + 'ms');
        scrollEls.push(el);
      }

      /* cards first so data-reveal wrappers don't steal the hover-lift flag */
      var cardSel = [
        '.how-grid > *:not(.how-op)',
        '.creation-card',
        '#marketplace .trend-grid > *',
        '.market-grid > *',
        '.cat-grid > *',
        '.sellers-vcards > *',
        '.seller-way-grid > *',
        '.twoway-grid > div[data-reveal], .twoway-grid > div:not(.or-sep)',
        '.price-grid > *',
        '.offer-grid > *',
        '.testi-grid > *',
        '.usecase-grid > *'
      ].join(', ');
      var byParent = {};
      Array.prototype.forEach.call(document.querySelectorAll(cardSel), function (el) {
        var p = el.parentElement;
        var key = p ? (p.id || p.className || 'p') : 'x';
        if (!byParent[key]) byParent[key] = 0;
        var i = byParent[key]++;
        addScroll(el, (i % 5) * 90, true);
      });

      function markText(el) {
        if (el && el.classList) el.classList.add('pb-reveal-text');
      }

      /* Section intros: eyebrow + heading + sub — stagger when section is well in view */
      Array.prototype.forEach.call(document.querySelectorAll('section'), function (sec) {
        if (!sec || (sec.closest && sec.closest('header, nav, footer, .lb-stage'))) return;
        var h2 = sec.querySelector('h2');
        if (!h2) return;
        if (h2.closest && h2.closest('.how-grid, .price-grid, .offer-grid, .creation-card, .market-grid, .cat-grid, .testi-grid, .usecase-grid, .sellers-vcards, .seller-way-grid, .marquee-track, .twoway-grid')) return;

        var wrap = h2.closest && h2.closest('[data-reveal]');
        if (wrap && wrap !== h2 && wrap.children && wrap.children.length && wrap.children.length <= 8) {
          Array.prototype.forEach.call(wrap.children, function (ch, i) {
            addScroll(ch, i * 100, false);
            markText(ch);
          });
          wrap.__pbScroll = 1;
          return;
        }

        var group = [];
        var prev = h2.previousElementSibling;
        if (prev && prev.tagName === 'P') group.push(prev);
        group.push(h2);
        var next = h2.nextElementSibling;
        if (next && next.tagName === 'P') group.push(next);
        group.forEach(function (el, i) {
          addScroll(el, i * 100, false);
          markText(el);
        });
      });

      Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (el) {
        if (el.parentElement && el.parentElement.closest && el.parentElement.closest('[data-reveal]')) return;
        addScroll(el, 0, false);
      });

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          io.unobserve(el);
          el.classList.add('pb-in');
          /* hover lift/glow only on real cards — not headings / intros */
          if (el.__pbIsCard) el.classList.add('pb-card');
        });
      }, {
        threshold: 0.2,
        /* fire once the block is clearly inside the section viewport */
        rootMargin: '0px 0px -22% 0px'
      });
      scrollEls.forEach(function (el) { io.observe(el); });

      return true;
    }
    var motTries = 0;
    var motTimer = setInterval(function () {
      motTries += 1;
      if (bindPbMotion() || motTries > 40) clearInterval(motTimer);
    }, 250);

    var pbScrollTok = 0;
    function pbScrollY() {
      return Math.max(window.pageYOffset || 0, document.documentElement.scrollTop || 0, document.body.scrollTop || 0);
    }
    function bindNavGlass() {
      var nav = document.querySelector('nav');
      if (!nav) return false;
      var mo = null;
      function applyGlass() {
        if (mo) mo.disconnect();
        nav.style.setProperty('background', 'rgba(255, 255, 255, 0.85)', 'important');
        nav.style.setProperty('backdrop-filter', 'blur(15px)', 'important');
        nav.style.setProperty('-webkit-backdrop-filter', 'blur(15px)', 'important');
        nav.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.2)', 'important');
        nav.style.setProperty('border-bottom', 'none', 'important');
        nav.style.setProperty('box-shadow', 'none', 'important');
        if (mo) mo.observe(nav, { attributes: true, attributeFilter: ['style'] });
      }
      applyGlass();
      if (!nav.getAttribute('data-pb-glass')) {
        nav.setAttribute('data-pb-glass', '1');
        mo = new MutationObserver(applyGlass);
        mo.observe(nav, { attributes: true, attributeFilter: ['style'] });
      }
      return true;
    }
    var navTries = 0;
    var navTimer = setInterval(function () {
      navTries += 1;
      if (bindNavGlass() || navTries > 40) clearInterval(navTimer);
    }, 250);
    function bindLbNav() {
      var result = document.querySelector('.lb-result');
      var prev = document.querySelector('.lb-nav-prev:not(.lb-nav-clone)');
      var next = document.querySelector('.lb-nav-next:not(.lb-nav-clone)');
      if (!prev || !next) return false;
      var panel = prev.parentNode;
      var overlay = panel && panel.parentNode;
      if (panel) {
        panel.classList.add('lb-panel');
        panel.style.setProperty('box-sizing', 'border-box', 'important');
      }
      if (overlay) {
        overlay.classList.add('lb-overlay');
        overlay.style.setProperty('z-index', '220', 'important');
        overlay.style.setProperty('box-sizing', 'border-box', 'important');
        overlay.style.setProperty('inset', '0', 'important');
      }
      var mobile = window.matchMedia('(max-width: 640px)').matches;
      if (mobile && panel) {
        panel.style.setProperty('width', '100%', 'important');
        panel.style.setProperty('max-width', '100%', 'important');
      } else if (panel) {
        panel.style.removeProperty('width');
        panel.style.removeProperty('max-width');
      }
      if (mobile && overlay) {
        overlay.style.setProperty('padding', '16px 20px', 'important');
      } else if (overlay) {
        overlay.style.setProperty('padding', '24px', 'important');
      }
      if (mobile && result) {
        if (!result.querySelector('.lb-nav-clone')) {
          function cloneBtn(src) {
            var b = src.cloneNode(true);
            b.classList.add('lb-nav-clone');
            b.removeAttribute('onclick');
            b.style.setProperty('display', 'flex', 'important');
            b.addEventListener('click', function (ev) {
              ev.stopPropagation();
              src.click();
            });
            return b;
          }
          result.appendChild(cloneBtn(prev));
          result.appendChild(cloneBtn(next));
        }
        prev.style.setProperty('display', 'none', 'important');
        next.style.setProperty('display', 'none', 'important');
      } else {
        prev.style.removeProperty('display');
        next.style.removeProperty('display');
      }
      return true;
    }
    setInterval(bindLbNav, 400);
    window.addEventListener('resize', bindLbNav);
    function pbSetY(pos) {
      window.scrollTo(0, pos);
      document.documentElement.scrollTop = pos;
      document.body.scrollTop = pos;
    }
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.nodeType === 3) t = t.parentNode;
      var a = t && t.closest ? t.closest('a[href^="#"]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) !== '#' || href.length < 2) return;
      var stage = document.querySelector('.lb-stage');
      if (stage && stage.parentNode && stage.parentNode.contains(a)) {
        var panel = stage.parentNode.parentNode;
        var closeBtn = panel && panel.querySelector('button[aria-label="Close"]');
        if (closeBtn) closeBtn.click();
      }
      var el = document.getElementById(href.slice(1));
      if (!el) return;
      e.preventDefault();
      var y = el.getBoundingClientRect().top + pbScrollY() - 72;
      if (y < 0) y = 0;
      var start = pbScrollY();
      var diff = y - start;
      var tok = ++pbScrollTok;
      if (Math.abs(diff) < 1) return;
      var t0 = performance.now();
      var dur = 550;
      function tick(now) {
        if (tok !== pbScrollTok) return;
        var p = (now - t0) / dur;
        if (p > 1) p = 1;
        var ease = 1 - Math.pow(1 - p, 3);
        pbSetY(start + diff * ease);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, true);

    (function () {
      if (!document.getElementById('pb-to-top-css')) {
        var hideCss = document.createElement('style');
        hideCss.id = 'pb-to-top-css';
        hideCss.textContent = '#pb-to-top:not(.pb-on),#pb-to-top:not(.pb-layout){opacity:0!important;visibility:hidden!important;pointer-events:none!important}';
        document.head.appendChild(hideCss);
      }
      var goingTop = false;
      function heroLaidOut(grid) {
        if (!grid) return false;
        var r = grid.getBoundingClientRect();
        return r.height > 120;
      }
      function pastHero() {
        if (goingTop) return false;
        var grid = document.querySelector('.hero-grid');
        if (!heroLaidOut(grid)) return false;
        return grid.getBoundingClientRect().bottom < 56;
      }
      function syncToTop(btn) {
        if (!btn) return;
        var grid = document.querySelector('.hero-grid');
        if (!heroLaidOut(grid)) {
          btn.classList.remove('pb-on');
          return;
        }
        var show = pastHero();
        if (!btn.classList.contains('pb-layout')) {
          if (show) btn.classList.add('pb-on');
          else btn.classList.remove('pb-on');
          btn.classList.add('pb-layout');
          return;
        }
        if (show) btn.classList.add('pb-on');
        else btn.classList.remove('pb-on');
      }
      function mountToTop() {
        var btn = document.getElementById('pb-to-top');
        if (!btn) {
          btn = document.createElement('button');
          btn.id = 'pb-to-top';
          btn.type = 'button';
          btn.setAttribute('aria-label', 'Back to top');
          btn.style.cssText = 'opacity:0;visibility:hidden;pointer-events:none';
          btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
          btn.addEventListener('click', function () {
            if (goingTop) return;
            var start = pbScrollY();
            if (start < 1) {
              syncToTop(btn);
              return;
            }
            goingTop = true;
            btn.classList.remove('pb-on');
            var tok = ++pbScrollTok;
            var t0 = performance.now();
            var dur = 700;
            function tick(now) {
              if (tok !== pbScrollTok) {
                goingTop = false;
                return;
              }
              var p = (now - t0) / dur;
              if (p > 1) p = 1;
              var ease = 1 - Math.pow(1 - p, 3);
              pbSetY(start * (1 - ease));
              if (p < 1) requestAnimationFrame(tick);
              else {
                pbSetY(0);
                goingTop = false;
                syncToTop(btn);
              }
            }
            requestAnimationFrame(tick);
          });
          function onScroll() { syncToTop(document.getElementById('pb-to-top')); }
          window.addEventListener('scroll', onScroll, { passive: true });
          document.addEventListener('scroll', onScroll, { passive: true, capture: true });
        }
        var host = document.body || document.documentElement;
        if (host && btn.parentNode !== host) host.appendChild(btn);
        syncToTop(btn);
      }
      mountToTop();
      var tries = 0;
      var timer = setInterval(function () {
        mountToTop();
        tries += 1;
        if (tries > 40) clearInterval(timer);
      }, 250);
    })();

    (function () {
      var hidden = false;
      try { sessionStorage.removeItem('pb-dl-hide'); } catch (e) {}
      function isMobileVp() {
        var w = window.innerWidth || document.documentElement.clientWidth || 0;
        return w > 0 && w <= 1024;
      }
      function pastHero() {
        var grid = document.querySelector('.hero-grid');
        if (!grid) return false;
        var r = grid.getBoundingClientRect();
        return r.height > 120 && r.bottom < 56;
      }
      function downloadInView() {
        var sec = document.getElementById('download');
        if (!sec) return false;
        var r = sec.getBoundingClientRect();
        return r.top < window.innerHeight * 0.78 && r.bottom > 64;
      }
      function drawerOpen() {
        var d = document.querySelector('.pb-drawer');
        if (!d) return false;
        var t = (d.style.transform || '').replace(/\s/g, '');
        if (t.indexOf('105%') !== -1) return false;
        if (t.indexOf('translateX(0)') !== -1) return true;
        var cs = window.getComputedStyle(d).transform;
        if (!cs || cs === 'none') return false;
        var m = cs.match(/matrix\(([^)]+)\)/);
        if (!m) return false;
        var tx = parseFloat(m[1].split(',')[4]);
        return Math.abs(tx) < 24;
      }
      function shouldShow() {
        if (!isMobileVp()) return false;
        if (hidden) return false;
        if (drawerOpen()) return false;
        if (!pastHero()) return false;
        if (downloadInView()) return false;
        return true;
      }
      function sync(bar) {
        if (!bar) return;
        var on = shouldShow();
        bar.classList.toggle('pb-on', on);
        document.body.classList.toggle('pb-has-dlbar', on);
      }
      function bindDrawerSync() {
        if (document.documentElement.getAttribute('data-pb-dl-drawer') === '1') {
          var d = document.querySelector('.pb-drawer');
          if (d && !d.getAttribute('data-pb-dl-obs')) {
            d.setAttribute('data-pb-dl-obs', '1');
            new MutationObserver(function () { sync(document.getElementById('pb-dl-bar')); }).observe(d, { attributes: true, attributeFilter: ['style'] });
          }
          return;
        }
        document.documentElement.setAttribute('data-pb-dl-drawer', '1');
        function bump() { sync(document.getElementById('pb-dl-bar')); }
        document.addEventListener('click', function (e) {
          var t = e.target;
          if (!t || !t.closest) return;
          if (t.closest('.nav-burger') || t.closest('.pb-drawer') || t.closest('.pb-drawer-backdrop')) {
            setTimeout(bump, 50);
            setTimeout(bump, 420);
          }
        }, true);
        bump();
      }
      function mountDlBar() {
        var bar = document.getElementById('pb-dl-bar');
        if (!bar) {
          bar = document.createElement('div');
          bar.id = 'pb-dl-bar';
          bar.innerHTML = '<button type="button" class="pb-dl-x" aria-label="Dismiss">×</button><div class="pb-dl-copy"><strong>Get the <em>PixelBlend</em> app</strong><span>Create from your phone</span></div><a class="pb-dl-cta" href="#download">Get the app</a>';
          bar.querySelector('.pb-dl-x').addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            hidden = true;
            bar.classList.remove('pb-on');
            document.body.classList.remove('pb-has-dlbar');
          });
          window.addEventListener('scroll', function () { sync(document.getElementById('pb-dl-bar')); }, { passive: true });
          window.addEventListener('resize', function () { sync(document.getElementById('pb-dl-bar')); });
        }
        bindDrawerSync();
        var host = document.body || document.documentElement;
        if (host && bar.parentNode !== host) host.appendChild(bar);
        sync(bar);
      }
      mountDlBar();
      var n = 0;
      var t = setInterval(function () {
        mountDlBar();
        n += 1;
        if (n > 40) clearInterval(t);
      }, 250);
    })();
   } catch (err) {
    setStatus('Error unpacking: ' + err.message);
    console.error('Bundle unpack error:', err);
  }
});

  