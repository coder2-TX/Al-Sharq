(() => {
  "use strict";

  let inited = false;

  window.lpInitHeader = function lpInitHeader() {
    if (inited) return;
    inited = true;

    const drawer = document.getElementById("lpDrawer");
    const menuBtn = document.getElementById("lpMenuBtn");
    if (!drawer || !menuBtn) return;

    const panel = drawer.querySelector(".lp-drawer__panel");
    const icon = menuBtn.querySelector("i");
    if (!panel) return;

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
