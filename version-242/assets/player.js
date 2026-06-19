function initPlayer(playbackUrl) {
  var video = document.getElementById("movie-player");
  var button = document.getElementById("play-overlay");
  var hls = null;
  var attached = false;

  if (!video || !button || !playbackUrl) {
    return;
  }

  function revealButton() {
    button.hidden = false;
  }

  function playVideo() {
    var attempt = video.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(revealButton);
    }
  }

  function attachSource() {
    if (attached) {
      playVideo();
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playbackUrl;
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(playbackUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          revealButton();
        }
      });
      return;
    }

    video.src = playbackUrl;
    playVideo();
  }

  function startPlayback() {
    button.hidden = true;
    attachSource();
  }

  button.addEventListener("click", startPlayback);
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener("play", function () {
    button.hidden = true;
  });
  video.addEventListener("pause", function () {
    if (!video.ended) {
      revealButton();
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
