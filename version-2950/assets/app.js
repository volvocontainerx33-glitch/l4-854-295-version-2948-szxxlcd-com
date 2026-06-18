(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function escapeHTML(value) {
    return (value || "").toString().replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) return;
    function sync() {
      button.classList.toggle("is-visible", window.scrollY > 520);
    }
    window.addEventListener("scroll", sync, { passive: true });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    sync();
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) return;
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
    }
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
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-filter-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    if (!cards.length || (!input && !select)) return;
    function apply() {
      var query = text(input ? input.value : "");
      var type = text(select ? select.value : "");
      cards.forEach(function (card) {
        var haystack = text([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !type || text(card.getAttribute("data-type")) === type;
        card.hidden = !(matchesQuery && matchesType);
      });
    }
    if (input) input.addEventListener("input", apply);
    if (select) select.addEventListener("change", apply);
    apply();
  }

  function movieCard(item) {
    return "<article class=\"movie-card poster\" data-filter-card data-title=\"" + escapeHTML(item.title) + "\" data-region=\"" + escapeHTML(item.region) + "\" data-type=\"" + escapeHTML(item.type) + "\" data-year=\"" + escapeHTML(item.year) + "\" data-tags=\"" + escapeHTML(item.tags) + "\">" +
      "<a href=\"" + escapeHTML(item.url) + "\" class=\"movie-link\" title=\"" + escapeHTML(item.title) + "在线观看\">" +
      "<div class=\"poster-wrap\"><img src=\"" + escapeHTML(item.cover) + "\" alt=\"" + escapeHTML(item.title) + "\" loading=\"lazy\"><span class=\"badge badge-type\">" + escapeHTML(item.type) + "</span><span class=\"badge badge-year\">" + escapeHTML(item.year) + "</span><span class=\"play-mark\" aria-hidden=\"true\">▶</span></div>" +
      "<div class=\"card-body\"><h3>" + escapeHTML(item.title) + "</h3><p>" + escapeHTML(item.oneLine) + "</p><div class=\"card-meta\"><span>" + escapeHTML(item.region) + "</span><span>" + escapeHTML(item.genre) + "</span></div></div>" +
      "</a></article>";
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.movieIndex) return;
    var input = page.querySelector("[data-search-input]");
    var results = page.querySelector("[data-search-results]");
    var form = page.querySelector("[data-search-form]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) input.value = initial;
    function render() {
      var query = text(input ? input.value : "");
      var list = window.movieIndex.filter(function (item) {
        if (!query) return false;
        return text([item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(" ")).indexOf(query) !== -1;
      }).slice(0, 160);
      if (!results) return;
      if (!query) {
        results.innerHTML = "<p class=\"empty-state\">输入片名、地区、年份或标签即可查找影片。</p>";
        return;
      }
      if (!list.length) {
        results.innerHTML = "<p class=\"empty-state\">没有找到匹配影片。</p>";
        return;
      }
      results.innerHTML = list.map(movieCard).join("");
    }
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var url = new URL(window.location.href);
        url.searchParams.set("q", input.value);
        history.replaceState(null, "", url.toString());
        render();
      });
    }
    if (input) input.addEventListener("input", render);
    render();
  }

  ready(function () {
    initMenu();
    initBackTop();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
