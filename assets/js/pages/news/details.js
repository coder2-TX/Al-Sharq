/* assets/js/pages/news/details.js */

(function () {
  const NEWS = {
    1: {
      date: "Aug 23, 2025",
      image: "/assets/images/news/1.jpg",
      alt: "صورة الخبر 1",
      title:
        'تشرفت #شركة_الشرق_للتجارة_والتوكيلات " بالمشاركة الفعّالة في فعاليات المؤتمر العاشر لجراحة العظام، الذي عُقد في جامعة جبلة بمحافظة إب خلال يومي 20 و21 أغسطس 2025م.',
      body: `تشرفت #شركة_الشرق_للتجارة_والتوكيلات "

بالمشاركة الفعّالة في فعاليات المؤتمر العاشر لجراحة العظام، الذي عُقد في جامعة جبلة بمحافظة إب خلال يومي 20 و21 أغسطس 2025م.

ويأتي هذا المؤتمر ضمن الجهود المستمرة لتعزيز التطوير العلمي والمهني في مجال جراحة العظام في اليمن، بمشاركة نخبة من الأطباء والجراحين والخبراء المحليين والدوليين.

وقد أبدت اللجنة الإعلامية للمؤتمر، ممثلةً برئيسها الدكتور عبد الغني النوار، تقديرها لجميع المشاركين الذين ساهموا في إنجاح البرنامج الإعلامي، مؤكدة على الجهود الكبيرة التي بذلها أعضاء اللجنة العلمية والتحضيرية في تنظيم الفعاليات وضمان سيرها وفق أعلى المعايير العلمية.

كما أشادت اللجنة بدور الدكتور عبده الأزرق، الذي أعد برنامجاً علمياً متميزاً، بالإضافة إلى مساهمات الدكتور عبد الفتاح الصيادي والدكتور معتصر الصنوي والدكتور معين الدودحي، في ترتيب وتنظيم فعاليات المؤتمر بما يعكس مستوى عالي من الاحترافية والتنظيم.

وقد مثلت #شركة_الشرق_للتجارة_والتوكيلات جزءاً أساسياً من نجاح المؤتمر من خلال دعمها للفعاليات، وتقديمها الحلول والخدمات الطبية التي تسهم في رفع مستوى جودة الرعاية الصحية في اليمن.

وبهذا الدور الإيجابي، تؤكد #الشركة التزامها المستمر بدعم المجتمع الطبي والعلمي في كل ما من شأنه تعزيز المعرفة والخبرة الطبية.

في الختام، نتقدّم في #شركة_الشرق_للتجارة_والتوكيلات شكرنا الجزيل لكل الشركاء والمشاركين في المؤتمر، متمنين لهم دوام التقدم والنجاح، مؤكدين أن هذا التعاون المستمر سيكون محفزاً لمزيد من النجاحات المستقبلية في كافة الفعاليات والأنشطة العلمية القادمة !

#المؤتمر_العاشر_لجراحة_العظام "`,
    },
  };

  function getIdFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || "1";
  }

  function renderParagraphs(container, text) {
    container.innerHTML = "";
    const parts = String(text || "")
      .replace(/\r\n/g, "\n")
      .split("\n\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!parts.length) return;

    for (const part of parts) {
      const p = document.createElement("p");
      p.textContent = part;
      container.appendChild(p);
    }
  }

  //  سيتم استدعاؤها تلقائياً من app.js بعد تحميل partial
  window.lpInitNewsDetails = function lpInitNewsDetails() {
    const id = getIdFromQuery();
    const item = NEWS[id];

    const headlineEl = document.getElementById("newsDetailsHeadline");
    const dateEl = document.getElementById("newsDetailsDate");
    const metaEl = document.getElementById("newsDetailsMeta");
    const imgEl = document.getElementById("newsDetailsImage");
    const figEl = document.getElementById("newsDetailsFigure");
    const contentEl = document.getElementById("newsDetailsContent");

    if (!headlineEl || !imgEl || !contentEl) return;

    if (!item) {
      headlineEl.textContent = "عذراً، هذا الخبر غير موجود.";
      if (metaEl) metaEl.style.display = "none";
      if (figEl) figEl.style.display = "none";
      contentEl.textContent = "";
      return;
    }

    headlineEl.textContent = item.title || "—";

    // title in tab
    document.title = item.title
      ? item.title + " | شركة الشرق"
      : "تفاصيل الخبر | شركة الشرق";

    // date
    if (dateEl && metaEl) {
      if (item.date) {
        dateEl.textContent = item.date;
        metaEl.style.display = "inline-flex";
      } else {
        metaEl.style.display = "none";
      }
    }

    // image
    if (figEl) {
      if (item.image) {
        imgEl.src = item.image;
        imgEl.alt = item.alt || "صورة الخبر";
        figEl.style.display = "block";
      } else {
        figEl.style.display = "none";
      }
    }

    // body
    renderParagraphs(contentEl, item.body);
  };
})();
