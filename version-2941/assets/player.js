(function () {
  function attachStream(video, url, shell) {
    if (!video || !url || video.dataset.ready === "1") {
      return;
    }
    video.dataset.ready = "1";
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (shell && shell.classList.contains("is-playing")) {
          var afterReady = video.play();
          if (afterReady && typeof afterReady.catch === "function") {
            afterReady.catch(function () {});
          }
        }
      });
      return;
    }
    video.src = url;
  }

  window.createMoviePlayer = function (url) {
    var shell = document.querySelector(".player-shell");
    var video = document.getElementById("movie-video");
    var button = document.querySelector("[data-play-button]");
    if (!shell || !video || !url) {
      return;
    }

    function start() {
      attachStream(video, url, shell);
      shell.classList.add("is-playing");
      var playback = video.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    shell.addEventListener("click", function (event) {
      if (event.target === video) {
        return;
      }
      start();
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
  };
})();
