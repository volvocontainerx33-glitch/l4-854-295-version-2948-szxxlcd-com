(function () {
    function initMoviePlayer(source) {
        var video = document.querySelector('[data-video-player]');
        var cover = document.querySelector('[data-player-cover]');
        var started = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (started) {
                return Promise.resolve();
            }

            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                return new Promise(function (resolve) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hls.loadSource(source);
                    hls.attachMedia(video);

                    if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            resolve();
                        });
                    } else {
                        resolve();
                    }

                    window.setTimeout(resolve, 900);
                });
            }

            video.src = source;
            return Promise.resolve();
        }

        function hideCover() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        }

        function startPlayback() {
            attachSource().then(function () {
                hideCover();
                video.controls = true;
                var attempt = video.play();

                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        video.controls = true;
                    });
                }
            });
        }

        if (cover) {
            cover.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            if (!started || video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
