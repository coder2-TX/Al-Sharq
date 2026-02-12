(() => {
  "use strict";

  let inited = false;
  let rtlType = null;

  const detectRtlScrollType = () => {
    if (rtlType) return rtlType;

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
      rtlType = "default";
    } else {
      el.scrollLeft = 1;
      rtlType = el.scrollLeft === 0 ? "negative" : "reverse";
    }

    document.body.removeChild(el);
    return rtlType;
  };

  const getNormalizedScrollLeft = (el) => {
    const dir = getComputedStyle(el).direction;
    if (dir !== "rtl") return el.scrollLeft;

    const type = detectRtlScrollType();
    if (type === "negative") return -el.scrollLeft;
    if (type === "reverse") return (el.scrollWidth - el.clientWidth) - el.scrollLeft;
    return el.scrollLeft;
  };

  const normalizedToRawScrollLeft = (el, value) => {
    const dir = getComputedStyle(el).direction;
    if (dir !== "rtl") return value;

    const type = detectRtlScrollType();
    if (type === "negative") return -value;
    if (type === "reverse") return (el.scrollWidth - el.clientWidth) - value;
    return value;
  };

  const initSectorsSection = (section) => {
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
          const raw = normalizedToRawScrollLeft(slider, target);
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
        const x = getNormalizedScrollLeft(slider);
        const idx = Math.round(x / pageSize);
        setActive(idx);
      };

      updateActiveFromScroll();

      let raf = 0;
      slider.addEventListener("scroll", () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(updateActiveFromScroll);
      }, { passive: true });

      slider.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

        e.preventDefault();

        const x = getNormalizedScrollLeft(slider);
        const cur = Math.round(x / pageSize);
        const next = e.key === "ArrowLeft" ? cur - 1 : cur + 1;

        const target = Math.max(0, Math.min(pageCount - 1, next)) * pageSize;
        const raw = normalizedToRawScrollLeft(slider, target);
        slider.scrollTo({ left: raw, behavior: "smooth" });
      });
    };

    build();
    window.addEventListener("resize", build);
  };

  window.lpInitSectors = function lpInitSectors() {
    if (inited) return;
    inited = true;

    const section = document.getElementById("sectors");
    if (section) initSectorsSection(section);
  };
})();
