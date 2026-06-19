(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-button");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function() {
            var open = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var prev = root.querySelector(".hero-prev");
        var next = root.querySelector(".hero-next");
        if (slides.length === 0) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function() {
                show(index + 1);
            }, 5000);
        }
        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener("click", function() {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupSearch() {
        var input = document.querySelector("[data-search-input]");
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-card"));
        input.addEventListener("input", function() {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function(card) {
                var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
            });
        });
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
        shells.forEach(function(shell) {
            var video = shell.querySelector("video");
            var cover = shell.querySelector(".player-cover");
            if (!video) {
                return;
            }
            var src = video.getAttribute("data-hls");
            var started = false;
            function attach() {
                if (!src || started) {
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    shell.__hls = hls;
                } else {
                    video.src = src;
                }
            }
            function play() {
                attach();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                var result = video.play();
                if (result && result.catch) {
                    result.catch(function() {});
                }
            }
            if (cover) {
                cover.addEventListener("click", play);
            }
            video.addEventListener("click", function(event) {
                if (video.paused && event.target === video) {
                    play();
                }
            });
            video.addEventListener("play", function() {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            });
        });
    }

    ready(function() {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayers();
    });
})();
