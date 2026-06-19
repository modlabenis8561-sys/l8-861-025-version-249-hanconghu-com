(function () {
    function toggleMobileNav() {
        var button = document.querySelector('.mobile-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
            button.textContent = open ? '×' : '☰';
        });
    }

    function setupHero() {
        document.querySelectorAll('.hero-carousel').forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
            var prev = carousel.querySelector('.hero-arrow.prev');
            var next = carousel.querySelector('.hero-arrow.next');
            var index = 0;
            var timer;

            if (!slides.length) {
                return;
            }

            function show(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, itemIndex) {
                    slide.classList.toggle('is-active', itemIndex === index);
                });
                dots.forEach(function (dot, itemIndex) {
                    dot.classList.toggle('is-active', itemIndex === index);
                });
            }

            function restart() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    restart();
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                    restart();
                });
            });

            show(0);
            restart();
        });
    }

    function setupSearch() {
        var page = document.querySelector('[data-search-page]');
        if (!page) {
            return;
        }
        var input = page.querySelector('[data-search-input]');
        var category = page.querySelector('[data-category-filter]');
        var year = page.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(page.querySelectorAll('.movie-card'));
        var empty = page.querySelector('.empty-state');

        function normalize(value) {
            return (value || '').toString().toLowerCase().trim();
        }

        function apply() {
            var keyword = normalize(input && input.value);
            var selectedCategory = normalize(category && category.value);
            var selectedYear = normalize(year && year.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-year')
                ].join(' '));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchCategory = !selectedCategory || normalize(card.getAttribute('data-category')) === selectedCategory;
                var matchYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
                var show = matchKeyword && matchCategory && matchYear;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, category, year].forEach(function (item) {
            if (item) {
                item.addEventListener('input', apply);
                item.addEventListener('change', apply);
            }
        });
        apply();
    }

    function setupPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('.player-overlay');
            var source = video ? video.getAttribute('data-video-url') : '';
            var hlsInstance = null;
            var attached = false;

            if (!video || !source) {
                return;
            }

            function attachSource() {
                if (attached) {
                    return;
                }
                attached = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    return;
                }

                video.src = source;
            }

            attachSource();

            function playVideo() {
                attachSource();
                shell.classList.add('is-playing');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        shell.classList.remove('is-playing');
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener('click', playVideo);
            }

            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    shell.classList.remove('is-playing');
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        toggleMobileNav();
        setupHero();
        setupSearch();
        setupPlayers();
    });
}());
