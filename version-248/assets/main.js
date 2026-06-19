(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.getElementById("mobileNav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var slider = document.getElementById("heroSlider");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.getElementById("searchInput");
  var genreFilter = document.getElementById("genreFilter");
  var yearFilter = document.getElementById("yearFilter");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

  function applyFilters() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var genre = genreFilter ? genreFilter.value : "";
    var year = yearFilter ? yearFilter.value : "";

    cards.forEach(function (card) {
      var text = (card.getAttribute("data-search") || "").toLowerCase();
      var cardGenre = card.getAttribute("data-genre") || "";
      var cardYear = card.getAttribute("data-year") || "";
      var visible = true;

      if (query && text.indexOf(query) === -1) {
        visible = false;
      }

      if (genre && cardGenre.indexOf(genre) === -1) {
        visible = false;
      }

      if (year && cardYear !== year) {
        visible = false;
      }

      card.classList.toggle("hidden-by-filter", !visible);
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (genreFilter) {
    genreFilter.addEventListener("change", applyFilters);
  }

  if (yearFilter) {
    yearFilter.addEventListener("change", applyFilters);
  }
})();

function initMoviePlayer(source) {
  var video = document.getElementById("movieVideo");
  var trigger = document.getElementById("playerPoster");
  var started = false;
  var hls = null;

  function bindSource() {
    if (!video || started) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    started = true;
  }

  function playMovie() {
    if (!video) {
      return;
    }

    bindSource();

    if (trigger) {
      trigger.classList.add("is-hidden");
    }

    var playResult = video.play();

    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {});
    }
  }

  if (trigger) {
    trigger.addEventListener("click", playMovie);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        playMovie();
      }
    });
  }

  window.addEventListener("beforeunload", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
