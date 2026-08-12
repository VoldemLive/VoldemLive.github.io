const button = document.querySelector(".menu-button");
const links = document.querySelector(".nav-links");
if (button && links) {
  button.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
  });
}
document.querySelectorAll(".year").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const lightboxLinks = [...document.querySelectorAll("[data-lightbox]")];

if (lightboxLinks.length) {
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.hidden = true;
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Image viewer");
  lightbox.innerHTML = `
    <div class="lightbox-toolbar">
      <span class="lightbox-counter" aria-live="polite"></span>
      <button class="lightbox-close" type="button" aria-label="Close image viewer">×</button>
    </div>
    <div class="lightbox-stage">
      <button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous image">‹</button>
      <div class="lightbox-media"><img class="lightbox-image" alt=""></div>
      <button class="lightbox-nav lightbox-next" type="button" aria-label="Next image">›</button>
    </div>
    <p class="lightbox-caption" aria-live="polite"></p>
  `;
  document.body.append(lightbox);

  const closeButton = lightbox.querySelector(".lightbox-close");
  const previousButton = lightbox.querySelector(".lightbox-prev");
  const nextButton = lightbox.querySelector(".lightbox-next");
  const image = lightbox.querySelector(".lightbox-image");
  const counter = lightbox.querySelector(".lightbox-counter");
  const caption = lightbox.querySelector(".lightbox-caption");
  const stage = lightbox.querySelector(".lightbox-stage");
  const media = lightbox.querySelector(".lightbox-media");
  let currentIndex = 0;
  let returnFocusTo = null;
  let touchStartX = null;

  const getCaption = (link) => {
    const figureCaption = link.closest("figure")?.querySelector("figcaption");
    return figureCaption?.textContent.trim() || link.querySelector("img")?.alt || "";
  };

  const showImage = (index) => {
    currentIndex = (index + lightboxLinks.length) % lightboxLinks.length;
    const link = lightboxLinks[currentIndex];
    const thumbnail = link.querySelector("img");
    image.src = link.href;
    image.alt = thumbnail?.alt || "";
    caption.textContent = getCaption(link);
    counter.textContent = `${currentIndex + 1} / ${lightboxLinks.length}`;
    previousButton.disabled = lightboxLinks.length < 2;
    nextButton.disabled = lightboxLinks.length < 2;
  };

  const openLightbox = (index, trigger) => {
    returnFocusTo = trigger;
    showImage(index);
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    closeButton.focus();
  };

  const closeLightbox = () => {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    image.removeAttribute("src");
    returnFocusTo?.focus();
  };

  const showPrevious = () => showImage(currentIndex - 1);
  const showNext = () => showImage(currentIndex + 1);

  lightboxLinks.forEach((link, index) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openLightbox(index, link);
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  previousButton.addEventListener("click", showPrevious);
  nextButton.addEventListener("click", showNext);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target === stage || event.target === media) {
      closeLightbox();
    }
  });

  lightbox.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0]?.clientX ?? null;
  }, { passive: true });

  lightbox.addEventListener("touchend", (event) => {
    if (touchStartX === null || lightboxLinks.length < 2) return;
    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const distance = touchEndX - touchStartX;
    touchStartX = null;
    if (Math.abs(distance) < 45) return;
    if (distance > 0) showPrevious();
    else showNext();
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;

    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showPrevious();
    if (event.key === "ArrowRight") showNext();

    if (event.key === "Tab") {
      const controls = [closeButton, previousButton, nextButton].filter((control) => !control.disabled);
      const firstControl = controls[0];
      const lastControl = controls.at(-1);
      if (event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault();
        lastControl.focus();
      } else if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault();
        firstControl.focus();
      }
    }
  });
}
