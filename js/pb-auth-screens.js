/* Shared Softgen auth screen helpers */
(function (global) {
  function qs(name) {
    try {
      return new URL(location.href).searchParams.get(name);
    } catch (e) {
      return null;
    }
  }

  function nextParam() {
    return qs('next') || '';
  }

  function withNext(href) {
    var n = nextParam();
    if (!n) return href;
    var join = href.indexOf('?') >= 0 ? '&' : '?';
    return href + join + 'next=' + encodeURIComponent(n);
  }

  function destination(fallback) {
    return (global.pbAuth && pbAuth.nextUrl(fallback || 'dashboard.html')) || fallback || 'dashboard.html';
  }

  function setError(fieldEl, on) {
    if (!fieldEl) return;
    fieldEl.classList.toggle('is-error', !!on);
    var input = fieldEl.querySelector('.pb-auth-input');
    if (input) input.classList.toggle('is-error', !!on);
  }

  function bindEye(btn) {
    if (!btn) return;
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-eye');
      var input = id ? document.getElementById(id) : btn.parentElement.querySelector('input');
      if (!input) return;
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  }

  function digitsOnly(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function validPhone(value) {
    var d = digitsOnly(value);
    return d.length >= 10;
  }

  function passwordRules(value) {
    var v = value || '';
    return {
      len: v.length >= 8,
      upper: /[A-Z]/.test(v),
      lower: /[a-z]/.test(v),
      num: /[0-9]/.test(v),
      special: /[^A-Za-z0-9]/.test(v)
    };
  }

  function allRulesOk(rules) {
    return rules.len && rules.upper && rules.lower && rules.num && rules.special;
  }

  function paintRules(root, rules) {
    if (!root) return;
    Array.prototype.forEach.call(root.querySelectorAll('[data-rule]'), function (el) {
      var key = el.getAttribute('data-rule');
      el.classList.toggle('is-ok', !!(rules && rules[key]));
    });
  }

  function loginDemo(payload) {
    if (global.pbAuth) pbAuth.login(payload || { at: Date.now() });
    location.replace(destination('dashboard.html'));
  }

  global.pbAuthScreens = {
    qs: qs,
    nextParam: nextParam,
    withNext: withNext,
    destination: destination,
    setError: setError,
    bindEye: bindEye,
    digitsOnly: digitsOnly,
    validPhone: validPhone,
    passwordRules: passwordRules,
    allRulesOk: allRulesOk,
    paintRules: paintRules,
    loginDemo: loginDemo
  };
})(window);
