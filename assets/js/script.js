const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const form = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const testimonialTrack = document.querySelector("[data-testimonial-track]");
const testimonialSlides = document.querySelectorAll("[data-testimonial-slide]");
const testimonialDots = document.querySelector("[data-testimonial-dots]");
const testimonialPrev = document.querySelector("[data-testimonial-prev]");
const testimonialNext = document.querySelector("[data-testimonial-next]");
const faqItems = Array.from(document.querySelectorAll("[data-faq-item]"));
const ambientVideos = Array.from(document.querySelectorAll("[data-ambient-video]"));
const portfolioVideos = Array.from(document.querySelectorAll("[data-portfolio-video]"));
const managedVideos = Array.from(new Set([...ambientVideos, ...portfolioVideos]));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const heroVideo = document.querySelector("[data-hero-video]");
const ambientVideoState = new WeakMap();
const heroMobileBreakpoint = 768;
const sharedAudioState = {
  audibleVideo: null,
};

function addMediaQueryListener(mediaQueryList, handler) {
  if (typeof mediaQueryList.addEventListener === "function") {
    mediaQueryList.addEventListener("change", handler);
    return;
  }

  mediaQueryList.addListener(handler);
}

function updateHeader() {
  if (!header) {
    return;
  }

  if (header.classList.contains("work-header")) {
    header.classList.add("is-scrolled");
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 20);
}

if (header) {
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
}

if (menuToggle && nav && header) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    header.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
}

if (nav && header && menuToggle) {
  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      nav.classList.remove("is-open");
      header.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !nav.classList.contains("is-open")) {
      return;
    }

    nav.classList.remove("is-open");
    header.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    menuToggle.focus();
  });
}

function setFormStatus(message, tone = "success") {
  if (!formStatus) {
    return;
  }

  formStatus.hidden = false;
  formStatus.textContent = message;
  formStatus.dataset.tone = tone;
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const isStaticPreview =
      window.location.protocol === "file:" || window.location.hostname.endsWith("github.io");

    if (isStaticPreview) {
      const subject = encodeURIComponent(`Content inquiry from ${data.get("name")}`);
      const body = encodeURIComponent(
        `Name: ${data.get("name")}
Email: ${data.get("email")}

Project:
${data.get("message")}`
      );

      setFormStatus("This preview opens your email app so you can send the inquiry.");
      window.location.href = `mailto:byalifurlan@gmail.com?subject=${subject}&body=${body}`;
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton?.setAttribute("disabled", "");
    setFormStatus("Sending your inquiry...", "neutral");

    try {
      const response = await fetch(form.action || "/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString(),
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      form.reset();
      setFormStatus("Thank you. Your inquiry has been sent and Ali will be in touch soon.");
    } catch (error) {
      setFormStatus("Something went wrong. Please email byalifurlan@gmail.com and Ali will get back to you.", "error");
    } finally {
      submitButton?.removeAttribute("disabled");
    }
  });
}

if (testimonialTrack && testimonialSlides.length && testimonialPrev && testimonialNext && testimonialDots) {
  let activeTestimonial = 0;
  const dotButtons = Array.from(testimonialSlides, (_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Show testimonial ${index + 1}`);
    button.addEventListener("click", () => showTestimonial(index));
    testimonialDots.append(button);
    return button;
  });

  function showTestimonial(index) {
    activeTestimonial = (index + testimonialSlides.length) % testimonialSlides.length;
    testimonialTrack.style.transform = `translateX(-${activeTestimonial * 100}%)`;

    testimonialSlides.forEach((slide, slideIndex) => {
      slide.toggleAttribute("aria-hidden", slideIndex !== activeTestimonial);
    });

    dotButtons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === activeTestimonial;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  testimonialPrev.addEventListener("click", () => showTestimonial(activeTestimonial - 1));
  testimonialNext.addEventListener("click", () => showTestimonial(activeTestimonial + 1));
  showTestimonial(0);
}

faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) {
      return;
    }

    faqItems.forEach((otherItem) => {
      if (otherItem !== item) {
        otherItem.open = false;
      }
    });
  });
});

function ensureAmbientVideoState(video) {
  if (!ambientVideoState.has(video)) {
    ambientVideoState.set(video, {
      autoplayBlocked: false,
      controls: null,
      hasPlayed: false,
      isInViewport: false,
      playAttempt: null,
      playButton: null,
      readyHandlerAttached: false,
      soundButton: null,
      userPaused: false,
    });
  }

  return ambientVideoState.get(video);
}

function isAudioCapableVideo(video) {
  return video.dataset.audioCapable !== "false";
}

function isAudibleVideo(video) {
  return sharedAudioState.audibleVideo === video && !video.muted;
}

function setVideoMutedState(video, shouldMute) {
  video.muted = shouldMute;
  video.defaultMuted = shouldMute;

  if (shouldMute) {
    video.setAttribute("muted", "");
    return;
  }

  video.removeAttribute("muted");
}

function prepareAmbientVideo(video, { withSound = false } = {}) {
  const allowSound = withSound && isAudioCapableVideo(video);
  const shouldMute = !allowSound;

  video.playsInline = true;
  video.autoplay = true;
  video.loop = true;
  video.preload = video === heroVideo ? "auto" : "metadata";
  video.setAttribute("playsinline", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("loop", "");
  video.setAttribute("preload", video === heroVideo ? "auto" : "metadata");
  video.controls = false;
  video.removeAttribute("controls");
  setVideoMutedState(video, shouldMute);
}

function updateVideoButtonState(video) {
  const state = ensureAmbientVideoState(video);
  const soundButton = state.soundButton;
  const playButton = state.playButton;
  const audioCapable = isAudioCapableVideo(video);

  if (soundButton) {
    if (!audioCapable) {
      soundButton.textContent = "No Audio";
      soundButton.disabled = true;
      soundButton.classList.add("is-disabled");
      soundButton.setAttribute("aria-label", "Audio is not available for this video");
      soundButton.setAttribute("aria-pressed", "false");
    } else {
      const isOn = isAudibleVideo(video);
      soundButton.disabled = false;
      soundButton.classList.remove("is-disabled");
      soundButton.textContent = isOn ? "Mute" : "Sound On";
      soundButton.setAttribute("aria-label", isOn ? "Mute video" : "Turn sound on");
      soundButton.setAttribute("aria-pressed", isOn ? "true" : "false");
      soundButton.classList.toggle("is-on", isOn);
    }
  }

  if (playButton) {
    const isPlaying = !video.paused && !video.ended && !video.error;
    const shouldShowPlayButton = state.isInViewport || state.autoplayBlocked;
    const controlLabel = isPlaying ? "Pause video" : "Play video";

    playButton.hidden = !shouldShowPlayButton;
    playButton.classList.toggle("is-playing", isPlaying);
    playButton.setAttribute("aria-label", controlLabel);
    playButton.setAttribute("title", controlLabel);
  }

  if (state.controls) {
    state.controls.hidden = (!soundButton || soundButton.hidden) && playButton?.hidden;
  }
}

function syncAllVideoButtons() {
  managedVideos.forEach((video) => updateVideoButtonState(video));
}

function clearAudibleVideo(video = sharedAudioState.audibleVideo) {
  if (!video) {
    return;
  }

  if (sharedAudioState.audibleVideo === video) {
    sharedAudioState.audibleVideo = null;
  }

  setVideoMutedState(video, true);
}

function muteAllOtherVideos(activeVideo = null) {
  managedVideos.forEach((video) => {
    if (video === activeVideo) {
      return;
    }

    setVideoMutedState(video, true);
  });
}

function markAutoplayBlocked(video, blocked) {
  const state = ensureAmbientVideoState(video);
  state.autoplayBlocked = blocked;
  updateVideoButtonState(video);
}

function setVideoViewportState(video, isInViewport) {
  const state = ensureAmbientVideoState(video);
  state.isInViewport = isInViewport;
  updateVideoButtonState(video);
}

function isPlaybackBlockedError(error) {
  const errorName = typeof error?.name === "string" ? error.name : "";

  if (errorName === "NotAllowedError" || errorName === "NotSupportedError") {
    return true;
  }

  return false;
}

function getHeroViewportWidth() {
  return Math.round(window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || 0);
}

function getHeroSourceConfig() {
  if (!heroVideo) {
    return null;
  }

  const viewportWidth = getHeroViewportWidth();
  const isMobile = viewportWidth <= heroMobileBreakpoint;

  return {
    isMobile,
    poster: isMobile ? heroVideo.dataset.mobilePoster : heroVideo.dataset.desktopPoster,
    source: isMobile ? heroVideo.dataset.mobileSrc : heroVideo.dataset.desktopSrc,
  };
}

function stopAmbientVideo(video, { reset = false, clearAudio = false } = {}) {
  const state = ensureAmbientVideoState(video);
  state.playAttempt = null;
  video.pause();

  if (reset) {
    video.currentTime = 0;
  }

  if (clearAudio && sharedAudioState.audibleVideo === video) {
    clearAudibleVideo(video);
    syncAllVideoButtons();
  } else {
    updateVideoButtonState(video);
  }
}

function ensureBaseVideoSource(video) {
  if (video === heroVideo) {
    const config = getHeroSourceConfig();
    const nextSrc = config?.source;
    const nextPoster = config?.poster;

    if (nextPoster && heroVideo.getAttribute("poster") !== nextPoster) {
      heroVideo.setAttribute("poster", nextPoster);
    }

    if (nextSrc && heroVideo.getAttribute("src") !== nextSrc) {
      heroVideo.src = nextSrc;
      heroVideo.load();
    }

    return Boolean(nextSrc);
  }

  const sourceElement = video.querySelector("source");
  if (!video.getAttribute("src") && !video.currentSrc && sourceElement?.src) {
    video.load();
  }

  return true;
}

function ensureAudioVideoSource(video) {
  const audioSrc = video.dataset.audioSrc;
  const sourceElement = video.querySelector("source");

  if (!audioSrc || !sourceElement || sourceElement.getAttribute("src") === audioSrc) {
    return;
  }

  const resumeTime = video.currentTime;
  const restorePlaybackPosition = () => {
    video.removeEventListener("loadedmetadata", restorePlaybackPosition);

    if (Number.isFinite(resumeTime) && resumeTime > 0 && Number.isFinite(video.duration)) {
      video.currentTime = Math.min(resumeTime, Math.max(video.duration - 0.1, 0));
    }
  };

  sourceElement.setAttribute("src", audioSrc);
  video.addEventListener("loadedmetadata", restorePlaybackPosition);
  video.load();
}

function playManagedVideo(video, { withSound = false, userInitiated = false } = {}) {
  const wantsSound = withSound && isAudioCapableVideo(video);

  if (reduceMotion.matches && !userInitiated) {
    markAutoplayBlocked(video, false);
    return Promise.resolve(false);
  }

  const state = ensureAmbientVideoState(video);

  if (userInitiated) {
    state.userPaused = false;
  } else if (state.userPaused) {
    updateVideoButtonState(video);
    return Promise.resolve(false);
  }

  if (wantsSound) {
    muteAllOtherVideos(video);
    sharedAudioState.audibleVideo = video;
  } else if (sharedAudioState.audibleVideo === video) {
    sharedAudioState.audibleVideo = null;
  }

  prepareAmbientVideo(video, { withSound: wantsSound });
  ensureBaseVideoSource(video);

  if (state.playAttempt) {
    return state.playAttempt;
  }

  const playResult = video.play();

  if (!playResult || typeof playResult.then !== "function") {
    state.hasPlayed = !video.paused;
    markAutoplayBlocked(video, false);
    syncAllVideoButtons();
    return Promise.resolve(state.hasPlayed);
  }

  state.playAttempt = playResult
    .then(() => {
      state.playAttempt = null;
      state.hasPlayed = true;
      markAutoplayBlocked(video, false);
      syncAllVideoButtons();
      return true;
    })
    .catch((error) => {
      state.playAttempt = null;

      if (wantsSound) {
        clearAudibleVideo(video);
      } else {
        setVideoMutedState(video, true);
      }

      markAutoplayBlocked(video, isPlaybackBlockedError(error) || userInitiated);
      syncAllVideoButtons();
      return false;
    });

  return state.playAttempt;
}

function ensureVideoShell(video) {
  const immediateParent = video.parentElement;

  if (video === heroVideo) {
    const shell = video.closest(".hero");
    shell?.classList.add("video-control-shell");
    return shell;
  }

  if (immediateParent?.matches(".home-reel-video, .cta-video-card, .video-control-shell")) {
    immediateParent.classList.add("video-control-shell");
    return immediateParent;
  }

  const workCard = video.closest(".work-video-card");
  if (workCard) {
    const shell = document.createElement("div");
    shell.className = "video-control-shell work-video-shell";
    workCard.insertBefore(shell, video);
    shell.append(video);
    return shell;
  }

  if (immediateParent?.classList.contains("cta-images")) {
    const shell = document.createElement("div");
    shell.className = "cta-video-card video-control-shell";
    immediateParent.insertBefore(shell, video);
    shell.append(video);
    return shell;
  }

  immediateParent?.classList.add("video-control-shell");
  return immediateParent;
}

function enableVideoSound(video) {
  if (!isAudioCapableVideo(video)) {
    return;
  }

  muteAllOtherVideos(video);
  sharedAudioState.audibleVideo = video;
  ensureAudioVideoSource(video);
  prepareAmbientVideo(video, { withSound: true });
  ensureBaseVideoSource(video);

  if (!video.paused && video.readyState >= 2) {
    setVideoMutedState(video, false);
    markAutoplayBlocked(video, false);
    syncAllVideoButtons();
    return;
  }

  playManagedVideo(video, { withSound: true, userInitiated: true });
}

function muteVideoSound(video) {
  clearAudibleVideo(video);
  prepareAmbientVideo(video, { withSound: false });
  syncAllVideoButtons();
}

function insertVideoControls(video) {
  const state = ensureAmbientVideoState(video);
  if (state.controls) {
    return;
  }

  const shell = ensureVideoShell(video);
  if (!shell) {
    return;
  }

  const controls = document.createElement("div");
  controls.className = "video-controls";
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", "Video controls");

  const playButton = document.createElement("button");
  playButton.type = "button";
  playButton.className = "video-control video-control-play";
  playButton.innerHTML = `
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path class="video-control-icon-play" d="M6.5 4.75 15 10l-8.5 5.25V4.75Z"></path>
      <path class="video-control-icon-pause" d="M5.75 4.75h3v10.5h-3V4.75Zm5.5 0h3v10.5h-3V4.75Z"></path>
    </svg>`;
  playButton.setAttribute("aria-label", "Play video");
  playButton.setAttribute("title", "Play video");
  playButton.hidden = true;
  playButton.addEventListener("click", () => {
    const currentState = ensureAmbientVideoState(video);

    if (!video.paused && !video.ended) {
      currentState.userPaused = true;
      currentState.autoplayBlocked = false;
      video.pause();
      updateVideoButtonState(video);
      return;
    }

    const shouldKeepSound = isAudibleVideo(video) && isAudioCapableVideo(video);
    playManagedVideo(video, { withSound: shouldKeepSound, userInitiated: true });
  });

  let soundButton = null;

  if (isAudioCapableVideo(video)) {
    soundButton = document.createElement("button");
    soundButton.type = "button";
    soundButton.className = "video-control video-control-sound";
    soundButton.addEventListener("click", () => {
      if (isAudibleVideo(video)) {
        muteVideoSound(video);
        return;
      }

      enableVideoSound(video);
    });
  }

  controls.append(playButton);

  if (soundButton) {
    controls.append(soundButton);
  }
  shell.append(controls);

  state.controls = controls;
  state.playButton = playButton;
  state.soundButton = soundButton;

  ["play", "playing", "pause", "ended", "error"].forEach((eventName) => {
    video.addEventListener(eventName, () => updateVideoButtonState(video));
  });

  updateVideoButtonState(video);
}

function updateHeroVideoSource() {
  if (!heroVideo) {
    return;
  }

  const config = getHeroSourceConfig();
  const nextPoster = config?.poster;

  if (nextPoster && heroVideo.getAttribute("poster") !== nextPoster) {
    heroVideo.setAttribute("poster", nextPoster);
  }

  if (reduceMotion.matches) {
    stopAmbientVideo(heroVideo, { reset: true, clearAudio: true });
    heroVideo.preload = "none";
    heroVideo.setAttribute("preload", "none");
    if (heroVideo.getAttribute("src")) {
      heroVideo.removeAttribute("src");
      heroVideo.load();
    }
    return;
  }

  prepareAmbientVideo(heroVideo, { withSound: isAudibleVideo(heroVideo) });
  ensureBaseVideoSource(heroVideo);

  if (heroVideo.readyState >= 2) {
    playManagedVideo(heroVideo, { withSound: false });
  }
}

function handleHeroReady() {
  if (!heroVideo || reduceMotion.matches) {
    return;
  }

  playManagedVideo(heroVideo, { withSound: false });
}

function updateAmbientVideos() {
  ambientVideos.forEach((video) => {
    if (reduceMotion.matches) {
      stopAmbientVideo(video, { reset: video === heroVideo, clearAudio: video === sharedAudioState.audibleVideo });
    } else {
      prepareAmbientVideo(video, { withSound: isAudibleVideo(video) });
    }
  });
}

function isPortfolioVideoVisible(video) {
  const rect = video.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
  const threshold = Math.min(rect.height * 0.2, 180);

  return visibleHeight > threshold;
}

function getPortfolioSourceElement(video) {
  return video.querySelector("source[data-src], source[src]");
}

function ensurePortfolioVideoSource(video) {
  const source = getPortfolioSourceElement(video);
  if (!source) {
    return false;
  }

  const nextSrc = source.dataset.src || source.getAttribute("src");
  if (!nextSrc) {
    return false;
  }

  if (source.getAttribute("src") !== nextSrc) {
    source.setAttribute("src", nextSrc);
    video.load();
  }

  return true;
}

function bindPortfolioReadyPlayback(video) {
  const state = ensureAmbientVideoState(video);
  if (state.readyHandlerAttached) {
    return;
  }

  const handleReady = () => {
    const nextState = ensureAmbientVideoState(video);
    nextState.readyHandlerAttached = false;
    video.removeEventListener("loadeddata", handleReady);
    video.removeEventListener("canplay", handleReady);

    if (isPortfolioVideoVisible(video) && !reduceMotion.matches && !nextState.userPaused) {
      playManagedVideo(video, { withSound: isAudibleVideo(video) });
    }
  };

  state.readyHandlerAttached = true;
  video.addEventListener("loadeddata", handleReady);
  video.addEventListener("canplay", handleReady);
}

function shouldPrimePortfolioVideo(entry) {
  return entry.isIntersecting || entry.boundingClientRect.top <= window.innerHeight + 300;
}

function updatePortfolioVideo(video) {
  if (reduceMotion.matches) {
    stopAmbientVideo(video, { reset: true, clearAudio: video === sharedAudioState.audibleVideo });
    return;
  }

  prepareAmbientVideo(video, { withSound: isAudibleVideo(video) });

  const isVisible = isPortfolioVideoVisible(video);
  setVideoViewportState(video, isVisible);

  if (isVisible) {
    if (ensureAmbientVideoState(video).userPaused) {
      return;
    }

    if (!ensurePortfolioVideoSource(video)) {
      return;
    }

    if (video.readyState >= 2) {
      playManagedVideo(video, { withSound: isAudibleVideo(video) });
    } else {
      bindPortfolioReadyPlayback(video);
    }
    return;
  }

  stopAmbientVideo(video);
}

function primePortfolioVideo(video) {
  if (reduceMotion.matches) {
    return;
  }

  prepareAmbientVideo(video, { withSound: isAudibleVideo(video) });
  ensurePortfolioVideoSource(video);

  if (isPortfolioVideoVisible(video)) {
    updatePortfolioVideo(video);
  }
}

managedVideos.forEach((video) => insertVideoControls(video));

if (heroVideo) {
  heroVideo.addEventListener("loadeddata", handleHeroReady);
  heroVideo.addEventListener("canplay", handleHeroReady);
  updateHeroVideoSource();
  window.addEventListener("resize", updateHeroVideoSource, { passive: true });
  window.visualViewport?.addEventListener("resize", updateHeroVideoSource, { passive: true });
  addMediaQueryListener(reduceMotion, updateHeroVideoSource);
}

if (ambientVideos.length && "IntersectionObserver" in window) {
  const ambientVideoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (reduceMotion.matches) {
          setVideoViewportState(video, entry.isIntersecting);
          stopAmbientVideo(video, { reset: video === heroVideo, clearAudio: video === sharedAudioState.audibleVideo });
          return;
        }

        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          setVideoViewportState(video, true);
          playManagedVideo(video, { withSound: isAudibleVideo(video) });
          return;
        }

        setVideoViewportState(video, false);
        stopAmbientVideo(video);
      });
    },
    {
      threshold: [0, 0.15, 0.35, 0.6],
      rootMargin: "0px 0px 12% 0px",
    }
  );

  ambientVideos.forEach((video) => {
    if (reduceMotion.matches) {
      stopAmbientVideo(video, { reset: video === heroVideo, clearAudio: video === sharedAudioState.audibleVideo });
    } else {
      prepareAmbientVideo(video, { withSound: isAudibleVideo(video) });
      ambientVideoObserver.observe(video);
      if (video === heroVideo) {
        playManagedVideo(video, { withSound: false });
      }
    }
  });

  addMediaQueryListener(reduceMotion, () => {
    ambientVideos.forEach((video) => {
      if (reduceMotion.matches) {
        ambientVideoObserver.unobserve(video);
        stopAmbientVideo(video, { reset: video === heroVideo, clearAudio: video === sharedAudioState.audibleVideo });
      } else {
        prepareAmbientVideo(video, { withSound: isAudibleVideo(video) });
        ambientVideoObserver.observe(video);
        if (video === heroVideo) {
          playManagedVideo(video, { withSound: false });
        }
      }
    });
  });
} else if (ambientVideos.length) {
  ambientVideos.forEach((video) => {
    if (reduceMotion.matches) {
      stopAmbientVideo(video, { reset: video === heroVideo, clearAudio: video === sharedAudioState.audibleVideo });
    } else {
      prepareAmbientVideo(video, { withSound: isAudibleVideo(video) });
      setVideoViewportState(video, true);
      playManagedVideo(video, { withSound: isAudibleVideo(video) });
    }
  });

  addMediaQueryListener(reduceMotion, updateAmbientVideos);
}

if (portfolioVideos.length && "IntersectionObserver" in window) {
  const portfolioVideoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (reduceMotion.matches) {
          setVideoViewportState(video, entry.isIntersecting);
          stopAmbientVideo(video, { reset: true, clearAudio: video === sharedAudioState.audibleVideo });
          return;
        }

        if (shouldPrimePortfolioVideo(entry)) {
          primePortfolioVideo(video);
        }

        if (entry.isIntersecting && entry.intersectionRatio >= 0.01) {
          setVideoViewportState(video, true);
          updatePortfolioVideo(video);
          return;
        }

        setVideoViewportState(video, false);
        stopAmbientVideo(video);
      });
    },
    {
      threshold: [0, 0.01, 0.15, 0.35, 0.6],
      rootMargin: "300px 0px 300px 0px",
    }
  );

  portfolioVideos.forEach((video) => {
    if (reduceMotion.matches) {
      stopAmbientVideo(video, { reset: true, clearAudio: video === sharedAudioState.audibleVideo });
    } else {
      prepareAmbientVideo(video, { withSound: isAudibleVideo(video) });
      portfolioVideoObserver.observe(video);
    }
  });

  window.addEventListener(
    "pageshow",
    () => {
      portfolioVideos.forEach((video) => updatePortfolioVideo(video));
    },
    { passive: true }
  );

  addMediaQueryListener(reduceMotion, () => {
    portfolioVideos.forEach((video) => {
      if (reduceMotion.matches) {
        portfolioVideoObserver.unobserve(video);
        stopAmbientVideo(video, { reset: true, clearAudio: video === sharedAudioState.audibleVideo });
      } else {
        prepareAmbientVideo(video, { withSound: isAudibleVideo(video) });
        portfolioVideoObserver.observe(video);
        updatePortfolioVideo(video);
      }
    });
  });
} else if (portfolioVideos.length) {
  const syncPortfolioVideos = () => {
    portfolioVideos.forEach((video) => {
      if (reduceMotion.matches) {
        stopAmbientVideo(video, { reset: true, clearAudio: video === sharedAudioState.audibleVideo });
      } else {
        prepareAmbientVideo(video, { withSound: isAudibleVideo(video) });
        setVideoViewportState(video, true);
        updatePortfolioVideo(video);
      }
    });
  };

  syncPortfolioVideos();
  window.addEventListener("scroll", syncPortfolioVideos, { passive: true });
  window.addEventListener("resize", syncPortfolioVideos, { passive: true });
  addMediaQueryListener(reduceMotion, syncPortfolioVideos);
}

syncAllVideoButtons();
