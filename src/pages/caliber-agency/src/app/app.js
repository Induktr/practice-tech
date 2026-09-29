import { createThemeManager } from "../features/theme-manage/toggle.js";
import { createScrollHeader, createScrollElevator, createCardStack } from "../shared/utils/animations/scroll.js";
import { typeWriter } from "../shared/utils/animations/typeWriter.js";
import { validationForm, validators } from "../shared/utils/validation/formValid.js";

function initApp() {
  createThemeManager({
    triggerSelector: ".header__theme-toggle",
    storageKey: "caliber_theme"
  });

  createScrollHeader(".agency-header", {
    threshold: 80,
    hiddenClass: "is-hidden",
    showDelay: 350
  });

  createScrollElevator(".caliber-footer", ".footer__brand-title", {
    maxLift: 80,
    minOpacity: 0.2,
    viewportFactor: 0.75
  });

  createCardStack(".services .service-card", {
    scaleFactor: 0.04,
    opacityFactor: 0.06
  });

  typeWriter(".header__contact-btn", ".header__contact-text", { stagger: 25, duration: 400 });
  typeWriter(".hero__scroll-cta", ".hero__scroll-text", { stagger: 20, duration: 400 });
  typeWriter(".contact-form__submit-btn", ".contact-form__submit-text", { stagger: 30, duration: 450 });

  validationForm(".contact-form", {
    errorClass: "is-invalid",
    validClass: "is-valid",
    validateOn: "onBlur",
    storageKey: "local_database", // Key for localStorage persistence
    rules: {
      name: [
        validators.required("Please enter your name"),
        validators.name({
          min: 2,
          max: 60,
          formatMessage: "Name should only contain letters and spaces"
        })
      ],
      email: [
        validators.required("Email address is required"),
        validators.email({
          formatMessage: "Please enter a valid email address (e.g. name@company.com)"
        })
      ],
      description: [
        validators.noSpam("Spam patterns or links are not permitted"),
        validators.maxLength(1000, "Description cannot exceed 1000 characters")
      ]
    },
    onSuccess: (formData, form, storageResult) => {
      console.info("[local_database] Submission record successfully saved:", storageResult);
      alert(`Thank you, ${formData.name || "Client"}! Your project request has been submitted and stored.`);
      form.reset();
    },
    onError: (errors) => {
      console.warn("[Validation] Submission prevented due to errors:", errors);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
