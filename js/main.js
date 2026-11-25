/* مستودعات السلي — تفاعلات الصفحة (بدون مكتبات) */
(function () {
  "use strict";
  var C = window.SITE_CONFIG || {};
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 1) ربط البيانات من config.js ---------- */
  function waLink(text) {
    return "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(text || C.whatsappMessage || "");
  }
  if (C.whatsapp) $$("[data-wa]").forEach(function (a) { a.href = waLink(a.getAttribute("data-wa-msg")); });
  if (C.phoneIntl) $$("[data-tel]").forEach(function (a) { a.href = "tel:" + C.phoneIntl; });
  if (C.mapsUrl) $$("[data-maps]").forEach(function (a) { a.href = C.mapsUrl; });
  if (C.adLicenseUrl) $$("[data-ad-url]").forEach(function (a) { a.href = C.adLicenseUrl; });
  if (C.adLicenseQr) $$("[data-qr]").forEach(function (img) { img.src = C.adLicenseQr; });
  $$("[data-cfg]").forEach(function (el) {
    var v = C[el.getAttribute("data-cfg")];
    if (v != null) el.textContent = v;
  });
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  // Schema.org (RealEstateListing + Place) من نفس الإعدادات
  try {
    var url = (C.siteUrl || location.origin).replace(/\/$/, "") + "/";
    var ld = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": "مستودعات السلي للبيع – Sulay Warehouses",
      "description": "4 مستودعات جاهزة للبيع في شمال السلي بالرياض: أرض 10,680 م²، مسطح بناء 6,908 م²، 3 مستودعات تخزين جاف ومستودع تخزين مبرد، و3 واجهات.",
      "url": url,
      "image": [url + "og.jpg"],
      "inLanguage": "ar",
      "offers": { "@type": "Offer", "businessFunction": "http://purl.org/goodrelations/v1#Sell", "availability": "https://schema.org/InStock" },
      "about": {
        "@type": "Place",
        "name": "مستودعات السلي",
        "address": { "@type": "PostalAddress", "addressLocality": "الرياض", "addressRegion": "الرياض", "streetAddress": "شمال السلي", "addressCountry": "SA" },
        "geo": { "@type": "GeoCoordinates", "latitude": C.lat, "longitude": C.lng },
        "hasMap": C.mapsUrl,
        "additionalProperty": [
          { "@type": "PropertyValue", "name": "مساحة الأرض", "value": 10680, "unitText": "م²" },
          { "@type": "PropertyValue", "name": "مسطح البناء", "value": 6908, "unitText": "م²" },
          { "@type": "PropertyValue", "name": "عدد المستودعات", "value": 4 }
        ]
      },
      "provider": {
        "@type": "RealEstateAgent",
        "name": C.marketerName + " – " + C.marketerNameEn,
        "telephone": C.phoneIntl,
        "identifier": [
          { "@type": "PropertyValue", "name": "رخصة فال", "value": C.falLicense },
          { "@type": "PropertyValue", "name": "رقم ترخيص الإعلان", "value": C.adLicense }
        ]
      }
    };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  } catch (e) { /* noop */ }

  /* ---------- 2) الشريط العلوي + زر واتساب + الشريط السفلي ---------- */
  var topbar = $(".topbar"), fab = $(".fab"), mbar = $(".mbar"), hero = $(".hero");
  function onScroll() {
    var yy = window.scrollY;
    var heroH = hero ? hero.offsetHeight : 600;
    topbar.classList.toggle("is-solid", yy > 40);
    var past = yy > heroH * 0.6;
    if (fab) fab.classList.toggle("is-visible", past);
    if (mbar) mbar.classList.toggle("is-visible", past);
    if (yy < heroH * 0.5) $$(".nav a.is-active").forEach(function (a) { a.classList.remove("is-active"); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // الرابط النشط في القائمة
  var navLinks = $$(".nav a");
  if ("IntersectionObserver" in window && navLinks.length) {
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          navLinks.forEach(function (a) { a.classList.remove("is-active"); });
          map[en.target.id].classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) navIO.observe(el); });
  }

  /* ---------- 3) Parallax خفيف على البطل ---------- */
  var media = $("[data-parallax]");
  if (media && !reduceMotion) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var yy = window.scrollY;
        if (yy < window.innerHeight * 1.2) media.style.transform = "translate3d(0," + (yy * 0.22).toFixed(1) + "px,0)";
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- 4) الظهور عند التمرير + العدادات ---------- */
  function fmt(n) { return n.toLocaleString("en-US"); }
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduceMotion || target < 10) { el.textContent = fmt(target); return; }
    var start = null, dur = 1600;
    el.textContent = "0";
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var reveals = $$(".reveal");
  // تأخير متدرج للعناصر المتجاورة
  $$(".stats__grid, .ft-grid, .fac, .gl, .wh__cards").forEach(function (g) {
    $$(".reveal", g).forEach(function (el, i) { el.style.setProperty("--d", (i * 0.08) + "s"); });
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        $$("[data-count]", en.target).forEach(runCounter);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  // تحميل الخلفيات الزخرفية عند الاقتراب فقط
  var bgs = $$(".warehouses, .features, .contact");
  if ("IntersectionObserver" in window) {
    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("bg-in"); bio.unobserve(en.target); } });
    }, { rootMargin: "600px 0px" });
    bgs.forEach(function (el) { bio.observe(el); });
  } else bgs.forEach(function (el) { el.classList.add("bg-in"); });

  /* ---------- 5) المستودعات: بطاقات ↔ المسقط ---------- */
  var planSvg = $(".plan__svg");
  var cards = $$(".whc");
  var zones = $$(".zone");
  function setActive(id, opts) {
    opts = opts || {};
    zones.forEach(function (z) { z.classList.toggle("is-active", z.getAttribute("data-zone") === id); z.setAttribute("aria-pressed", z.getAttribute("data-zone") === id ? "true" : "false"); });
    cards.forEach(function (c) { c.classList.toggle("is-active", c.getAttribute("data-zone") === id); });
    if (planSvg) planSvg.classList.toggle("has-active", !!id);
    if (opts.scrollCard && id) {
      var card = $('.whc[data-zone="' + id + '"]');
      if (card && window.innerWidth < 1000) card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    }
    if (opts.scrollPlan && window.innerWidth < 1000) {
      var plan = $(".plan");
      var r = plan.getBoundingClientRect();
      if (r.bottom < 80 || r.top > window.innerHeight - 80) plan.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  }
  function toggleCard(card, open) {
    var btn = $(".whc__head", card), more = $(".whc__more", card);
    var willOpen = open != null ? open : btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    more.hidden = !willOpen;
  }
  cards.forEach(function (card) {
    var id = card.getAttribute("data-zone");
    $(".whc__head", card).addEventListener("click", function () {
      var wasOpen = this.getAttribute("aria-expanded") === "true";
      toggleCard(card, !wasOpen);
      setActive(id);
    });
    card.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) setActive(id); });
  });
  zones.forEach(function (z) {
    var id = z.getAttribute("data-zone");
    function pick() {
      setActive(id, { scrollCard: true });
      var card = $('.whc[data-zone="' + id + '"]');
      if (card) toggleCard(card, true);
    }
    z.addEventListener("click", pick);
    z.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  });
  setActive("w12");

  /* ---------- 6) الأسئلة + المرافق (تتوسع عند الضغط) ---------- */
  $$(".acc__btn, .fac__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      document.getElementById(btn.getAttribute("aria-controls")).hidden = open;
    });
  });

  /* ---------- 7) عارض الصور ---------- */
  var lb = $("#lightbox");
  var items = $$(".gl__btn");
  var cur = 0, lastFocus = null;
  var lbImg = $(".lb__img", lb), lbAvif = $(".lb__avif", lb), lbCap = $(".lb__cap", lb), lbCount = $(".lb__count", lb);
  function show(i) {
    cur = (i + items.length) % items.length;
    var b = items[cur], alt = $("img", b).alt;
    lbAvif.srcset = b.getAttribute("data-full-avif");
    lbImg.src = b.getAttribute("data-full");
    lbImg.width = +b.getAttribute("data-w"); lbImg.height = +b.getAttribute("data-h");
    lbImg.alt = alt; lbCap.textContent = alt;
    lbCount.textContent = (cur + 1) + " / " + items.length;
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    show(i); lb.hidden = false; document.body.style.overflow = "hidden";
    $(".lb__close", lb).focus();
  }
  function closeLb() {
    lb.hidden = true; document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  items.forEach(function (b, i) { b.addEventListener("click", function () { openLb(i); }); });
  $(".lb__close", lb).addEventListener("click", closeLb);
  // في RTL: "التالي" إلى اليسار و"السابق" إلى اليمين
  $(".lb__nav--next", lb).addEventListener("click", function () { show(cur + 1); });
  $(".lb__nav--prev", lb).addEventListener("click", function () { show(cur - 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowLeft") show(cur + 1);
    else if (e.key === "ArrowRight") show(cur - 1);
    else if (e.key === "Tab") { // حصر التركيز داخل العارض
      var f = $$("button", lb), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (tx == null) return;
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(dx > 0 ? cur + 1 : cur - 1); // سحب لليمين = التالي (RTL)
    tx = null;
  });

  /* ---------- 8) نموذج التواصل → واتساب ---------- */
  var form = $("#lead-form");
  if (form) {
    var nameI = $("#f-name"), phoneI = $("#f-phone");
    function normPhone(v) {
      v = (v || "").replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).replace(/[^\d+]/g, "");
      return v;
    }
    function setErr(input, bad) {
      input.setAttribute("aria-invalid", bad ? "true" : "false");
      var err = document.getElementById(input.id + "-err");
      err.hidden = !bad;
      if (bad) input.setAttribute("aria-describedby", err.id); else input.removeAttribute("aria-describedby");
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = nameI.value.trim();
      var phone = normPhone(phoneI.value);
      var digits = phone.replace(/\D/g, "");
      var badName = name.length < 2, badPhone = digits.length < 9 || digits.length > 15;
      setErr(nameI, badName); setErr(phoneI, badPhone);
      if (badName) { nameI.focus(); return; }
      if (badPhone) { phoneI.focus(); return; }
      var role = (form.querySelector('input[name="role"]:checked') || {}).value || "";
      var msg = "السلام عليكم،\nأرغب في معرفة تفاصيل وسعر مستودعات السلي (شمال السلي – الرياض).\n\n" +
        "الاسم: " + name + "\n" +
        "الجوال: " + phone + "\n" +
        "الصفة: " + role;
      window.open(waLink(msg), "_blank", "noopener");
    });
    [nameI, phoneI].forEach(function (i) { i.addEventListener("input", function () { if (i.getAttribute("aria-invalid") === "true") setErr(i, false); }); });
  }

})();
