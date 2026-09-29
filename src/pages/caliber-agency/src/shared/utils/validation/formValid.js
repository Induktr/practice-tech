const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NAME_REGEX = /^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ\s'-]+$/;
export const LOCAL_DATABASE_KEY = "local_database";

export async function saveToLocalDatabase(data, storageKey = LOCAL_DATABASE_KEY) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let currentDb = [];
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          currentDb = Array.isArray(parsed) ? parsed : [parsed];
        }
      } catch (err) {
        console.warn("[LocalDatabase] Could not parse existing data, initializing empty array:", err);
        currentDb = [];
      }

      const newRecord = {
        id: "lead_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6),
        submittedAt: new Date().toISOString(),
        ...data
      };

      currentDb.push(newRecord);

      try {
        localStorage.setItem(storageKey, JSON.stringify(currentDb));
        console.info(`[LocalDatabase] Successfully saved record to localStorage['${storageKey}']`, newRecord);
      } catch (err) {
        console.error(`[LocalDatabase] Quota exceeded or error saving to localStorage['${storageKey}']`, err);
      }

      resolve({
        success: true,
        record: newRecord,
        allRecords: currentDb
      });
    }, 80);
  });
}

export const submitFormData = saveToLocalDatabase;

export const validators = {
  required: (message = "This field is required") => (val) => {
    return val && val.trim().length > 0 ? true : message;
  },

  name: (options = {}) => (val) => {
    if (!val || val.trim().length === 0) {
      return options.required !== false ? (options.requiredMessage || "Name is required") : true;
    }
    const min = options.min ?? 2;
    const max = options.max ?? 60;
    const trimmed = val.trim();

    if (trimmed.length < min) {
      return options.minMessage || `Name must be at least ${min} characters`;
    }
    if (trimmed.length > max) {
      return options.maxMessage || `Name cannot exceed ${max} characters`;
    }
    if (!NAME_REGEX.test(trimmed)) {
      return options.formatMessage || "Name can only contain letters, spaces and hyphens";
    }
    return true;
  },

  email: (options = {}) => (val) => {
    if (!val || val.trim().length === 0) {
      return options.required !== false ? (options.requiredMessage || "Email is required") : true;
    }
    const trimmed = val.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      return options.formatMessage || "Please enter a valid email address (e.g. name@domain.com)";
    }
    if (options.corporateOnly) {
      const freeProviders = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "mail.ru", "yandex.ru"];
      const domain = trimmed.split("@")[1]?.toLowerCase();
      if (freeProviders.includes(domain)) {
        return options.corporateMessage || "Please provide a corporate email address";
      }
    }
    return true;
  },

  minLength: (min, message) => (val) => {
    if (!val || val.trim().length === 0) return true;
    return val.trim().length >= min ? true : (message || `Minimum ${min} characters required`);
  },

  maxLength: (max, message) => (val) => {
    if (!val) return true;
    return val.trim().length <= max ? true : (message || `Maximum ${max} characters allowed`);
  },

  pattern: (regex, message = "Invalid format") => (val) => {
    if (!val || val.trim().length === 0) return true;
    return regex.test(val.trim()) ? true : message;
  },

  noSpam: (message = "Spam patterns detected in text") => (val) => {
    if (!val) return true;
    const spamRegex = /(https?:\/\/|www\.)\S+|(casino|viagra|crypto|free\s*money|telegram|whatsapp)/i;
    return !spamRegex.test(val) ? true : message;
  },

  custom: (validatorFn) => validatorFn
};

export function validationForm(formTarget, options = {}) {
  const forms = typeof formTarget === "string"
    ? document.querySelectorAll(formTarget)
    : (formTarget instanceof NodeList ? formTarget : [formTarget]);

  if (!forms || forms.length === 0) {
    return { validate: () => true, validateField: () => true, reset: () => {}, destroy: () => {} };
  }

  const instances = [];

  forms.forEach((form) => {
    if (!form || !(form instanceof HTMLFormElement)) return;

    const config = {
      rules: options.rules || {},
      errorClass: options.errorClass || "is-invalid",
      validClass: options.validClass || "is-valid",
      errorContainerSelector: options.errorContainerSelector || ".error-message",
      storageKey: options.storageKey !== undefined ? options.storageKey : LOCAL_DATABASE_KEY,
      validateOn: options.validateOn || "onBlur",
      onSuccess: options.onSuccess || null,
      onError: options.onError || null,
      ...options
    };

    const getFields = () => form.querySelectorAll("input, textarea, select");
    let hasSubmittedOnce = false;

    /**
     * Find the error container for a given field
     */
    const getErrorContainer = (field) => {
      if (field.parentElement) {
        const local = field.parentElement.querySelector(config.errorContainerSelector);
        if (local) return local;
      }
      if (field.nextElementSibling && field.nextElementSibling.matches(config.errorContainerSelector)) {
        return field.nextElementSibling;
      }
      const customTarget = field.getAttribute("data-error-target");
      if (customTarget) {
        return form.querySelector(customTarget) || document.querySelector(customTarget);
      }
      return null;
    };

    /**
     * Collect all field values as key-value object
     */
    const getAllValues = () => {
      const data = {};
      getFields().forEach((f) => {
        const key = f.name || f.id || f.type || "field";
        data[key] = f.value ? f.value.trim() : "";
      });
      return data;
    };

    /**
     * Validate a single input field against custom or auto-inferred rules
     */
    const validateField = (field) => {
      const val = field.value ? field.value.trim() : "";
      const allValues = getAllValues();

      const keyCandidates = [
        field.name,
        field.id,
        field.type,
        field.getAttribute("aria-label"),
        field.getAttribute("placeholder")
      ].filter(Boolean);

      let ruleList = null;
      for (const key of keyCandidates) {
        if (config.rules[key]) {
          ruleList = config.rules[key];
          break;
        }
      }

      // If no explicit rule, auto-infer from attributes
      if (!ruleList) {
        ruleList = [];
        const isRequired = field.hasAttribute("required") || field.placeholder?.includes("*");
        if (isRequired) {
          const fieldLabel = field.getAttribute("placeholder")?.replace(/\*|\s+/g, " ").trim() || "This field";
          ruleList.push(validators.required(`${fieldLabel} is required`));
        }
        if (field.type === "email") {
          ruleList.push(validators.email());
        }
        const minLen = field.getAttribute("minlength");
        if (minLen) {
          ruleList.push(validators.minLength(parseInt(minLen, 10)));
        }
      }

      if (!Array.isArray(ruleList)) {
        ruleList = [ruleList];
      }

      let errorMessage = "";

      for (const rule of ruleList) {
        if (typeof rule === "function") {
          const result = rule(val, allValues, form);
          if (result !== true && typeof result === "string") {
            errorMessage = result;
            break;
          } else if (result === false) {
            errorMessage = "Invalid value";
            break;
          }
        }
      }

      // Update UI feedback
      const errBox = getErrorContainer(field);
      if (errorMessage) {
        field.classList.add(config.errorClass);
        field.classList.remove(config.validClass);
        if (errBox) {
          errBox.textContent = errorMessage;
          errBox.classList.add("is-visible");
        }
        return { valid: false, name: field.name || field.type, error: errorMessage };
      } else {
        field.classList.remove(config.errorClass);
        if (val) field.classList.add(config.validClass);
        if (errBox) {
          errBox.textContent = "";
          errBox.classList.remove("is-visible");
        }
        return { valid: true, name: field.name || field.type, value: val };
      }
    };

    // Live validation listener on blur
    const onBlur = (e) => {
      if (e.target.matches("input, textarea, select")) {
        validateField(e.target);
      }
    };

    // Real-time error clearance or re-validation on input
    const onInput = (e) => {
      if (e.target.matches("input, textarea, select")) {
        if (hasSubmittedOnce || e.target.classList.contains(config.errorClass)) {
          validateField(e.target);
        }
      }
    };

    form.addEventListener("blur", onBlur, true);
    form.addEventListener("input", onInput);

    /**
     * Validate the entire form
     */
    const validateAll = () => {
      const fields = getFields();
      const errors = {};
      const values = {};
      let isFormValid = true;

      fields.forEach((field) => {
        const res = validateField(field);
        if (!res.valid) {
          isFormValid = false;
          errors[res.name] = res.error;
        } else {
          values[res.name] = res.value;
        }
      });

      return { valid: isFormValid, values, errors };
    };

    const onSubmit = async (e) => {
      e.preventDefault();
      hasSubmittedOnce = true;
      const { valid, values, errors } = validateAll();

      if (valid) {
        let storageResult = null;
        if (config.storageKey) {
          storageResult = await saveToLocalDatabase(values, config.storageKey);
        }

        if (typeof config.onSuccess === "function") {
          await config.onSuccess(values, form, storageResult);
        } else {
          console.info("[validationForm] Form submitted and saved:", values);
        }
      } else {
        if (typeof config.onError === "function") {
          config.onError(errors, form);
        }
      }
    };

    form.addEventListener("submit", onSubmit);

    instances.push({
      validate: validateAll,
      validateField: (target) => {
        const f = typeof target === "string" ? form.querySelector(target) : target;
        return f ? validateField(f).valid : true;
      },
      reset: () => {
        hasSubmittedOnce = false;
        form.reset();
        getFields().forEach((f) => {
          f.classList.remove(config.errorClass, config.validClass);
          const errBox = getErrorContainer(f);
          if (errBox) {
            errBox.textContent = "";
            errBox.classList.remove("is-visible");
          }
        });
      },
      destroy: () => {
        form.removeEventListener("submit", onSubmit);
        form.removeEventListener("blur", onBlur, true);
        form.removeEventListener("input", onInput);
      }
    });
  });

  return {
    validate: () => instances.every((inst) => inst.validate().valid),
    validateField: (target) => instances.every((inst) => inst.validateField(target)),
    reset: () => instances.forEach((inst) => inst.reset()),
    destroy: () => instances.forEach((inst) => inst.destroy())
  };
}