(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (slides.length > 0) {
      show(0);
      restart();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });
  }

  var panels = document.querySelectorAll('[data-filter-panel]');
  panels.forEach(function (panel) {
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var input = panel.querySelector('[data-search-input]');
    var region = panel.querySelector('[data-region-filter]');
    var year = panel.querySelector('[data-year-filter]');
    var type = panel.querySelector('[data-type-filter]');

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';

      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var showCard = true;

        if (query && text.indexOf(query) === -1) {
          showCard = false;
        }
        if (regionValue && card.getAttribute('data-region') !== regionValue) {
          showCard = false;
        }
        if (yearValue && card.getAttribute('data-year') !== yearValue) {
          showCard = false;
        }
        if (typeValue && card.getAttribute('data-type') !== typeValue) {
          showCard = false;
        }

        card.classList.toggle('hidden', !showCard);
      });
    }

    [input, region, year, type].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var queryParam = params.get('q');
    if (queryParam && input) {
      input.value = queryParam;
      apply();
    }
  });
})();

function initMoviePlayer(src) {
  var video = document.querySelector('[data-player]');
  var overlay = document.querySelector('[data-player-overlay]');
  var start = document.querySelector('[data-start]');
  var attached = false;
  var hls = null;

  if (!video || !src) {
    return;
  }

  function attach() {
    if (attached) {
      return Promise.resolve();
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      return new Promise(function (resolve) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hls.on(Hls.Events.ERROR, function () {
          resolve();
        });
      });
    }

    video.src = src;
    return Promise.resolve();
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function startPlay() {
    attach().then(function () {
      hideOverlay();
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          video.muted = true;
          video.play().catch(function () {});
        });
      }
    });
  }

  if (start) {
    start.addEventListener('click', startPlay);
  }

  if (overlay && overlay !== start) {
    overlay.addEventListener('click', startPlay);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlay();
    }
  });

  video.addEventListener('play', hideOverlay);

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
