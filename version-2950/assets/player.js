(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var video = document.getElementById("movieVideo");
    var cover = document.querySelector("[data-player-start]");
    var hls = null;
    var attached = false;

    function attach() {
      if (!video || attached || typeof playerSource !== "string" || !playerSource) return;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playerSource;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(playerSource);
        hls.attachMedia(video);
      } else {
        video.src = playerSource;
      }
      attached = true;
    }

    function play() {
      if (!video) return;
      attach();
      if (cover) cover.classList.add("is-hidden");
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (cover) cover.addEventListener("click", play);
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) play();
      });
      video.addEventListener("play", function () {
        if (cover) cover.classList.add("is-hidden");
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls) hls.destroy();
    });
  });
})();
