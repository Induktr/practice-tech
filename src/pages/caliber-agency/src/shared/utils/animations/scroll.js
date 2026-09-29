export function createScrollHeader(headerTarget, options = {}) {
  const header = typeof headerTarget === "string" 
    ? document.querySelector(headerTarget) 
    : headerTarget;

  if (!header) return { destroy: () => {} };

  const config = {
    threshold: options.threshold ?? (header.offsetTop || 80),
    hiddenClass: options.hiddenClass || "is-hidden",
    showDelay: options.showDelay ?? 350,
    onStateChange: options.onStateChange || null,
    ...options
  };

  let timerId = null;
  let isHidden = false;

  const hideElement = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    if (!isHidden) {
      header.classList.add(config.hiddenClass);
      isHidden = true;
      if (config.onStateChange) config.onStateChange(true);
    }
  };

  const showElement = () => {
    if (!timerId && isHidden) {
      timerId = setTimeout(() => {
        header.classList.remove(config.hiddenClass);
        isHidden = false;
        timerId = null;
        if (config.onStateChange) config.onStateChange(false);
      }, config.showDelay);
    }
  };

  const onScroll = () => {
    const currentScrollY = window.pageYOffset || window.scrollY;
    if (currentScrollY > config.threshold) {
      hideElement();
    } else {
      showElement();
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  return {
    destroy: () => {
      window.removeEventListener("scroll", onScroll);
      if (timerId) clearTimeout(timerId);
    }
  };
}

/**
 * Creates an elevator lift / reveal parallax effect on ANY element as its container enters viewport.
 * 
 * @param {string | HTMLElement} containerTarget - Outer masked container
 * @param {string | HTMLElement} contentTarget - Element to elevate
 * @param {Object} [options] - Configuration options
 * @param {number} [options.maxLift=80] - Starting vertical distance in px to ascend
 * @param {number} [options.minOpacity=0.2] - Starting opacity before reveal
 * @param {number} [options.viewportFactor=0.75] - Section of viewport determining completion
 * @param {string} [options.visibleClass="is-visible"] - Class added when in viewport
 * @returns {{ destroy: () => void }}
 */
export function createScrollElevator(containerTarget, contentTarget, options = {}) {
  const container = typeof containerTarget === "string"
    ? document.querySelector(containerTarget)
    : containerTarget;

  if (!container) return { destroy: () => {} };

  const content = typeof contentTarget === "string"
    ? container.querySelector(contentTarget) || document.querySelector(contentTarget)
    : contentTarget;

  if (!content) return { destroy: () => {} };

  const config = {
    maxLift: options.maxLift ?? 80,
    minOpacity: options.minOpacity ?? 0.2,
    viewportFactor: options.viewportFactor ?? 0.75,
    visibleClass: options.visibleClass || "is-visible",
    ...options
  };

  let ticking = false;

  const updateElevator = () => {
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top < windowHeight && rect.bottom > 0) {
      // Calculate progress (0 = entering bottom, 1 = fully reached position)
      const progress = Math.min(1, Math.max(0, (windowHeight - rect.top) / (windowHeight * config.viewportFactor)));
      const lift = (1 - progress) * config.maxLift;
      const opacity = config.minOpacity + progress * (1 - config.minOpacity);

      content.style.transform = `translate3d(0, ${lift.toFixed(2)}px, 0)`;
      content.style.opacity = `${opacity.toFixed(2)}`;
      container.classList.add(config.visibleClass);
    }

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateElevator);
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  updateElevator();

  return {
    destroy: () => window.removeEventListener("scroll", onScroll)
  };
}

/**
 * Universal scroll manager: initializes multiple triggers with dynamic configuration
 * 
 * @param {Object} [config]
 * @param {string | HTMLElement} [config.header] - Selector or node for scroll-hiding header
 * @param {string | HTMLElement} [config.elevatorContainer] - Selector or node for elevator parent
 * @param {string | HTMLElement} [config.elevatorTarget] - Selector or node for elevator content
 */
export function scrollTriggerAnimation(config = {}) {
  const instances = [];

  const headerSelector = config.header || ".agency-header";
  if (headerSelector) {
    instances.push(createScrollHeader(headerSelector, config.headerOptions));
  }

  const elevatorContainer = config.elevatorContainer || ".caliber-footer";
  const elevatorTarget = config.elevatorTarget || ".footer__brand-title";
  if (elevatorContainer && elevatorTarget) {
    instances.push(createScrollElevator(elevatorContainer, elevatorTarget, config.elevatorOptions));
  }

  return {
    destroy: () => instances.forEach((inst) => inst.destroy && inst.destroy())
  };
}

/**
 * Dynamic 3D Card Stack Elevator:
 * Scales down and softly dims each stuck card as the next card arrives and layers over it.
 * 
 * @param {string | NodeList | HTMLElement[]} cardsTarget - Selector or list of cards
 * @param {Object} [options]
 * @param {number} [options.scaleFactor=0.04] - Amount to scale down previous card
 * @param {number} [options.opacityFactor=0.08] - Amount to dim previous card
 * @returns {{ destroy: () => void }}
 */
export function createCardStack(cardsTarget, options = {}) {
  const cards = typeof cardsTarget === "string"
    ? Array.from(document.querySelectorAll(cardsTarget))
    : (cardsTarget instanceof NodeList ? Array.from(cardsTarget) : cardsTarget);

  if (!cards || cards.length < 2) return { destroy: () => {} };

  const config = {
    scaleFactor: options.scaleFactor ?? 0.04,
    opacityFactor: options.opacityFactor ?? 0.08,
    ...options
  };

  let ticking = false;

  const updateStack = () => {
    for (let i = 0; i < cards.length - 1; i++) {
      const currentCard = cards[i];
      const nextCard = cards[i + 1];

      const currentRect = currentCard.getBoundingClientRect();
      const nextRect = nextCard.getBoundingClientRect();

      const overlap = currentRect.bottom - nextRect.top;
      const cardHeight = currentRect.height || 400;

      if (overlap > 0 && nextRect.top < currentRect.bottom) {
        const progress = Math.min(1, Math.max(0, overlap / cardHeight));
        const scale = 1 - progress * config.scaleFactor;
        const opacity = 1 - progress * config.opacityFactor;

        currentCard.style.transform = `scale(${scale.toFixed(4)})`;
        currentCard.style.opacity = `${opacity.toFixed(3)}`;
      } else {
        currentCard.style.transform = "scale(1)";
        currentCard.style.opacity = "1";
      }
    }

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateStack);
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  updateStack();

  return {
    destroy: () => {
      window.removeEventListener("scroll", onScroll);
      cards.forEach((c) => {
        c.style.transform = "";
        c.style.opacity = "";
      });
    }
  };
}
