(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    document.querySelectorAll('.hero-carousel').forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
      var prev = carousel.querySelector('.hero-prev');
      var next = carousel.querySelector('.hero-next');
      var current = Math.max(0, slides.findIndex(function (slide) {
        return slide.classList.contains('is-active');
      }));
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          start();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });
      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      if (slides.length > 1) {
        show(current);
        start();
      }
    });
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (panel) {
      var section = panel.parentElement;
      var list = section ? section.querySelector('.js-filter-list') : null;
      if (!list) {
        return;
      }
      var search = panel.querySelector('.js-search-input');
      var selects = Array.prototype.slice.call(panel.querySelectorAll('.js-filter-select'));
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var text = [
            card.dataset.title || '',
            card.dataset.region || '',
            card.dataset.type || '',
            card.dataset.tags || ''
          ].join(' ').toLowerCase();
          var ok = !query || text.indexOf(query) !== -1;
          selects.forEach(function (select) {
            var value = select.value;
            var key = select.dataset.filter;
            if (value && card.dataset[key] !== value) {
              ok = false;
            }
          });
          card.classList.toggle('is-filter-hidden', !ok);
        });
      }

      if (search) {
        search.addEventListener('input', apply);
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          search.value = q;
        }
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
      apply();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.querySelector('.movie-video');
  var cover = document.querySelector('.player-cover');
  if (!video || !cover || !streamUrl) {
    return;
  }
  var prepared = false;
  var hlsInstance = null;

  function prepare() {
    if (prepared) {
      return;
    }
    prepared = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    prepare();
    cover.classList.add('is-hidden');
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  cover.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (!prepared) {
      play();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
