export function toggle() {
  const themeToggle = document.querySelector(".header__theme-toggle");
  if (!themeToggle) return;

  const iconEl = themeToggle.querySelector(".header__theme-icon");

  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", initial);
  updateIcon(initial);

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateIcon(next);
  });

  function updateIcon(theme) {
    if (!iconEl) return;
    iconEl.src = theme === "dark"
      ? "./src/shared/assets/icons/theme/sun.svg"
      : "./src/shared/assets/icons/theme/moon.svg";
    iconEl.alt = theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
  }
}
