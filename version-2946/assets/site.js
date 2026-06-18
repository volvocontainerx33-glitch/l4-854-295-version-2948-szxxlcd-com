(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function bindNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function bindHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function cardMatches(card, query, filter) {
    var content = [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-tags") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-type") || "",
      card.getAttribute("data-year") || ""
    ].join(" ").toLowerCase();
    var queryOk = !query || content.indexOf(query) !== -1;
    var filterOk = !filter || filter === "all" || content.indexOf(filter.toLowerCase()) !== -1;
    return queryOk && filterOk;
  }

  function bindSearchAndFilters() {
    var input = document.querySelector(".site-search-input");
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter-button"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .ranking-item"));
    var empty = document.querySelector(".empty-state");
    var activeFilter = "all";

    if (!cards.length) {
      return;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var matched = cardMatches(card, query, activeFilter);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        activeFilter = button.getAttribute("data-filter-value") || "all";
        apply();
      });
    });
  }

  ready(function () {
    bindNavigation();
    bindHero();
    bindSearchAndFilters();
  });
})();
