/**
 * Museu Digital — Alto do Rodrigues
 * Interações: navegação, scroll reveal, modal, filtros e painéis animados
 */

(function () {
  "use strict";

  /** Breakpoints alinhados ao CSS (480 | 768 | 1024 | 1440) */
  var BP = {
    tablet: "(max-width: 1024px)",
    phone: "(max-width: 768px)",
    small: "(max-width: 480px)",
  };

  function mq(query) {
    return typeof window.matchMedia === "function" && window.matchMedia(query).matches;
  }

  /** Scroll suave para âncoras internas */
  document.querySelectorAll('a[data-smooth][href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = this.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var header = document.querySelector(".header");
      var offset = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset - 8;
      window.scrollTo({ top: top, behavior: "smooth" });
      closeMobileNav();
    });
  });

  /** Menu mobile */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  function syncMobileNavA11y() {
    if (!navMenu) return;
    var mobile = mq(BP.tablet);
    if (mobile) {
      var open = navMenu.classList.contains("is-open");
      navMenu.setAttribute("aria-hidden", open ? "false" : "true");
    } else {
      navMenu.removeAttribute("aria-hidden");
    }
  }

  function closeMobileNav() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", "false");
    navMenu.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    syncMobileNavA11y();
  }

  function openMobileNav() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", "true");
    navMenu.classList.add("is-open");
    document.body.classList.add("nav-open");
    syncMobileNavA11y();
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      if (open) closeMobileNav();
      else openMobileNav();
    });

    navMenu.querySelectorAll(".nav__link").forEach(function (link) {
      link.addEventListener("click", function () {
        if (mq(BP.tablet)) closeMobileNav();
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMobileNav();
    });

    window.addEventListener(
      "resize",
      function () {
        if (!mq(BP.tablet)) closeMobileNav();
        else syncMobileNavA11y();
      },
      { passive: true }
    );

    window.addEventListener(
      "orientationchange",
      function () {
        if (mq(BP.tablet)) closeMobileNav();
      },
      { passive: true }
    );

    syncMobileNavA11y();

    navMenu.querySelectorAll("[data-nav-close]").forEach(function (el) {
      el.addEventListener("click", function () {
        closeMobileNav();
      });
    });
  }

  /** Header ao rolar */
  var headerEl = document.querySelector(".header");
  function onScrollHeader() {
    if (!headerEl) return;
    if (window.scrollY > 24) headerEl.classList.add("is-scrolled");
    else headerEl.classList.remove("is-scrolled");
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /** Ano no rodapé */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /** Painel hero — missão */
  var heroBtn = document.getElementById("heroRevealBtn");
  var heroPanel = document.getElementById("heroPanel");
  if (heroBtn && heroPanel) {
    heroBtn.addEventListener("click", function () {
      var collapsed = heroPanel.classList.toggle("hero__panel--collapsed");
      heroPanel.setAttribute("aria-hidden", collapsed ? "true" : "false");
      heroBtn.textContent = collapsed ? "Ver objetivo do museu" : "Ocultar objetivo";
    });
  }

  /** Acordeão — linha do tempo */
  var aboutToggle = document.getElementById("aboutToggle");
  var aboutDetails = document.getElementById("aboutDetails");
  if (aboutToggle && aboutDetails) {
    aboutToggle.addEventListener("click", function () {
      var expanded = aboutToggle.getAttribute("aria-expanded") === "true";
      var next = !expanded;
      aboutToggle.setAttribute("aria-expanded", next ? "true" : "false");
      aboutDetails.classList.toggle("about__details--collapsed", !next);
      aboutDetails.setAttribute("aria-hidden", next ? "false" : "true");
    });
  }

  /** Reveal on scroll — margens ajustadas por viewport */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var narrow = mq(BP.phone);
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: narrow ? "0px 0px -2% 0px" : "0px 0px -8% 0px",
        threshold: narrow ? 0.05 : 0.08,
      }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /** Galeria — filtro */
  var chips = document.querySelectorAll(".gallery__chip");
  var galleryItems = document.querySelectorAll(".gallery__item");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter") || "all";

      chips.forEach(function (c) {
        c.classList.toggle("is-active", c === chip);
        c.setAttribute("aria-selected", c === chip ? "true" : "false");
      });

      galleryItems.forEach(function (item) {
        var cat = item.getAttribute("data-category") || "";
        var show = filter === "all" || cat === filter;
        item.classList.toggle("is-hidden", !show);
      });
    });
  });

  /** Modal da galeria */
  var modal = document.getElementById("galleryModal");
  var modalImg = document.getElementById("modalImage");
  var modalCap = document.getElementById("modalCaption");
  var modalTitle = document.getElementById("modalTitle");
  var lastFocus = null;

  function onDocKeyDown(e) {
    if (e.key === "Escape") closeModal();
  }

  function openModal(src, caption, alt, crop) {
    if (!modal || !modalImg || !modalCap) return;
    lastFocus = document.activeElement;
    modalImg.src = src;
    modalImg.alt = alt || "";
    modalCap.textContent = caption || "";
    if (crop) modalImg.setAttribute("data-crop", crop);
    else modalImg.removeAttribute("data-crop");
    if (modalTitle) modalTitle.textContent = alt ? "Imagem: " + alt : "Visual ampliado";
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onDocKeyDown);
    var closeBtn = modal.querySelector(".modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal || !modalImg) return;
    if (modal.hidden) return;
    modal.hidden = true;
    modalImg.removeAttribute("src");
    modalImg.alt = "";
    modalImg.removeAttribute("data-crop");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onDocKeyDown);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    lastFocus = null;
  }

  document.querySelectorAll("[data-modal-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var src = btn.getAttribute("data-src") || "";
      var caption = btn.getAttribute("data-caption") || "";
      var crop = btn.getAttribute("data-crop") || "";
      var imgEl = btn.querySelector("img");
      var alt = imgEl ? imgEl.getAttribute("alt") || "" : "";
      if (src) openModal(src, caption, alt, crop);
    });
  });

  if (modal) {
    modal.querySelectorAll("[data-modal-close]").forEach(function (el) {
      el.addEventListener("click", function () {
        closeModal();
      });
    });

    window.addEventListener(
      "orientationchange",
      function () {
        if (!modal.hidden) closeModal();
      },
      { passive: true }
    );
  }

  /** Cards culturais — toque em telas sem hover */
  var hcards = document.querySelectorAll(".hcard");
  hcards.forEach(function (card) {
    card.setAttribute("aria-expanded", "false");

    card.addEventListener("click", function () {
      if (!mq("(hover: none)")) return;
      var expanded = card.classList.toggle("is-expanded");
      card.setAttribute("aria-expanded", expanded ? "true" : "false");
    });

    card.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      var expanded = card.classList.toggle("is-expanded");
      card.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  });

  /** Áudio ambiente: só após gesto do usuário (autoplay policies); loop e volume baixíssimo */
  var ambientBg = document.getElementById("siteAmbientBg");
  if (ambientBg) {
    ambientBg.volume = 1;

    var ambientArmed = false;
    function startAmbientBg() {
      if (ambientArmed) return;
      ambientArmed = true;
      document.removeEventListener("pointerdown", startAmbientBg);
      document.removeEventListener("keydown", startAmbientBg);
      var pending = ambientBg.play();
      if (pending && typeof pending.catch === "function") {
        pending.catch(function () {
          ambientArmed = false;
          document.addEventListener("pointerdown", startAmbientBg, { passive: true });
          document.addEventListener("keydown", startAmbientBg, { passive: true });
        });
      }
    }

    document.addEventListener("pointerdown", startAmbientBg, { passive: true });
    document.addEventListener("keydown", startAmbientBg, { passive: true });
  }

})();

