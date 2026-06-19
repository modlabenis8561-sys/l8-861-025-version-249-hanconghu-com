(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));

  panels.forEach(function (panel) {
    var input = panel.querySelector(".movie-search");
    var clearButton = panel.querySelector(".clear-search");
    var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
    var list = document.querySelector(".searchable-list");
    var activeFilters = {};

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-title]"));

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalize(input ? input.value : "");

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type")
        ].join(" "));

        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesFilters = Object.keys(activeFilters).every(function (key) {
          if (!activeFilters[key]) {
            return true;
          }

          return normalize(card.getAttribute("data-" + key)).indexOf(normalize(activeFilters[key])) !== -1;
        });

        card.classList.toggle("is-hidden", !(matchesKeyword && matchesFilters));
      });
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query) {
        input.value = query;
      }

      input.addEventListener("input", applyFilters);
    }

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }

        activeFilters = {};
        buttons.forEach(function (button) {
          button.classList.remove("active");
        });
        applyFilters();
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-filter");
        var value = button.getAttribute("data-value");
        var active = button.classList.contains("active");

        buttons.filter(function (item) {
          return item.getAttribute("data-filter") === key;
        }).forEach(function (item) {
          item.classList.remove("active");
        });

        if (active) {
          activeFilters[key] = "";
        } else {
          activeFilters[key] = value;
          button.classList.add("active");
        }

        applyFilters();
      });
    });

    applyFilters();
  });
})();
