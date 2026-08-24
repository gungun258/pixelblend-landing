 
    
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
          requestAnimationFrame(function () { requestAnimationFrame(pbReveal); });
        } else {
          pbReveal();
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

    var pbScrollTok = 0;
    function pbScrollY() {
      return Math.max(window.pageYOffset || 0, document.documentElement.scrollTop || 0, document.body.scrollTop || 0);
    }
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
   } catch (err) {
    setStatus('Error unpacking: ' + err.message);
    console.error('Bundle unpack error:', err);
  }
});

  