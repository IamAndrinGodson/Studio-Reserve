const themeToggle = document.querySelector("#themeToggle");
const savedTheme = localStorage.getItem("studioreserve-site-theme");

if (savedTheme) {
  document.documentElement.dataset.theme = savedTheme;
  themeToggle.textContent = savedTheme === "dark" ? "DM" : "LM";
}

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  themeToggle.textContent = nextTheme === "dark" ? "DM" : "LM";
  localStorage.setItem("studioreserve-site-theme", nextTheme);
});
