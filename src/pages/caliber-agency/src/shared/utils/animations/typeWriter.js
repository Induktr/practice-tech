export function typeWriter(triggerTarget, contentTarget = null, options = {}) {
  const config = {
    stagger: options.stagger ?? 25,
    duration: options.duration ?? 450,
    easing: options.easing || "cubic-bezier(0.16, 1, 0.3, 1)",
    offsetY: options.offsetY ?? null,
    iconTarget: options.iconTarget !== undefined ? options.iconTarget : "img, svg",
    flightDistance: options.flightDistance ?? null,
    spaceWidth: options.spaceWidth || "0.28em",
    ...options
  };

  const triggers = typeof triggerTarget === "string" 
    ? document.querySelectorAll(triggerTarget)
    : (triggerTarget instanceof NodeList || Array.isArray(triggerTarget) ? triggerTarget : [triggerTarget]);

  if (!triggers || triggers.length === 0) return { destroy: () => {} };

  const cleanups = [];

  triggers.forEach((trigger) => {
    if (!trigger || !(trigger instanceof HTMLElement)) return;

    let nodeContent = trigger;
    if (contentTarget) {
      nodeContent = typeof contentTarget === "string"
        ? trigger.querySelector(contentTarget) || document.querySelector(contentTarget)
        : contentTarget;
    }

    if (!nodeContent) return;

    const rawContent = nodeContent.textContent || "";
    const words = rawContent.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return;

    const computedStyle = window.getComputedStyle(nodeContent);
    const fontSize = parseFloat(computedStyle.fontSize) || 16;
    const lineHeight = computedStyle.lineHeight !== "normal" ? computedStyle.lineHeight : `${fontSize * 1.2}px`;
    const fontWeight = computedStyle.fontWeight;
    const letterSpacing = computedStyle.letterSpacing;
    const fontFamily = computedStyle.fontFamily;

    const shiftY = config.offsetY !== null 
      ? config.offsetY 
      : Math.round(parseFloat(lineHeight) || fontSize * 1.3);

    const isMultiWord = words.length > 1;
    // Render clean character masks that naturally inherit CSS typography and colors
    const renderChar = (char) => `<span class="char-mask" style="height:${lineHeight};"><span class="char-primary">${char}</span><span class="char-duplicate" style="transform:translate3d(0,${shiftY}px,0);">${char}</span></span>`;

    if (!isMultiWord) {
      nodeContent.innerHTML = [...words[0]].map(renderChar).join("");
    } else {
      nodeContent.innerHTML = words.map((word) => [...word].map(renderChar).join("")).join(`<span class="char-space" style="width:${config.spaceWidth};"></span>`);
    }

    const masks = nodeContent.querySelectorAll(".char-mask");

    // Dynamic Companion Icon Roll-Through Setup
    let iconPrimary = null;
    let iconDuplicate = null;
    let computedFlight = config.flightDistance || 22;

    if (config.iconTarget) {
      const existingIcon = trigger.querySelector(config.iconTarget);
      if (existingIcon) {
        let iconMask = existingIcon.parentElement;
        if (!iconMask.classList.contains("icon-mask")) {
          const rawW = parseFloat(existingIcon.getAttribute("width")) || existingIcon.clientWidth || 16;
          const rawH = parseFloat(existingIcon.getAttribute("height")) || existingIcon.clientHeight || 16;
          
          const maskW = rawW + 8;
          const maskH = rawH + 8;
          computedFlight = config.flightDistance || Math.round(maskW * 1.15);

          iconMask = document.createElement("span");
          iconMask.className = "icon-mask";
          iconMask.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            width: ${maskW}px;
            height: ${maskH}px;
            vertical-align: middle;
            flex-shrink: 0;
          `;

          iconPrimary = existingIcon.cloneNode(true);
          iconPrimary.classList.add("icon-primary");
          iconPrimary.style.cssText = `
            display: block;
            position: absolute;
            width: ${rawW}px;
            height: ${rawH}px;
            transform: matrix(1, 0, 0, 1, 0, 0);
            will-change: transform;
          `;

          iconDuplicate = existingIcon.cloneNode(true);
          iconDuplicate.classList.add("icon-duplicate");
          iconDuplicate.style.cssText = `
            display: block;
            position: absolute;
            width: ${rawW}px;
            height: ${rawH}px;
            transform: matrix(1, 0, 0, 1, -${computedFlight}, ${computedFlight});
            will-change: transform;
          `;

          iconMask.appendChild(iconPrimary);
          iconMask.appendChild(iconDuplicate);
          existingIcon.replaceWith(iconMask);
        } else {
          iconPrimary = iconMask.querySelector(".icon-primary");
          iconDuplicate = iconMask.querySelector(".icon-duplicate");
        }
      }
    }

    // Phase 1: Enter / Active
    const onEnter = () => {
      masks.forEach((mask, index) => {
        const primary = mask.querySelector(".char-primary");
        const duplicate = mask.querySelector(".char-duplicate");
        const delay = index * config.stagger;

        if (primary && duplicate) {
          primary.animate(
            [
              { transform: "translate3d(0, 0, 0)", opacity: 1 },
              { transform: `translate3d(0, -${shiftY}px, 0)`, opacity: 0 }
            ],
            { duration: config.duration, delay, easing: config.easing, fill: "forwards" }
          );

          duplicate.animate(
            [
              { transform: `translate3d(0, ${shiftY}px, 0)`, opacity: 0 },
              { transform: "translate3d(0, 0, 0)", opacity: 1 }
            ],
            { duration: config.duration, delay, easing: config.easing, fill: "forwards" }
          );
        }
      });

      if (iconPrimary && iconDuplicate) {
        iconPrimary.animate(
          [
            { transform: "matrix(1, 0, 0, 1, 0, 0)" },
            { transform: `matrix(1, 0, 0, 1, ${computedFlight}, -${computedFlight})` }
          ],
          { duration: config.duration, easing: config.easing, fill: "forwards" }
        );

        iconDuplicate.animate(
          [
            { transform: `matrix(1, 0, 0, 1, -${computedFlight}, ${computedFlight})` },
            { transform: "matrix(1, 0, 0, 1, 0, 0)" }
          ],
          { duration: config.duration, easing: config.easing, fill: "forwards" }
        );
      }
    };

    // Phase 2: Leave / Return
    const onLeave = () => {
      masks.forEach((mask, index) => {
        const primary = mask.querySelector(".char-primary");
        const duplicate = mask.querySelector(".char-duplicate");
        const delay = index * config.stagger;

        if (primary && duplicate) {
          primary.animate(
            [
              { transform: `translate3d(0, -${shiftY}px, 0)`, opacity: 0 },
              { transform: "translate3d(0, 0, 0)", opacity: 1 }
            ],
            { duration: config.duration, delay, easing: config.easing, fill: "forwards" }
          );

          duplicate.animate(
            [
              { transform: `translate3d(0, 0, 0)`, opacity: 1 },
              { transform: `translate3d(0, ${shiftY}px, 0)`, opacity: 0 }
            ],
            { duration: config.duration, delay, easing: config.easing, fill: "forwards" }
          );
        }
      });

      if (iconPrimary && iconDuplicate) {
        iconDuplicate.animate(
          [
            { transform: "matrix(1, 0, 0, 1, 0, 0)" },
            { transform: `matrix(1, 0, 0, 1, ${computedFlight}, -${computedFlight})` }
          ],
          { duration: config.duration, easing: config.easing, fill: "forwards" }
        );

        iconPrimary.animate(
          [
            { transform: `matrix(1, 0, 0, 1, -${computedFlight}, ${computedFlight})` },
            { transform: "matrix(1, 0, 0, 1, 0, 0)" }
          ],
          { duration: config.duration, easing: config.easing, fill: "forwards" }
        );
      }
    };

    trigger.addEventListener("mouseenter", onEnter);
    trigger.addEventListener("mouseleave", onLeave);

    cleanups.push(() => {
      trigger.removeEventListener("mouseenter", onEnter);
      trigger.removeEventListener("mouseleave", onLeave);
    });
  });

  return {
    destroy: () => cleanups.forEach((fn) => fn())
  };
}