/* assets/js/partners.js */

(() => {
  function lpInitPartners() {
    const el = document.querySelector("#lp-partners-logos");
    if (!el) return false;

    // منع التهيئة المكررة (مهم لأن partials تنحمل بعدين)
    if (el.dataset.splideInit === "1") return true;
    el.dataset.splideInit = "1";

    if (!window.Splide) {
      console.error("Splide is not loaded. Add Splide CDN scripts before assets/js/partners.js");
      return false;
    }

    const isRtl =
      (document.documentElement.getAttribute("dir") || "rtl").toLowerCase() === "rtl";

    const splide = new Splide("#lp-partners-logos", {
      type: "loop",
      perPage: 5,
      gap: "1.25rem",
      arrows: false,
      pagination: false,
      drag: "free",
      focus: "center",
      direction: isRtl ? "rtl" : "ltr",
      autoScroll: { speed: 0.5, autoStart: true },
      breakpoints: {
        1300: { perPage: 4 },
        991: { perPage: 2 },
        479: { perPage: 2 },
        355: { perPage: 1 },
      },
    });

    // حسب توثيق Splide AutoScroll عند استخدام CDN:
    // mount(window.splide.Extensions)
    const extensions =
      window.splide && window.splide.Extensions ? window.splide.Extensions : {};

    splide.mount(extensions);
    return true;
  }

  window.lpInitPartners = lpInitPartners;

  // لو الصفحة بدون partial loader (اختياري)
  document.addEventListener("DOMContentLoaded", () => {
    lpInitPartners();
  });
})();
