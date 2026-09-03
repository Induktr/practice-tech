import { toggle } from "../features/theme-manage/toggle.js";
import { scrollTriggerAnimation } from "../shared/utils/animations/scroll.js";
import { typeWriter } from "../shared/utils/animations/typeWriter.js";
import { validationForm } from "../shared/utils/validation/formValid.js";

export const header = document.querySelector(".agency-header");

toggle();
scrollTriggerAnimation();
typeWriter(".header__contact-btn", ".header__contact-text");
typeWriter(".hero__scroll-cta", ".hero__scroll-text");
typeWriter(".contact-form__submit-btn", ".contact-form__submit-text");
validationForm();
