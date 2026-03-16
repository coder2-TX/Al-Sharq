(function () {
  const selector = '.lp-communicationsS3[data-slider]';
  const initialized = new WeakSet();

  function setViewportHeight(viewport, activeSlide) {
    if (!viewport || !activeSlide) return;
    requestAnimationFrame(() => {
      viewport.style.height = activeSlide.offsetHeight + 'px';
    });
  }

  function initSlider(root) {
    if (!root || initialized.has(root)) return;

    const viewport = root.querySelector('[data-slider-viewport]');
    const slides = Array.from(root.querySelectorAll('[data-slide]'));
    const prevBtn = root.querySelector('[data-dir="prev"]');
    const nextBtn = root.querySelector('[data-dir="next"]');

    if (!viewport || !slides.length || !prevBtn || !nextBtn) return;

    initialized.add(root);

    let currentIndex = slides.findIndex(slide => slide.classList.contains('is-active'));
    if (currentIndex < 0) currentIndex = 0;

    const autoplayDelay = Math.max(
      1000,
      parseInt(root.getAttribute('data-autoplay') || '5000', 10)
    );

    let intervalId = null;
    let resizeObserver = null;

    function showSlide(index) {
      currentIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        const isActive = i === currentIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });

      setViewportHeight(viewport, slides[currentIndex]);
    }

    function stopAutoplay() {
      if (!intervalId) return;
      window.clearInterval(intervalId);
      intervalId = null;
    }

    function startAutoplay() {
      stopAutoplay();
      intervalId = window.setInterval(() => {
        showSlide(currentIndex + 1);
      }, autoplayDelay);
    }

    prevBtn.addEventListener('click', () => {
      showSlide(currentIndex - 1);
      startAutoplay();
    });

    nextBtn.addEventListener('click', () => {
      showSlide(currentIndex + 1);
      startAutoplay();
    });

    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', startAutoplay);

    root.addEventListener('focusin', stopAutoplay);
    root.addEventListener('focusout', (event) => {
      if (!root.contains(event.relatedTarget)) {
        startAutoplay();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    window.addEventListener('resize', () => {
      setViewportHeight(viewport, slides[currentIndex]);
    });

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        setViewportHeight(viewport, slides[currentIndex]);
      });

      slides.forEach(slide => resizeObserver.observe(slide));
    }

    showSlide(currentIndex);
    startAutoplay();
  }

  function initAll() {
    document.querySelectorAll(selector).forEach(initSlider);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  const observer = new MutationObserver(() => {
    initAll();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();