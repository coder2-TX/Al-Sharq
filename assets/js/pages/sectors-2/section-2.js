/* assets\js\pages\sectors-2\section-2.js */
(function () {
  function initSector2Reveal(context) {
    var root = context || document;
    var sections = root.querySelectorAll('.lp-sectorsSection2');

    if (!sections.length) return;

    sections.forEach(function (section) {
      if (section.dataset.s2RevealBound === '1') return;

      section.dataset.s2RevealBound = '1';
      section.classList.add('is-reveal-init');

      var items = section.querySelectorAll('.lp-s2Reveal');
      if (!items.length) return;

      if (
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        items.forEach(function (item) {
          item.classList.add('is-visible');
        });
        return;
      }

      if (!('IntersectionObserver' in window)) {
        items.forEach(function (item) {
          item.classList.add('is-visible');
        });
        return;
      }

      var observer = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          });
        },
        {
          threshold: 0.18,
          rootMargin: '0px 0px -8% 0px'
        }
      );

      items.forEach(function (item) {
        observer.observe(item);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initSector2Reveal(document);
    });
  } else {
    initSector2Reveal(document);
  }

  window.initSector2Reveal = initSector2Reveal;
})();