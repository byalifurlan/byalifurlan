const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const form = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const filterButtons = document.querySelectorAll("[data-filter]");
const workCards = document.querySelectorAll("[data-category]");
const testimonialTrack = document.querySelector("[data-testimonial-track]");
const testimonialSlides = document.querySelectorAll("[data-testimonial-slide]");
const testimonialDots = document.querySelector("[data-testimonial-dots]");
const testimonialPrev = document.querySelector("[data-testimonial-prev]");
const testimonialNext = document.querySelector("[data-testimonial-next]");

function updateHeader() {
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
        `Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\nProject:\n${data.get("message")}`
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

if (filterButtons.length && workCards.length) {
  filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      });

      workCards.forEach((card) => {
        const isVisible = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !isVisible);

        if (!isVisible) {
          card.querySelector("video")?.pause();
        }
      });
    });
  });
}
const ambientVideos = document.querySelectorAll("[data-ambient-video]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const heroVideo = document.querySelector("[data-hero-video]");
const heroVideoMobile = window.matchMedia("(max-width: 768px)");

function updateHeroVideoSource() {
  if (!heroVideo) {
    return;
  }

  const nextSrc = heroVideoMobile.matches
    ? heroVideo.dataset.mobileSrc
    : heroVideo.dataset.desktopSrc;
  const nextPoster = heroVideoMobile.matches
    ? heroVideo.dataset.mobilePoster
    : heroVideo.dataset.desktopPoster;

  if (nextPoster) {
    heroVideo.poster = nextPoster;
  }

  if (reduceMotion.matches) {
    heroVideo.pause();
    heroVideo.removeAttribute("autoplay");
    if (heroVideo.getAttribute("src")) {
      heroVideo.removeAttribute("src");
      heroVideo.load();
    }
    return;
  }

  if (heroVideo.getAttribute("src") !== nextSrc) {
    heroVideo.src = nextSrc;
    heroVideo.load();
  }
}

if (heroVideo) {
  updateHeroVideoSource();
  heroVideoMobile.addEventListener("change", updateHeroVideoSource);
  reduceMotion.addEventListener("change", updateHeroVideoSource);
}

function stopAmbientVideo(video) {
  video.pause();
  video.currentTime = 0;
  video.removeAttribute("autoplay");
}

function playAmbientVideo(video) {
  video.setAttribute("autoplay", "");
  video.play().catch(() => {});
}

function updateAmbientVideos() {
  ambientVideos.forEach((video) => {
    if (reduceMotion.matches) {
      stopAmbientVideo(video);
    }
  });
}

if (ambientVideos.length && "IntersectionObserver" in window) {
  const ambientVideoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (reduceMotion.matches || !entry.isIntersecting) {
          stopAmbientVideo(video);
          return;
        }

        playAmbientVideo(video);
      });
    },
    { threshold: 0.35 }
  );

  ambientVideos.forEach((video) => {
    if (reduceMotion.matches) {
      stopAmbientVideo(video);
    } else {
      ambientVideoObserver.observe(video);
    }
  });

  reduceMotion.addEventListener("change", () => {
    ambientVideos.forEach((video) => {
      if (reduceMotion.matches) {
        ambientVideoObserver.unobserve(video);
        stopAmbientVideo(video);
      } else {
        ambientVideoObserver.observe(video);
      }
    });
  });
} else if (ambientVideos.length) {
  ambientVideos.forEach((video) => {
    if (reduceMotion.matches) {
      stopAmbientVideo(video);
    } else {
      playAmbientVideo(video);
    }
  });

  reduceMotion.addEventListener("change", updateAmbientVideos);
}
