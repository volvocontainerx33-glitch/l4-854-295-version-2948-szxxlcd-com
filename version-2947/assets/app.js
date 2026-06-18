(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-button");
    var panel = document.querySelector(".mobile-nav");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      var opened = panel.hasAttribute("hidden");
      if (opened) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      button.setAttribute("aria-expanded", String(opened));
    });
  }

  function initHeroSlider() {
    var root = document.querySelector("[data-hero-slider]");

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(dotIndex);
        play();
      });
    });

    if (slides.length > 1) {
      play();
    }
  }

  function initLiveSearch() {
    var input = document.querySelector(".js-live-search");

    if (!input) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-item]"));
    var empty = document.querySelector(".empty-state");

    function update() {
      var terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var matched = terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    input.addEventListener("input", update);
  }

  function initPlayer() {
    var panel = document.querySelector("[data-watch]");

    if (!panel) {
      return;
    }

    var video = panel.querySelector("video");
    var cover = panel.querySelector(".player-cover");
    var stream = panel.getAttribute("data-watch");
    var hls = null;
    var attached = false;

    if (!video || !cover || !stream) {
      return;
    }

    function playVideo() {
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          cover.classList.remove("is-hidden");
        });
      }
    }

    function attach() {
      if (attached) {
        playVideo();
        return;
      }

      attached = true;
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          maxBufferLength: 30
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        return;
      }

      video.src = stream;
      playVideo();
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      cover.classList.add("is-hidden");
      attach();
    }

    cover.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initHeroSlider();
    initLiveSearch();
    initPlayer();
  });
})();
