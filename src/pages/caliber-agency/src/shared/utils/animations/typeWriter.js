export function typeWriter(triggerTarget, contentTarget = null, options = {}) {
  const config = {
    stagger: 25,
    duration: 450,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    offsetY: null,
    ...options
  };

  const triggers = typeof triggerTarget === "string" 
    ? document.querySelectorAll(triggerTarget)
    : (triggerTarget instanceof NodeList ? triggerTarget : [triggerTarget]);

  if (!triggers || triggers.length === 0) return;

  triggers.forEach((trigger) => {
    if (!trigger) return;

    let nodeContent = trigger;
    if (contentTarget) {
      nodeContent = typeof contentTarget === "string"
        ? trigger.querySelector(contentTarget) || document.querySelector(contentTarget)
        : contentTarget;
    }

    if (!nodeContent) return;

    const computedStyle = window.getComputedStyle(nodeContent);
    const fontSize = parseFloat(computedStyle.fontSize) || 16;
    const lineHeight = computedStyle.lineHeight !== "normal" ? computedStyle.lineHeight : `${fontSize * 1.2}px`;
    const fontWeight = computedStyle.fontWeight;
    const letterSpacing = computedStyle.letterSpacing;
    const fontFamily = computedStyle.fontFamily;

    const shiftY = config.offsetY !== null 
      ? config.offsetY 
      : Math.round(parseFloat(lineHeight) || fontSize * 1.3);

    const rawContent = nodeContent.textContent || "";
    const words = rawContent.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) return;

    const isMultiWord = words.length > 1;
    const cleanFontFamily = fontFamily.replace(/['"]/g, "").trim();

    // Use color: inherit so characters always dynamically respect CSS theme colors
    const fontInheritStyle = `font-size:${fontSize}px;line-height:${lineHeight};font-weight:${fontWeight};letter-spacing:${letterSpacing};font-family:"${cleanFontFamily}",sans-serif;color:inherit;`;

    // Helper: Render single character without whitespace between tags
    const renderChar = (char) => `<span class="char-mask" style="display:inline-block;overflow:hidden;position:relative;vertical-align:top;height:${lineHeight};${fontInheritStyle}"><span class="char-primary" style="display:inline-block;transform:translate3d(0,0,0);opacity:1;${fontInheritStyle}">${char}</span><span class="char-duplicate" style="display:inline-block;position:absolute;left:0;top:0;transform:translate3d(0,${shiftY}px,0);opacity:0;${fontInheritStyle}">${char}</span></span>`;

    // Render characters: zero whitespace for single-word, space separator for multi-word
    if (!isMultiWord) {
      nodeContent.innerHTML = [...words[0]].map(renderChar).join("");
    } else {
      nodeContent.innerHTML = words.map((word) => [...word].map(renderChar).join("")).join(`<span class="char-space" style="display:inline-block;width:0.28em;"></span>`);
    }

    const masks = nodeContent.querySelectorAll(".char-mask");

    // --- Arrow Kinetic Dual-Layer Mask with Theme-Aware Colors ---
    const existingIcon = trigger.querySelector("img");
    let iconPrimary = null;
    let iconDuplicate = null;
    let flightDistance = 22;

    if (existingIcon) {
      let iconMask = existingIcon.parentElement;
      if (!iconMask.classList.contains("icon-mask")) {
        const rawW = parseFloat(existingIcon.getAttribute("width")) || 16;
        const rawH = parseFloat(existingIcon.getAttribute("height")) || 16;
        
        const maskW = rawW + 8;
        const maskH = rawH + 8;
        flightDistance = Math.round(maskW * 1.15);

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
          transform: matrix(1, 0, 0, 1, -${flightDistance}, ${flightDistance});
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

    // Phase 1: Mouse Enter
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
            { transform: `matrix(1, 0, 0, 1, ${flightDistance}, -${flightDistance})` }
          ],
          { duration: config.duration, easing: config.easing, fill: "forwards" }
        );

        iconDuplicate.animate(
          [
            { transform: `matrix(1, 0, 0, 1, -${flightDistance}, ${flightDistance})` },
            { transform: "matrix(1, 0, 0, 1, 0, 0)" }
          ],
          { duration: config.duration, easing: config.easing, fill: "forwards" }
        );
      }
    };

    // Phase 2: Mouse Leave
    const onLeave = () => {
      masks.forEach((mask, index) => {
        const primary = mask.querySelector(".char-primary");
        const duplicate = mask.querySelector(".char-duplicate");
        const delay = index * config.stagger;

        if (primary && duplicate) {
          primary.animate(
            [
              { transform: `translate3d(0, 0, 0)`, opacity: 0 },
              { transform: `translate3d(0, -${shiftY}px, 0)`, opacity: 0 }
            ],
            { duration: config.duration, delay, easing: config.easing, fill: "forwards" }
          );

          duplicate.animate(
            [
              { transform: `translate3d(0, -${shiftY}px, 0)`, opacity: 0 },
              { transform: `translate3d(0, 0, 0)`, opacity: 1 }
            ],
            { duration: config.duration, delay, easing: config.easing, fill: "forwards" }
          );
        }
      });

      if (iconPrimary && iconDuplicate) {
        iconDuplicate.animate(
          [
            { transform: "matrix(1, 0, 0, 1, 0, 0)" },
            { transform: `matrix(1, 0, 0, 1, ${flightDistance}, -${flightDistance})` }
          ],
          { duration: config.duration, easing: config.easing, fill: "forwards" }
        );

        iconPrimary.animate(
          [
            { transform: `matrix(1, 0, 0, 1, -${flightDistance}, ${flightDistance})` },
            { transform: "matrix(1, 0, 0, 1, 0, 0)" }
          ],
          { duration: config.duration, easing: config.easing, fill: "forwards" }
        );
      }
    };

    trigger.addEventListener("mouseenter", onEnter);
    trigger.addEventListener("mouseleave", onLeave);
  });
}
