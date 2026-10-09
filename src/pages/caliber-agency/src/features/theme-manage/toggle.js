const DEFAULT_OPTIONS = {
  triggerSelector: ".header__theme-toggle, [data-theme-toggle]",
  storageKey: "caliber_theme",
  defaultTheme: "light",
  attribute: "data-theme",
  icons: {
    dark: "./src/shared/assets/icons/theme/sun.svg",
    light: "./src/shared/assets/icons/theme/moon.svg"
  },
  onThemeChange: null
};

export function createThemeManager(options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const root = document.documentElement;

  const getSystemTheme = () => {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const getStoredTheme = () => {
    return Promise.try(() => localStorage.getItem(config.storageKey));
  };

  const updateUI = (theme) => {
    root.setAttribute(config.attribute, theme);
    root.setAttribute("color-scheme", theme);

    Promise.try(() => localStorage.setItem(config.storageKey, theme));

    // Update icons in any attached trigger elements
    const triggers = typeof config.triggerSelector === "string"
      ? document.querySelectorAll(config.triggerSelector)
      : (config.triggerSelector instanceof NodeList ? config.triggerSelector : [config.triggerSelector]);

    triggers.forEach((btn) => {
      if (!btn) return;
      const icon = btn.querySelector("img, svg");
      if (icon && icon.tagName.toLowerCase() === "img") {
        icon.src = theme === "dark" ? config.icons.dark : config.icons.light;
        icon.alt = theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme";
      }
    });

    if (typeof config.onThemeChange === "function") {
      config.onThemeChange(theme);
    }

    // Dispatch a standard custom event so ANY component in the app can listen
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  };

  let currentTheme = getStoredTheme() || getSystemTheme() || config.defaultTheme;
  updateUI(currentTheme);

  const setTheme = (nextTheme) => {
    currentTheme = nextTheme;
    updateUI(nextTheme);
  };

  const toggleTheme = () => {
    const next = currentTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  const clickHandlers = [];
  const triggers = typeof config.triggerSelector === "string"
    ? document.querySelectorAll(config.triggerSelector)
    : (config.triggerSelector instanceof NodeList ? config.triggerSelector : [config.triggerSelector]);

  triggers.forEach((btn) => {
    if (!btn) return;
    const handler = (e) => {
      e.preventDefault();
      toggleTheme();
    };
    btn.addEventListener("click", handler);
    clickHandlers.push({ btn, handler });
  });

  return {
    getTheme: () => currentTheme,
    setTheme,
    toggleTheme,
    destroy: () => clickHandlers.forEach(({ btn, handler }) => btn.removeEventListener("click", handler))
  };
}

export function toggle(options = {}) {
  return createThemeManager(options);
}
