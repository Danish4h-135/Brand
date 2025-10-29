document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const newTheme = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    // small ripple feedback
    toggle.classList.add("ripple");
    setTimeout(() => toggle.classList.remove("ripple"), 300);
  });
});
