/* Studio demo auth (localStorage) */
(function (global) {
  var KEY = 'pb-studio-auth';

  function isLoggedIn() {
    try {
      return !!localStorage.getItem(KEY);
    } catch (e) {
      return false;
    }
  }

  function login(payload) {
    try {
      localStorage.setItem(KEY, JSON.stringify(payload || { at: Date.now() }));
    } catch (e) {}
  }

  function logout() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {}
  }

  function nextUrl(fallback) {
    try {
      var u = new URL(location.href);
      return u.searchParams.get('next') || fallback || 'dashboard.html';
    } catch (e) {
      return fallback || 'dashboard.html';
    }
  }

  function loginHref(next) {
    var target = next || (location.pathname.split('/').pop() + location.search);
    return 'login.html?next=' + encodeURIComponent(target || 'dashboard.html');
  }

  global.pbAuth = {
    KEY: KEY,
    isLoggedIn: isLoggedIn,
    login: login,
    logout: logout,
    nextUrl: nextUrl,
    loginHref: loginHref
  };
})(window);
