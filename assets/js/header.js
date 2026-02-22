// assets/js/header.js
(() => {
  "use strict";

  let inited = false;

  // ✅ Retry if header partial isn't in DOM yet
  let retryCount = 0;
  const MAX_RETRIES = 30;   // 30 * 50ms = 1.5s max
  const RETRY_DELAY = 50;

  window.lpInitHeader = function lpInitHeader() {
    // ✅ Don't lock init until header exists
    if (inited) return;

    const drawer = document.getElementById("lpDrawer");
    const menuBtn = document.getElementById("lpMenuBtn");

    // if called too early (before partial injected), retry
    if (!drawer || !menuBtn) {
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        window.setTimeout(window.lpInitHeader, RETRY_DELAY);
      }
      return;
    }

    // ✅ Now it's safe to lock init
    inited = true;

    const panel = drawer.querySelector(".lp-drawer__panel");
    const icon = menuBtn.querySelector("i");
    if (!panel) return;

    // ✅ Optional Brand Mark (per-page)
    const brand = document.getElementById("lpHeaderBrand");
    const brandImg = document.getElementById("lpHeaderBrandImg");
    const headerSlot = document.getElementById("header-slot");

    const toBool = (v) => {
      if (v === undefined || v === null) return false;
      const s = String(v).trim().toLowerCase();
      return s === "" || s === "1" || s === "true" || s === "yes" || s === "on";
    };

    const normalizePath = (p) => String(p || "").trim().replace(/\\/g, "/");

    const resolveUrl = (p) => {
      const s = normalizePath(p);
      if (!s) return "";
      if (/^(https?:)?\/\//i.test(s) || s.startsWith("data:") || s.startsWith("blob:")) return s;
      try {
        return new URL(s, window.location.href).href;
      } catch {
        return s;
      }
    };

    const hasAttr = (el, attr) => !!(el && el.hasAttribute && el.hasAttribute(attr));
    const getSlotData = (key) => (headerSlot && headerSlot.dataset ? headerSlot.dataset[key] : undefined);
    const getBodyData = (key) => (document.body && document.body.dataset ? document.body.dataset[key] : undefined);

    // ✅ showBrand: page decision first
    let showBrand = false;

    if (hasAttr(headerSlot, "data-show-brand")) {
      showBrand = toBool(getSlotData("showBrand"));
    } else if (hasAttr(document.body, "data-show-brand")) {
      showBrand = toBool(getBodyData("showBrand"));
    } else if (hasAttr(document.body, "data-header-brand")) {
      showBrand = toBool(getBodyData("headerBrand"));
    } else {
      showBrand = false;
    }

    const brandHref =
      (hasAttr(headerSlot, "data-brand-href") ? getSlotData("brandHref") : undefined) ||
      (hasAttr(document.body, "data-brand-href") ? getBodyData("brandHref") : undefined) ||
      "#home";

    const providedBrandSrc =
      (hasAttr(headerSlot, "data-brand-src") ? getSlotData("brandSrc") : undefined) ||
      (hasAttr(document.body, "data-brand-src") ? getBodyData("brandSrc") : undefined) ||
      "";

    if (brand) {
      if (showBrand) {
        brand.hidden = false;
        brand.setAttribute("href", brandHref);

        if (brandImg) {
          const candidates = [
            providedBrandSrc,
            "/assets/images/header/Brand_Mark.png",
            "../../assets/images/header/Brand_Mark.png",
            "../assets/images/header/Brand_Mark.png",
            "assets/images/header/Brand_Mark.png",
          ].filter(Boolean);

          const tryList = [...new Set(candidates.map(resolveUrl))];

          let i = 0;
          const applyNext = () => {
            if (i >= tryList.length) return;
            brandImg.src = tryList[i++];
          };

          brandImg.onerror = () => applyNext();
          applyNext();
        }
      } else {
        brand.hidden = true;
      }
    }

    // ✅ Header shadow only on scroll
    const headerEl = document.getElementById("lpHeader");
    const updateHeaderShadow = () => {
      const y = window.scrollY || window.pageYOffset || 0;
      document.body.classList.toggle("lp-header-scrolled", y > 6);
    };
    updateHeaderShadow();
    window.addEventListener("scroll", updateHeaderShadow, { passive: true });

    const focusableSel = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(panel.querySelectorAll(focusableSel));
    const isOpen = () => drawer.classList.contains("is-open");

    let lastActiveEl = null;
    let iconSwapTimer = 0;

    const setBtnState = (open, animateIcon = true) => {
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
      menuBtn.dataset.state = open ? "open" : "closed";

      if (!icon) return;

      if (!animateIcon) {
        menuBtn.removeAttribute("data-icon-anim");
        icon.classList.remove("fa-bars", "fa-xmark");
        icon.classList.add(open ? "fa-xmark" : "fa-bars");
        return;
      }

      clearTimeout(iconSwapTimer);
      menuBtn.dataset.iconAnim = "out";

      iconSwapTimer = window.setTimeout(() => {
        icon.classList.remove("fa-bars", "fa-xmark");
        icon.classList.add(open ? "fa-xmark" : "fa-bars");

        menuBtn.dataset.iconAnim = "in";

        iconSwapTimer = window.setTimeout(() => {
          menuBtn.removeAttribute("data-icon-anim");
        }, 180);
      }, 120);
    };

    const openDrawer = () => {
      if (isOpen()) return;

      lastActiveEl = document.activeElement;
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      document.body.classList.add("lp-drawer-open");
      setBtnState(true);

      requestAnimationFrame(() => {
        const f = getFocusable();
        const target = f[0] || panel;
        if (target && typeof target.focus === "function") target.focus();
      });
    };

    const closeDrawer = () => {
      if (!isOpen()) return;

      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lp-drawer-open");
      setBtnState(false, false);

      if (lastActiveEl && typeof lastActiveEl.focus === "function") {
        lastActiveEl.focus();
      }
    };

    setBtnState(false, false);

    menuBtn.addEventListener("click", () => {
      if (isOpen()) closeDrawer();
      else openDrawer();
    });

    drawer.addEventListener("click", (e) => {
      const t = e.target;
      if (!t) return;

      const closeEl = t.closest ? t.closest("[data-lp-drawer-close]") : null;
      if (closeEl) closeDrawer();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) {
        e.preventDefault();
        closeDrawer();
      }
    });

    panel.addEventListener("click", (e) => {
      const a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!a) return;

      const href = a.getAttribute("href") || "";
      if (href.startsWith("#")) closeDrawer();
    });

    drawer.addEventListener("keydown", (e) => {
      if (e.key !== "Tab" || !isOpen()) return;

      const f = getFocusable();
      if (f.length === 0) return;

      const first = f[0];
      const last = f[f.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  };
})();