document.querySelectorAll('[data-stream]').forEach(function (box) {
  var video = box.querySelector('video');
  var overlay = box.querySelector('[data-play-button]');
  var stream = box.getAttribute('data-stream');
  var hls = null;

  if (!video || !stream) {
    return;
  }

  function attach() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }

    video.src = stream;
  }

  function play() {
    if (overlay) {
      overlay.hidden = true;
    }
    video.controls = true;
    video.play().catch(function () {
      if (overlay) {
        overlay.hidden = false;
      }
    });
  }

  attach();

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
});
