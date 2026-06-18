(function () {
  function all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = all(".hero-slide", slider);
    var dots = all(".hero-dot", slider);
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide") || 0));
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

    restart();
  }

  function setupFiltering() {
    var inputs = all(".filter-input");
    var buttons = all(".filter-button");

    function apply(scope) {
      var root = scope || document;
      var input = root.querySelector(".filter-input") || document.querySelector(".filter-input");
      var active = root.querySelector(".filter-button.active") || document.querySelector(".filter-button.active");
      var query = text(input ? input.value : "");
      var filter = active ? active.getAttribute("data-filter") : "all";
      var cards = all(".movie-card", document);

      cards.forEach(function (card) {
        var haystack = text(card.getAttribute("data-search"));
        var genre = card.getAttribute("data-genre") || "";
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchFilter = filter === "all" || genre === filter;
        card.classList.toggle("hidden-card", !(matchQuery && matchFilter));
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        apply(document);
      });
    });

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        apply(document);
      });
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    var globalInput = document.getElementById("global-search-input");
    if (q && globalInput) {
      globalInput.value = q;
      apply(document);
    }
  }

  window.bindMoviePlayer = function (videoId, overlayId, url) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var loaded = false;

    if (!video || !overlay || !url) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = url;
      }
      loaded = true;
    }

    function play() {
      load();
      overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFiltering();
  });
})();
