(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function bindPlayer(shell) {
    var video = shell.querySelector("video[data-hls]");
    var button = shell.querySelector(".play-overlay");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !button) {
      return;
    }

    function attachSource() {
      if (loaded) {
        return;
      }
      var source = video.getAttribute("data-hls");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function startPlayback() {
      attachSource();
      shell.classList.add("is-playing");
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    button.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0) {
        shell.classList.remove("is-playing");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(bindPlayer);
  });
})();
