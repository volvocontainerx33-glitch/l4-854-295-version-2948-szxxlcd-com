(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener("click", function () {
            var isOpen = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function setupSearchAndFilters() {
        var scopes = document.querySelectorAll("[data-search-scope]");

        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-search-box]");
            var buttons = scope.querySelectorAll("[data-filter-value]");
            var items = scope.querySelectorAll("[data-search-item]");
            var empty = scope.querySelector("[data-empty-state]");
            var activeFilter = "";

            function applyFilters() {
                var query = normalize(input ? input.value : "");
                var visible = 0;

                items.forEach(function (item) {
                    var haystack = normalize(item.getAttribute("data-search-text"));
                    var filterText = normalize(item.getAttribute("data-filter-text"));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesFilter = !activeFilter || filterText.indexOf(activeFilter) !== -1;

                    if (matchesQuery && matchesFilter) {
                        item.classList.remove("is-hidden");
                        visible += 1;
                    } else {
                        item.classList.add("is-hidden");
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", applyFilters);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    buttons.forEach(function (other) {
                        other.classList.remove("is-active");
                    });

                    button.classList.add("is-active");
                    activeFilter = normalize(button.getAttribute("data-filter-value"));
                    applyFilters();
                });
            });

            applyFilters();
        });
    }

    function setupPlayers() {
        var players = document.querySelectorAll("[data-player-wrap]");

        players.forEach(function (wrap) {
            var video = wrap.querySelector("video[data-src]");
            var cover = wrap.querySelector("[data-player-cover]");
            var play = wrap.querySelector("[data-play-button]");
            var status = wrap.querySelector("[data-player-status]");
            var hlsInstance = null;
            var started = false;

            if (!video || !play) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function hideCover() {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            }

            function startPlayback() {
                var source = video.getAttribute("data-src");

                if (!source) {
                    setStatus("未找到播放源");
                    return;
                }

                if (started) {
                    hideCover();
                    video.play().catch(function () {
                        setStatus("浏览器阻止了自动播放，请再次点击播放");
                    });
                    return;
                }

                started = true;
                setStatus("正在初始化 HLS 播放源...");

                if (source.indexOf(".m3u8") !== -1 && window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });

                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);

                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        hideCover();
                        setStatus("播放源已就绪");
                        video.play().catch(function () {
                            setStatus("播放源已加载，请点击播放器继续观看");
                        });
                    });

                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus("播放遇到问题，请刷新页面或稍后重试");
                        }
                    });
                } else {
                    video.src = source;
                    hideCover();
                    setStatus("播放源已就绪");
                    video.play().catch(function () {
                        setStatus("播放源已加载，请点击播放器继续观看");
                    });
                }
            }

            play.addEventListener("click", startPlayback);

            video.addEventListener("play", function () {
                hideCover();
            });

            video.addEventListener("error", function () {
                setStatus("视频加载失败，请检查网络或播放源状态");
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupSearchAndFilters();
        setupPlayers();
    });
})();
