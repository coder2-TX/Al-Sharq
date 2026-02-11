(() => {
  const drawer = document.getElementById("lpDrawer");
  const menuBtn = document.getElementById("lpMenuBtn");

  if (drawer && menuBtn) {
    const panel = drawer.querySelector(".lp-drawer__panel");
    const icon = menuBtn.querySelector("i");


    // ✅ رجعنا التعريفات الناقصة
    const focusableSel = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => (panel ? Array.from(panel.querySelectorAll(focusableSel)) : []);
    const isOpen = () => drawer.classList.contains("is-open");

    let lastActiveEl = null;
    let iconSwapTimer = 0;


    // ✅ نفس الزر يفتح/يغلق بدون تغيير الأيقونة إلى X
// ✅ نفس الزر يفتح/يغلق + تبديل الأيقونة بسلاسة
const setBtnState = (open, animateIcon = true) => {
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  menuBtn.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
  menuBtn.dataset.state = open ? "open" : "closed";

  if (!icon) return;

  // ✅ أول تحميل: لا نعمل أنيميشن (حتى ما تومض الأيقونة)
  if (!animateIcon) {
    menuBtn.removeAttribute("data-icon-anim");
    icon.classList.remove("fa-bars", "fa-xmark");
    icon.classList.add(open ? "fa-xmark" : "fa-bars");
    return;
  }

  // ✅ أنيميشن: اطلع (fade/scale) -> بدّل -> ادخل (fade/scale)
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


    // ✅ نفس زر الهيدر يفتح/يغلق
    menuBtn.addEventListener("click", () => {
      if (isOpen()) closeDrawer();
      else openDrawer();
    });

    // ✅ الإغلاق بالضغط على الخلفية (backdrop)
    drawer.addEventListener("click", (e) => {
      const t = e.target;
      if (!t) return;

      const closeEl = t.closest ? t.closest("[data-lp-drawer-close]") : null;
      if (closeEl) closeDrawer();
    });

    // ✅ ESC يغلق
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) {
        e.preventDefault();
        closeDrawer();
      }
    });

    // ✅ الضغط على روابط # داخل القائمة يغلق
    if (panel) {
      panel.addEventListener("click", (e) => {
        const a = e.target && e.target.closest ? e.target.closest("a") : null;
        if (!a) return;
        const href = a.getAttribute("href") || "";
        if (href.startsWith("#")) closeDrawer();
      });
    }

    // ✅ trap focus
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
  }

  if (window.gsap) {
    const setupTravelDash = (el, segRatio = 0.35) => {
      if (!el || typeof el.getTotalLength !== "function") return null;

      const len = el.getTotalLength();
      el.dataset.len = String(len);

      const seg = Math.max(10, len * segRatio);
      el.style.strokeDasharray = `${seg} ${len}`;
      el.style.strokeDashoffset = "0";
      el.style.opacity = "0";

      return { len, seg };
    };

    const getTravelFactor = (el) => {
      if (el.classList.contains("lp-line--w10")) return 0.55;
      if (el.classList.contains("lp-line--w4")) return 0.72;
      return 0.88;
    };

    const animateLineGroup = (els, { stagger = 0.22, duration = 1.2, segRatio = 0.32, dir = -1 } = {}) => {
      els.forEach((el, i) => {
        const pack = setupTravelDash(el, segRatio);
        if (!pack) return;

        const { len } = pack;
        const travel = len * getTravelFactor(el);

        const setNewStart = () => {
          const start = Math.random() * len;
          gsap.set(el, { strokeDashoffset: start, opacity: 0 });
        };

        setNewStart();

        const tl = gsap.timeline({
          repeat: -1,
          repeatDelay: 0,
          delay: i * stagger,
          onRepeat: setNewStart,
        });

        tl.to(el, { opacity: 1, duration: duration * 0.18, ease: "none" }, 0);

        if (dir === 1) {
          tl.to(el, { strokeDashoffset: `+=${travel}`, duration, ease: "none" }, 0);
        } else {
          tl.to(el, { strokeDashoffset: `-=${travel}`, duration, ease: "none" }, 0);
        }

        tl.to(el, { opacity: 0, duration: duration * 0.22, ease: "none" }, duration * 0.78);
      });
    };

    const topLines = Array.from(document.querySelectorAll(".lp-lines--topStart .lp-line"));
    const botLines = Array.from(document.querySelectorAll(".lp-lines--bottomEnd .lp-line"));

    animateLineGroup(botLines, { stagger: 0.22, duration: 1.2, segRatio: 0.32, dir: -1 });
    animateLineGroup(topLines, { stagger: 0.22, duration: 1.2, segRatio: 0.32, dir: 1 });
  }

  let lpRtlType = null;

  function lpDetectRtlScrollType() {
    if (lpRtlType) return lpRtlType;

    const el = document.createElement("div");
    el.style.width = "100px";
    el.style.height = "100px";
    el.style.overflow = "scroll";
    el.style.direction = "rtl";
    el.style.position = "absolute";
    el.style.top = "-9999px";
    el.innerHTML = '<div style="width:200px;height:1px;"></div>';
    document.body.appendChild(el);

    if (el.scrollLeft > 0) {
      lpRtlType = "default";
    } else {
      el.scrollLeft = 1;
      lpRtlType = el.scrollLeft === 0 ? "negative" : "reverse";
    }

    document.body.removeChild(el);
    return lpRtlType;
  }

  function lpGetNormalizedScrollLeft(el) {
    const dir = getComputedStyle(el).direction;
    if (dir !== "rtl") return el.scrollLeft;

    const type = lpDetectRtlScrollType();
    if (type === "negative") return -el.scrollLeft;
    if (type === "reverse") return (el.scrollWidth - el.clientWidth) - el.scrollLeft;
    return el.scrollLeft;
  }

  function lpNormalizedToRawScrollLeft(el, value) {
    const dir = getComputedStyle(el).direction;
    if (dir !== "rtl") return value;

    const type = lpDetectRtlScrollType();
    if (type === "negative") return -value;
    if (type === "reverse") return (el.scrollWidth - el.clientWidth) - value;
    return value;
  }

  function initSectorsSection(section) {
    if (!section || section.dataset.lpSectorsInit === "1") return;
    section.dataset.lpSectorsInit = "1";

    const slider = section.querySelector("[data-lp-sectors-slider]");
    const dotsWrap = section.querySelector("[data-lp-sectors-dots]");
    const track = slider && slider.querySelector(".lp-sectors__track");
    const cards = track ? Array.from(track.querySelectorAll(".lp-sectorCard")) : [];

    if (!slider || !dotsWrap || !track || cards.length === 0) return;

    const build = () => {
      const perView = parseInt(getComputedStyle(slider).getPropertyValue("--per-view"), 10) || 1;
      const pageCount = Math.max(1, Math.ceil(cards.length / perView));

      dotsWrap.innerHTML = "";
      dotsWrap.style.display = pageCount <= 1 ? "none" : "flex";
      if (pageCount <= 1) return;

      let step = cards[0].offsetWidth;
      if (cards.length > 1) {
        step = Math.abs(cards[1].offsetLeft - cards[0].offsetLeft) || step;
      }

      const pageSize = step * perView;

      for (let i = 0; i < pageCount; i += 1) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "lp-sectors__dot";
        b.setAttribute("aria-label", `Slide ${i + 1} of ${pageCount}`);

        b.addEventListener("click", () => {
          const target = i * pageSize;
          const raw = lpNormalizedToRawScrollLeft(slider, target);
          slider.scrollTo({ left: raw, behavior: "smooth" });
        });

        dotsWrap.appendChild(b);
      }

      const dots = Array.from(dotsWrap.querySelectorAll(".lp-sectors__dot"));

      const setActive = (index) => {
        const safe = Math.max(0, Math.min(pageCount - 1, index));
        dots.forEach((d, idx) => d.setAttribute("aria-current", String(idx === safe)));
      };

      const updateActiveFromScroll = () => {
        const x = lpGetNormalizedScrollLeft(slider);
        const idx = Math.round(x / pageSize);
        setActive(idx);
      };

      updateActiveFromScroll();

      let raf = 0;
      slider.addEventListener(
        "scroll",
        () => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(updateActiveFromScroll);
        },
        { passive: true }
      );

      slider.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

        e.preventDefault();

        const x = lpGetNormalizedScrollLeft(slider);
        const cur = Math.round(x / pageSize);
        const next = e.key === "ArrowLeft" ? cur - 1 : cur + 1;

        const target = Math.max(0, Math.min(pageCount - 1, next)) * pageSize;
        const raw = lpNormalizedToRawScrollLeft(slider, target);
        slider.scrollTo({ left: raw, behavior: "smooth" });
      });
    };

    build();
    window.addEventListener("resize", build);
  }

  const bootSectors = () => {
    const existing = document.getElementById("sectors");
    if (existing) initSectorsSection(existing);

    const obs = new MutationObserver(() => {
      const el = document.getElementById("sectors");
      if (el) initSectorsSection(el);
    });

    obs.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootSectors);
  } else {
    bootSectors();
  }
})();
