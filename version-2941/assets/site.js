(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupHorizontalScroll() {
    var scroller = document.querySelector("[data-mini-scroll]");
    if (!scroller) {
      return;
    }
    var left = document.querySelector("[data-scroll-left]");
    var right = document.querySelector("[data-scroll-right]");
    if (left) {
      left.addEventListener("click", function () {
        scroller.scrollBy({ left: -320, behavior: "smooth" });
      });
    }
    if (right) {
      right.addEventListener("click", function () {
        scroller.scrollBy({ left: 320, behavior: "smooth" });
      });
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    var root = document.querySelector("[data-filter-root]");
    var grid = document.querySelector("[data-card-grid]");
    if (!root || !grid) {
      return;
    }
    var input = root.querySelector("[data-search-input]");
    var filters = Array.prototype.slice.call(root.querySelectorAll("[data-filter-select]"));
    var sort = root.querySelector("[data-sort-select]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");

    if (initial && input) {
      input.value = initial;
    }

    function matches(card) {
      var query = normalize(input ? input.value : "");
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.textContent
      ].join(" "));
      if (query && haystack.indexOf(query) === -1) {
        return false;
      }
      return filters.every(function (select) {
        var value = normalize(select.value);
        var key = select.getAttribute("data-filter-select");
        if (!value) {
          return true;
        }
        return normalize(card.dataset[key]).indexOf(value) !== -1;
      });
    }

    function sortCards() {
      if (!sort) {
        return;
      }
      var mode = sort.value;
      var sorted = cards.slice();
      if (mode === "year-desc") {
        sorted.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      }
      if (mode === "title-asc") {
        sorted.sort(function (a, b) {
          return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), "zh-Hans-CN");
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    function apply() {
      sortCards();
      cards.forEach(function (card) {
        card.classList.toggle("is-hidden", !matches(card));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    filters.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    if (sort) {
      sort.addEventListener("change", apply);
    }
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupHorizontalScroll();
    setupFilters();
  });
})();
