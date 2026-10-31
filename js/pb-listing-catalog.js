/* Shared listing galleries for Generation Result grid (seller listings) */
(function (global) {
  var GALLERIES = {
    'mountain-sunset': [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1400&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1400&q=85&auto=format&fit=crop'
    ],
    'night-sky': [
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1400&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1400&q=85&auto=format&fit=crop'
    ],
    'beach-waves': [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1400&q=85&auto=format&fit=crop'
    ],
    'forest-mist': [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1400&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511497584788-876760111969?w=1400&q=85&auto=format&fit=crop'
    ],
    'rustic-charm': [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583225214464-9296029427aa?w=1400&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=85&auto=format&fit=crop'
    ],
    'meadow-light': [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400&q=85&auto=format&fit=crop'
    ],
    'cosmic-drift': [
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1400&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1400&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=85&auto=format&fit=crop'
    ],
    'background-studio-1': [
      'assets/dashboard/images/img2.jpg',
      'assets/dashboard/images/img23.jpg',
      'assets/dashboard/images/img24.jpg'
    ],
    'studio-softbox': [
      'assets/dashboard/images/img25.jpg',
      'assets/dashboard/images/img26.jpg',
      'assets/dashboard/images/img31.jpg'
    ],
    'marble-luxe': [
      'assets/dashboard/images/img32.jpg',
      'assets/dashboard/images/img33.jpg',
      'assets/dashboard/images/img2.jpg'
    ]
  };

  function uniqueUrls(list) {
    var out = [];
    (list || []).forEach(function (u) {
      if (u && out.indexOf(u) < 0) out.push(u);
    });
    return out;
  }

  function resolveGallery(listing) {
    if (!listing) return [];
    var fromMeta = uniqueUrls(Array.isArray(listing.gallery) ? listing.gallery : []);
    if (fromMeta.length > 1) return fromMeta;
    var id = listing.id || '';
    if (id && GALLERIES[id] && GALLERIES[id].length) {
      var catalog = uniqueUrls(GALLERIES[id]);
      if (catalog.length > 1) return catalog;
    }
    // Fallback: listing cover + any meta urls (deduped) — never fake-duplicate for a 2-up grid
    var urls = [];
    if (listing.img) urls.push(listing.img);
    fromMeta.forEach(function (u) {
      if (u && urls.indexOf(u) < 0) urls.push(u);
    });
    return uniqueUrls(urls);
  }

  global.pbListingCatalog = {
    galleries: GALLERIES,
    resolveGallery: resolveGallery
  };
})(window);
