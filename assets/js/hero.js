(() => {
  "use strict";

  let inited = false;

  window.lpInitHeroLines = function lpInitHeroLines() {
    if (inited) return;
    inited = true;

    if (!window.gsap) return;

    const setupTravelDash = (el, segRatio = 0.35) => {
      if (!el || typeof el.getTotalLength !== "function") return null;

      const len = el.getTotalLength();
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

    if (topLines.length) animateLineGroup(topLines, { stagger: 0.22, duration: 1.2, segRatio: 0.32, dir: 1 });
    if (botLines.length) animateLineGroup(botLines, { stagger: 0.22, duration: 1.2, segRatio: 0.32, dir: -1 });
  };

  const boot = () => {
    const tryInit = () => {
      if (window.gsap && typeof window.lpInitHeroLines === "function") {
        window.lpInitHeroLines();
      } else {
        setTimeout(tryInit, 60);
      }
    };
    tryInit();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
