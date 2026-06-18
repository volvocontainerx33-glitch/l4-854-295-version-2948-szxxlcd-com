function initializeMoviePlayer(streamUrl) {
  var video = document.querySelector("[data-player-video]");
  var overlay = document.querySelector("[data-player-overlay]");
  var startButtons = Array.prototype.slice.call(document.querySelectorAll("[data-player-start]"));
  var hlsInstance = null;
  var readyPromise = null;

  if (!video || !streamUrl) {
    return;
  }

  function attachWithHls() {
    return new Promise(function (resolve, reject) {
      if (!window.Hls || !window.Hls.isSupported()) {
        video.src = streamUrl;
        resolve();
        return;
      }

      hlsInstance = new window.Hls({
        maxBufferLength: 30,
        backBufferLength: 30,
        enableWorker: true
      });

      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        resolve();
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          reject(data);
        }
      });
    });
  }

  function loadLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve();
        return;
      }

      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function prepareVideo() {
    if (readyPromise) {
      return readyPromise;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      readyPromise = Promise.resolve();
    } else {
      readyPromise = loadLibrary().then(attachWithHls).catch(function () {
        video.src = streamUrl;
      });
    }

    return readyPromise;
  }

  function startPlayback() {
    prepareVideo().then(function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      video.controls = true;
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    });
  }

  startButtons.forEach(function (button) {
    button.addEventListener("click", startPlayback);
  });

  video.addEventListener("click", function () {
    if (!video.controls) {
      startPlayback();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
