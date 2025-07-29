const key = "scroll-cookie";
// Set relative link path (without domain)
var rpath = location.pathname;


const fullKey = key + ":" + rpath;

let saveTimeout = null;

window.addEventListener("scroll", () => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const y = window.scrollY || document.documentElement.scrollTop;
    localStorage.setItem(fullKey, y);
  }, 500);
})

document.addEventListener("DOMContentLoaded", () => {
  // Read position from cookie
  const saved = localStorage.getItem(fullKey);
  if (saved !== null) {
    const y = parseInt(saved, 10);
    if (!isNaN(y)) {
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }
})
