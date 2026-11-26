(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  window.dataLayer = window.dataLayer || [];

  function isSet(val) {
    return (
      typeof val === "string" &&
      val.trim().length > 0 &&
      val.indexOf("{{") === -1 &&
      val.indexOf("}}") === -1
    );
  }

  function sanitizeText(str, maxLen) {
    if (typeof str !== "string") return "";
    return str.replace(/[<>]/g, "").trim().slice(0, maxLen || 300);
  }

  function buildWhatsAppUrl(message, numberOverride) {
    var rawNum = numberOverride || cfg.whatsappNumber || "";
    var digits = String(rawNum).replace(/\D/g, "");
    if (!digits) return "#contact";
    var text = encodeURIComponent(
      message || cfg.whatsappDefaultMessage || "Hi, I have an inquiry."
    );
    return "https://wa.me/" + digits + "?text=" + text;
  }

  function trackEvent(eventName, params) {
    try {
      var payload = Object.assign({ event: eventName }, params || {});
      window.dataLayer.push(payload);
      if (typeof window.gtag === "function") {
        window.gtag("event", eventName, params || {});
      }
    } catch (_) {
      // No-op if analytics is blocked
    }
  }

  function formatDisplayAddress() {
    var a = cfg.address || {};
    var line1 = isSet(a.street) ? a.street : "{{FULL_ADDRESS}}";
    var cityState = (a.city || "Lucknow") + ", " + (a.state || "Uttar Pradesh");
    var pin = isSet(a.pincode) ? " – " + a.pincode : " – {{PINCODE}}";
    return line1 + ",\n" + cityState + pin;
  }

  /* ---------- 1. Populate Config Bindings ---------- */
  function bindConfigValues() {
    // Primary phone links & text
    document.querySelectorAll('[data-bind="phone-href"]').forEach(function (el) {
      if (cfg.phoneHref) el.setAttribute("href", cfg.phoneHref);
    });
    document.querySelectorAll('[data-bind="phone-text"]').forEach(function (el) {
      if (cfg.phoneDisplay) el.textContent = cfg.phoneDisplay;
    });

    // Secondary phone links & text
    document
      .querySelectorAll('[data-bind="secondary-phone-href"]')
      .forEach(function (el) {
        if (cfg.secondaryPhoneHref) {
          el.setAttribute("href", cfg.secondaryPhoneHref);
        } else {
          el.style.display = "none";
        }
      });
    document
      .querySelectorAll('[data-bind="secondary-phone-text"]')
      .forEach(function (el) {
        if (cfg.secondaryPhoneDisplay) el.textContent = cfg.secondaryPhoneDisplay;
      });

    // Default WhatsApp links
    document.querySelectorAll('[data-bind="wa-default"]').forEach(function (el) {
      el.setAttribute("href", buildWhatsAppUrl(cfg.whatsappDefaultMessage));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    });

    // Category-specific WhatsApp links
    document.querySelectorAll("[data-wa-category]").forEach(function (el) {
      var category = el.getAttribute("data-wa-category");
      var msg =
        "Hi, I am interested in " +
        category +
        ". Please share designs and prices.";
      el.setAttribute("href", buildWhatsAppUrl(msg));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    });

    // Address & Timings
    var addrText = formatDisplayAddress();
    document.querySelectorAll('[data-bind="address"]').forEach(function (el) {
      el.textContent = addrText;
      el.style.whiteSpace = "pre-line";
    });

    var timingsText =
      cfg.timings && isSet(cfg.timings.display)
        ? cfg.timings.display
        : "Mon – Sat: 10:00 AM – 8:00 PM (Call for Sunday hours)";
    document.querySelectorAll('[data-bind="timings"]').forEach(function (el) {
      el.textContent = timingsText;
    });

    // Maps links
    var maps = cfg.maps || {};
    document
      .querySelectorAll('[data-bind="maps-directions"]')
      .forEach(function (el) {
        if (maps.directionsUrl) {
          el.setAttribute("href", maps.directionsUrl);
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener noreferrer");
        }
      });
    document.querySelectorAll('[data-bind="maps-place"]').forEach(function (el) {
      var targetUrl = isSet(maps.shortLink) ? maps.shortLink : maps.placeUrl;
      if (targetUrl) {
        el.setAttribute("href", targetUrl);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
    });

    // Play Store badge
    var playBtn = document.getElementById("play-store-btn");
    var comingPill = document.getElementById("play-coming-soon");
    if (playBtn) {
      if (isSet(cfg.playStoreLink)) {
        playBtn.setAttribute("href", cfg.playStoreLink);
        playBtn.setAttribute("target", "_blank");
        playBtn.setAttribute("rel", "noopener noreferrer");
        playBtn.classList.remove("is-disabled");
        playBtn.removeAttribute("aria-disabled");
        if (comingPill) comingPill.style.display = "none";
      } else {
        playBtn.classList.add("is-disabled");
        playBtn.setAttribute("aria-disabled", "true");
        playBtn.addEventListener("click", function (e) {
          e.preventDefault();
        });
      }
    }

    // Social links (hide gracefully if empty or placeholder)
    var social = cfg.social || {};
    var igEl = document.getElementById("social-instagram");
    var fbEl = document.getElementById("social-facebook");
    var socialRow = document.getElementById("footer-social-row");
    var hasAnySocial = false;

    if (igEl) {
      if (isSet(social.instagramUrl)) {
        igEl.setAttribute("href", social.instagramUrl);
        hasAnySocial = true;
      } else {
        igEl.style.display = "none";
      }
    }
    if (fbEl) {
      if (isSet(social.facebookUrl)) {
        fbEl.setAttribute("href", social.facebookUrl);
        hasAnySocial = true;
      } else {
        fbEl.style.display = "none";
      }
    }
    if (socialRow && !hasAnySocial) {
      socialRow.style.display = "none";
    }

    // Footer auto-year
    var yearEl = document.getElementById("current-year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }

    // Sync JSON-LD Schema & canonical if domain/address updated in config.js
    syncSchemaAndMeta();
  }

  function syncSchemaAndMeta() {
    var schemaEl = document.getElementById("local-business-schema");
    if (!schemaEl) return;
    try {
      var data = JSON.parse(schemaEl.textContent);
      data.name = cfg.businessName || data.name;
      data.telephone = cfg.phoneDisplay
        ? cfg.phoneDisplay.replace(/\s+/g, "")
        : data.telephone;
      if (cfg.address) {
        data.address.streetAddress = isSet(cfg.address.street)
          ? cfg.address.street
          : "{{FULL_ADDRESS}}";
        data.address.addressLocality = cfg.address.city || "Lucknow";
        data.address.addressRegion = cfg.address.state || "Uttar Pradesh";
        data.address.postalCode = isSet(cfg.address.pincode)
          ? cfg.address.pincode
          : "{{PINCODE}}";
      }
      if (cfg.maps) {
        data.geo.latitude = cfg.maps.lat;
        data.geo.longitude = cfg.maps.lng;
        data.hasMap = isSet(cfg.maps.shortLink)
          ? cfg.maps.shortLink
          : cfg.maps.placeUrl;
      }
      if (isSet(cfg.domain)) {
        var baseUrl = "https://" + cfg.domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
        data.url = baseUrl + "/";
        data.logo = baseUrl + "/assets/logo/logo.png";
        data.image = baseUrl + "/assets/images/hero-showroom.jpg";
      }
      schemaEl.textContent = JSON.stringify(data, null, 2);
    } catch (_) {
      // Keep static JSON-LD intact if parse fails
    }
  }

  /* ---------- 2. IST Open / Closed Status Badge ---------- */
  function updateOpenStatus() {
    var badge = document.getElementById("open-status-badge");
    if (!badge || !cfg.timings || !cfg.timings.schedule) return;

    try {
      var now = new Date();
      var formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: cfg.timings.timezone || "Asia/Kolkata",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
      var parts = formatter.formatToParts(now);
      var map = {};
      parts.forEach(function (p) {
        map[p.type] = p.value;
      });
      var dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var dayIdx = dayMap[map.weekday];
      var hour = parseInt(map.hour, 10) % 24;
      var minute = parseInt(map.minute, 10);
      var currentMins = hour * 60 + minute;

      var slot = cfg.timings.schedule[dayIdx];
      var isOpen = false;
      if (Array.isArray(slot) && slot.length === 2) {
        var startParts = slot[0].split(":");
        var endParts = slot[1].split(":");
        var startMins =
          parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10);
        var endMins =
          parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10);
        isOpen = currentMins >= startMins && currentMins < endMins;
      }

      var suffix = cfg.timings.isPlaceholder ? " (est. IST – call to confirm)" : " (IST)";
      badge.textContent = (isOpen ? "● Open now" : "● Closed now") + suffix;
      badge.className = "status-badge " + (isOpen ? "is-open" : "is-closed");
    } catch (_) {
      badge.style.display = "none";
    }
  }

  /* ---------- 3. Sticky Header & Mobile Drawer ---------- */
  function initHeader() {
    var header = document.getElementById("site-header");
    var menuBtn = document.getElementById("mobile-menu-btn");
    var drawer = document.getElementById("mobile-nav-drawer");

    function onScroll() {
      if (!header) return;
      if (window.scrollY > 16) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (menuBtn && drawer) {
      function closeDrawer() {
        drawer.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      }

      menuBtn.addEventListener("click", function () {
        var open = drawer.classList.toggle("is-open");
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      });

      drawer.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeDrawer);
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && drawer.classList.contains("is-open")) {
          closeDrawer();
          menuBtn.focus();
        }
      });
    }
  }

  /* ---------- 4. Click Tracking (Call & WhatsApp) ---------- */
  function initClickTracking() {
    document.addEventListener("click", function (e) {
      var target = e.target.closest("[data-track]");
      if (!target) return;
      var kind = target.getAttribute("data-track");
      var label = target.getAttribute("data-track-label") || "general";
      if (kind === "call") {
        trackEvent("click_call", { button_location: label });
      } else if (kind === "whatsapp") {
        trackEvent("click_whatsapp", { button_location: label });
      }
    });
  }

  /* ---------- 5. Showroom Gallery Lightbox ---------- */
  function initLightbox() {
    var triggers = Array.prototype.slice.call(
      document.querySelectorAll(".gallery-item")
    );
    var lightbox = document.getElementById("lightbox");
    var lbImg = document.getElementById("lightbox-img");
    var lbCaption = document.getElementById("lightbox-caption");
    var btnClose = document.getElementById("lightbox-close");
    var btnPrev = document.getElementById("lightbox-prev");
    var btnNext = document.getElementById("lightbox-next");

    if (!lightbox || !lbImg || !triggers.length) return;

    var currentIndex = 0;
    var lastFocused = null;
    var touchStartX = 0;

    function showSlide(idx) {
      currentIndex = (idx + triggers.length) % triggers.length;
      var trigger = triggers[currentIndex];
      var src = trigger.getAttribute("data-full-src");
      var fallbackSrc = trigger.getAttribute("data-fallback-src");
      var img = trigger.querySelector("img");
      var alt = img ? img.getAttribute("alt") : "Showroom photo";
      lbImg.onerror = function () {
        if (fallbackSrc && lbImg.getAttribute("src") !== fallbackSrc) {
          lbImg.setAttribute("src", fallbackSrc);
        }
      };
      lbImg.setAttribute("src", src);
      lbImg.setAttribute("alt", alt);
      if (lbCaption) lbCaption.textContent = alt;
    }

    function openLightbox(idx, triggerEl) {
      lastFocused = triggerEl || document.activeElement;
      showSlide(idx);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (btnClose) btnClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    triggers.forEach(function (btn, idx) {
      btn.addEventListener("click", function () {
        openLightbox(idx, btn);
      });
    });

    if (btnClose) btnClose.addEventListener("click", closeLightbox);
    if (btnPrev)
      btnPrev.addEventListener("click", function () {
        showSlide(currentIndex - 1);
      });
    if (btnNext)
      btnNext.addEventListener("click", function () {
        showSlide(currentIndex + 1);
      });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showSlide(currentIndex - 1);
      if (e.key === "ArrowRight") showSlide(currentIndex + 1);
    });

    lightbox.addEventListener(
      "touchstart",
      function (e) {
        if (e.changedTouches && e.changedTouches.length) {
          touchStartX = e.changedTouches[0].screenX;
        }
      },
      { passive: true }
    );

    lightbox.addEventListener(
      "touchend",
      function (e) {
        if (!e.changedTouches || !e.changedTouches.length) return;
        var diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 45) {
          showSlide(diff > 0 ? currentIndex - 1 : currentIndex + 1);
        }
      },
      { passive: true }
    );
  }

  /* ---------- 6. Lazy-Load Google Map Iframe ---------- */
  function initLazyMap() {
    var mapFrame = document.getElementById("showroom-map");
    if (!mapFrame || !cfg.maps || !cfg.maps.embedUrl) return;

    function loadMap() {
      if (!mapFrame.getAttribute("src")) {
        mapFrame.setAttribute("src", cfg.maps.embedUrl);
      }
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              loadMap();
              observer.disconnect();
            }
          });
        },
        { rootMargin: "250px 0px" }
      );
      observer.observe(mapFrame);
    } else {
      loadMap();
    }
  }

  /* ---------- 7. Scroll Reveal Animation ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    var reduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    items.forEach(function (el) {
      obs.observe(el);
    });
  }

  /* ---------- 8. Lead / Inquiry Form ---------- */
  function initLeadForm() {
    var form = document.getElementById("lead-form");
    if (!form) return;

    var nameInput = document.getElementById("lead-name");
    var phoneInput = document.getElementById("lead-phone");
    var productSelect = document.getElementById("lead-product");
    var localityInput = document.getElementById("lead-locality");
    var messageInput = document.getElementById("lead-message");
    var hpInput = document.getElementById("lead-website");
    var submitBtn = document.getElementById("lead-submit-btn");
    var statusBox = document.getElementById("lead-form-status");
    var statusMsg = document.getElementById("lead-status-msg");
    var statusWaBtn = document.getElementById("lead-status-wa");
    var nameErr = document.getElementById("lead-name-err");
    var phoneErr = document.getElementById("lead-phone-err");

    var RATE_LIMIT_MS = 30000;
    var lastSubmitTime = 0;

    function normalizeIndianMobile(raw) {
      var digits = String(raw || "").replace(/\D/g, "");
      if (digits.length === 12 && digits.indexOf("91") === 0) {
        digits = digits.slice(2);
      } else if (digits.length === 11 && digits.indexOf("0") === 0) {
        digits = digits.slice(1);
      }
      return digits;
    }

    function clearErrors() {
      nameInput.setAttribute("aria-invalid", "false");
      phoneInput.setAttribute("aria-invalid", "false");
      nameErr.textContent = "";
      phoneErr.textContent = "";
    }

    function buildLeadWhatsAppText(payload) {
      var lines = [
        "Hi Awadh Tiles Gallery, I submitted an inquiry on your website:",
        "Name: " + payload.name,
        "Mobile: " + payload.phone,
        "Product: " + payload.product
      ];
      if (payload.locality) lines.push("Area / Locality: " + payload.locality);
      if (payload.message) lines.push("Message: " + payload.message);
      return lines.join("\n");
    }

    function fireConversionEvents(productName) {
      trackEvent("generate_lead", {
        currency: "INR",
        product_interest: productName
      });
      if (isSet(cfg.metaPixelId) && typeof window.fbq === "function") {
        window.fbq("track", "Lead", { content_name: productName });
      }
    }

    function showSuccess(payload, usedFallback) {
      var waUrl = buildWhatsAppUrl(buildLeadWhatsAppText(payload));
      statusBox.className = "form-status is-success";
      statusMsg.textContent = usedFallback
        ? "Thank you! Redirecting you to WhatsApp with your details—or click below to chat now."
        : "Thank you! Our team will contact you shortly.";
      if (statusWaBtn) {
        statusWaBtn.setAttribute("href", waUrl);
        statusWaBtn.style.display = "inline-flex";
      }
      form.reset();
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();
      statusBox.className = "form-status";

      // Honeypot check
      if (hpInput && hpInput.value.trim() !== "") {
        return;
      }

      // Simple client-side rate limit
      var now = Date.now();
      if (now - lastSubmitTime < RATE_LIMIT_MS) {
        statusBox.className = "form-status is-error";
        statusMsg.textContent =
          "Your inquiry was just received. Please wait a moment before submitting again.";
        if (statusWaBtn) statusWaBtn.style.display = "none";
        return;
      }

      var cleanName = sanitizeText(nameInput.value, 80);
      var cleanPhone = normalizeIndianMobile(phoneInput.value);
      var valid = true;

      if (cleanName.length < 2) {
        nameInput.setAttribute("aria-invalid", "true");
        nameErr.textContent = "Please enter your name.";
        valid = false;
      }

      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        phoneInput.setAttribute("aria-invalid", "true");
        phoneErr.textContent =
          "Please enter a valid 10-digit Indian mobile number.";
        valid = false;
      }

      if (!valid) {
        if (nameInput.getAttribute("aria-invalid") === "true") {
          nameInput.focus();
        } else {
          phoneInput.focus();
        }
        return;
      }

      var payload = {
        name: cleanName,
        phone: cleanPhone,
        product: sanitizeText(productSelect.value, 80),
        locality: sanitizeText(localityInput.value, 100),
        message: sanitizeText(messageInput.value, 400),
        source: window.location.href,
        submittedAt: new Date().toISOString()
      };

      lastSubmitTime = now;

      // Fallback to WhatsApp if FORM_ENDPOINT is not configured yet
      if (!isSet(cfg.formEndpoint)) {
        var waUrl = buildWhatsAppUrl(buildLeadWhatsAppText(payload));
        fireConversionEvents(payload.product);
        showSuccess(payload, true);
        window.open(waUrl, "_blank", "noopener,noreferrer");
        return;
      }

      submitBtn.disabled = true;
      var originalLabel = submitBtn.textContent;
      submitBtn.textContent = "Sending...";

      fetch(cfg.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      })
        .then(function () {
          fireConversionEvents(payload.product);
          showSuccess(payload, false);
        })
        .catch(function () {
          // Never lose a lead on network failure: offer direct WhatsApp
          var waUrl = buildWhatsAppUrl(buildLeadWhatsAppText(payload));
          statusBox.className = "form-status is-error";
          statusMsg.textContent =
            "Could not reach the server. Please send your inquiry directly on WhatsApp below.";
          if (statusWaBtn) {
            statusWaBtn.setAttribute("href", waUrl);
            statusWaBtn.style.display = "inline-flex";
          }
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        });
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    bindConfigValues();
    updateOpenStatus();
    initHeader();
    initClickTracking();
    initLightbox();
    initLazyMap();
    initReveal();
    initLeadForm();
  });
})();
