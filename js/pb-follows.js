/* Shared follow state for Studio sellers (localStorage) */
(function (global) {
  var KEY = 'pb-followed-sellers';

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.filter(Boolean) : [];
    } catch (e) {
      return [];
    }
  }

  function write(ids) {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch (e) {}
  }

  function isFollowing(id) {
    if (!id) return false;
    return read().indexOf(String(id)) >= 0;
  }

  function follow(id) {
    id = String(id || '');
    if (!id) return false;
    var list = read();
    if (list.indexOf(id) < 0) {
      list.push(id);
      write(list);
    }
    return true;
  }

  function unfollow(id) {
    id = String(id || '');
    write(read().filter(function (x) { return x !== id; }));
    return false;
  }

  function toggle(id) {
    if (isFollowing(id)) return unfollow(id);
    return follow(id);
  }

  function all() {
    return read().slice();
  }

  global.pbFollows = {
    KEY: KEY,
    all: all,
    isFollowing: isFollowing,
    follow: follow,
    unfollow: unfollow,
    toggle: toggle
  };
})(window);
