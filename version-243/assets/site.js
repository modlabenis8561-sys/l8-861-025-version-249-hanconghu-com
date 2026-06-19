(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", () => {
      mobilePanel.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let active = 0;
    let timer = null;

    const showSlide = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, idx) => slide.classList.toggle("is-active", idx === active));
      dots.forEach((dot, idx) => dot.classList.toggle("is-active", idx === active));
    };

    const start = () => {
      timer = window.setInterval(() => showSlide(active + 1), 5200);
    };

    const restart = () => {
      window.clearInterval(timer);
      start();
    };

    dots.forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        showSlide(idx);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", () => {
        showSlide(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        showSlide(active + 1);
        restart();
      });
    }

    start();
  }

  const filterInput = document.querySelector("[data-live-filter]");
  const yearFilter = document.querySelector("[data-year-filter]");
  const searchableCards = Array.from(document.querySelectorAll("[data-searchable-card]"));
  const emptyNotice = document.querySelector(".filter-empty");

  const normalize = (value) => String(value || "").trim().toLowerCase();

  const applyFilter = () => {
    if (!searchableCards.length) {
      return;
    }

    const query = normalize(filterInput ? filterInput.value : "");
    const year = normalize(yearFilter ? yearFilter.value : "");
    let visibleCount = 0;

    searchableCards.forEach((card) => {
      const text = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.year,
        card.dataset.region,
        card.textContent
      ].join(" "));
      const cardYear = normalize(card.dataset.year);
      const queryMatch = !query || text.includes(query);
      const yearMatch = !year || cardYear.includes(year);
      const visible = queryMatch && yearMatch;
      card.classList.toggle("is-hidden", !visible);
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyNotice) {
      emptyNotice.classList.toggle("is-visible", visibleCount === 0);
    }
  };

  if (filterInput) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");
    if (initialQuery) {
      filterInput.value = initialQuery;
    }
    filterInput.addEventListener("input", applyFilter);
  }

  if (yearFilter) {
    yearFilter.addEventListener("change", applyFilter);
  }

  applyFilter();

  const video = document.querySelector("video[data-stream]");
  if (video) {
    const overlay = document.querySelector(".play-overlay");
    const stream = video.getAttribute("data-stream");
    let attached = false;

    const attachStream = () => {
      if (attached || !stream) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      attached = true;
    };

    const playVideo = () => {
      attachStream();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    };

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("click", () => {
      if (!attached || video.paused) {
        playVideo();
      }
    });

    video.addEventListener("play", () => {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  }
})();
