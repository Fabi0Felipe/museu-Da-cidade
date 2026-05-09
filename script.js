/**
 * Museu Digital — Alto do Rodrigues
 * Interações: navegação, scroll reveal, modal, filtros e painéis animados
 */

(function () {
  "use strict";

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

  function closeMobileNav() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", "false");
    navMenu.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  }

  function openMobileNav() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", "true");
    navMenu.classList.add("is-open");
    document.body.classList.add("nav-open");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      if (open) closeMobileNav();
      else openMobileNav();
    });

    navMenu.querySelectorAll(".nav__link").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 880px)").matches) closeMobileNav();
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMobileNav();
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

  /** Reveal on scroll */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
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

  function openModal(src, caption, alt) {
    if (!modal || !modalImg || !modalCap) return;
    lastFocus = document.activeElement;
    modalImg.src = src;
    modalImg.alt = alt || "";
    modalCap.textContent = caption || "";
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
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onDocKeyDown);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    lastFocus = null;
  }

  document.querySelectorAll("[data-modal-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var src = btn.getAttribute("data-src") || "";
      var caption = btn.getAttribute("data-caption") || "";
      var imgEl = btn.querySelector("img");
      var alt = imgEl ? imgEl.getAttribute("alt") || "" : "";
      if (src) openModal(src, caption, alt);
    });
  });

  if (modal) {
    modal.querySelectorAll("[data-modal-close]").forEach(function (el) {
      el.addEventListener("click", function () {
        closeModal();
      });
    });

  }

})();

