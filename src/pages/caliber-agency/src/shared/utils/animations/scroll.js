import { header } from "../../../app/app.js";

export function scrollTriggerAnimation() {
  let ticking = false;
  let timerId = null;

  const footer = document.querySelector(".caliber-footer");
  const brandTitle = document.querySelector(".footer__brand-title");

  const hideElement = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const showElement = () => {
    if (!timerId && header) {
      timerId = setTimeout(() => {
        header.classList.remove("is-hidden");
        timerId = null;
      }, 400);
    }
  };

  const updateScrollState = () => {
    const currentScrollY = window.pageYOffset || window.scrollY;

    // Header State
    if (header) {
      const headerHeight = header.offsetTop || 100;
      if (currentScrollY > headerHeight) {
        hideElement();
        header.classList.add("is-hidden");
      } else {
        showElement();
      }
    }

    // Footer Elevator Lift Effect
    if (footer && brandTitle) {
      const rect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight && rect.bottom > 0) {
        // Progress of footer visibility (0 to 1)
        const progress = Math.min(1, Math.max(0, (windowHeight - rect.top) / (windowHeight * 0.75)));
        const lift = (1 - progress) * 80; // Starts 80px below and ascends smoothly to 0px
        brandTitle.style.transform = `translate3d(0, ${lift.toFixed(2)}px, 0)`;
        brandTitle.style.opacity = `${Math.min(1, 0.2 + progress * 0.8).toFixed(2)}`;
        footer.classList.add("is-visible");
      }
    }

    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    },
    { passive: true }
  );

  // Initial check on load
  updateScrollState();
}
