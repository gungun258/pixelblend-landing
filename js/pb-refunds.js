/* PixelBlend Studio — refund requests (localStorage) */
(function (global) {
  var KEY = 'pb-refunds';
  var INIT = 'pb-refunds-seeded';
  var MAX = 40;

  var REASON_LABELS = {
    poor: 'Poor quality result',
    background: 'Background not applied correctly',
    colors: 'Colors are off/unrealistic',
    edges: 'Subject edges not clean',
    expected: 'Not what I expected',
    technical: 'Technical issue',
    other: 'Other'
  };

  var SEED = [
    {
      id: 'rf-seed-1',
      reasonKey: 'technical',
      reason: 'Technical issue',
      status: 'pending',
      generationId: '6ad8af10358d946f16624a4f',
      at: Date.parse('2026-10-21T18:04:00'),
      details: ''
    }
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
    try {
      localStorage.setItem(KEY, JSON.stringify((list || []).slice(0, MAX)));
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

  function reasonLabel(keyOrLabel) {
    if (!keyOrLabel) return 'Refund request';
    return REASON_LABELS[keyOrLabel] || keyOrLabel;
  }

  function formatWhen(ts) {
    try {
      return new Date(ts).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).replace(/,/g, ',');
    } catch (e) {
      return '';
    }
  }

  function list() {
    ensureSeed();
    return read().slice().sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
  }

  function add(payload) {
    ensureSeed();
    var reasonKey = payload && payload.reasonKey ? payload.reasonKey : (payload && payload.reason) || 'other';
    var item = {
      id: 'rf-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      reasonKey: reasonKey,
      reason: reasonLabel(reasonKey),
      status: (payload && payload.status) || 'pending',
      generationId: (payload && payload.generationId) || genId(),
      at: (payload && payload.at) || Date.now(),
      details: (payload && payload.details) || '',
      resultUrl: (payload && payload.resultUrl) || ''
    };
    // If reason was already a full label string
    if (payload && payload.reason && !REASON_LABELS[payload.reason]) {
      item.reason = payload.reason;
    }
    var cur = read();
    cur.unshift(item);
    write(cur);
    try {
      global.dispatchEvent(new CustomEvent('pb-refunds-change', { detail: item }));
    } catch (e) {}
    return item;
  }

  function genId() {
    var s = '';
    var hex = '0123456789abcdef';
    for (var i = 0; i < 24; i++) s += hex[Math.floor(Math.random() * 16)];
    return s;
  }

  function hasForGeneration(gid) {
    if (!gid) return false;
    return read().some(function (x) { return x.generationId === gid; });
  }

  global.pbRefunds = {
    list: list,
    add: add,
    reasonLabel: reasonLabel,
    formatWhen: formatWhen,
    hasForGeneration: hasForGeneration,
    ensureSeed: ensureSeed,
    REASON_LABELS: REASON_LABELS
  };
})(typeof window !== 'undefined' ? window : this);
