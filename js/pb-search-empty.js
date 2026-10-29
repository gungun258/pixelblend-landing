/* Shared Softgen-style “no search results” markup helper */
(function (global) {
  var ART =
    '<div class="pb-search-empty-art" aria-hidden="true">' +
      '<div class="blob"></div>' +
      '<svg width="112" height="112" viewBox="0 0 112 112" fill="none">' +
        '<rect x="22" y="18" width="52" height="66" rx="12" fill="#fff" stroke="#E9D5FF" stroke-width="2.2"/>' +
        '<path d="M34 36h28M34 46h22M34 56h26" stroke="#E9D5FF" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="68" cy="68" r="18" fill="#FDF2F8" stroke="#C42E8B" stroke-width="3"/>' +
        '<path d="M80.5 80.5L92 92" stroke="#C42E8B" stroke-width="3.4" stroke-linecap="round"/>' +
        '<circle cx="68" cy="68" r="8.5" stroke="#EC4899" stroke-width="2.4"/>' +
        '<path d="M40 24l1.2 3.4L44.6 28.6 41.2 29.8 40 33.2l-1.2-3.4L35.4 28.6l3.4-1.2L40 24z" fill="#A855F7"/>' +
        '<path d="M86 34l1 2.8L90.8 37.8 87 38.8 86 41.6l-1-2.8L81.2 37.8 85 36.8 86 34z" fill="#EC4899"/>' +
        '<path d="M28 72l.75 2.1L31 75l-2.25.75L28 77.8l-.75-2.05L25 75l2.25-.9L28 72z" fill="#F472B6"/>' +
      '</svg>' +
    '</div>';

  function fill(el, title, body) {
    if (!el) return;
    el.classList.add('pb-search-empty');
    el.innerHTML =
      ART +
      '<h2>' + (title || 'No results found') + '</h2>' +
      '<p>' + (body || 'Try a different keyword or clear your search.') + '</p>';
  }

  global.pbSearchEmpty = { fill: fill, ART: ART };
})(window);
