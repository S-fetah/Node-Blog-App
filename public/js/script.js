// prompt("say may name!! : ");
document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementsByClassName("searchBtn")[0];
  const searchBar = document.getElementsByClassName("searchBar")[0];
  const searchInput = document.getElementById("searchInput");
  const searchClose = document.getElementById("searchClose");
  console.log(searchBtn);

  searchBtn.addEventListener("click", () => {
    searchBar.style.visibility = "visible";
    searchBar.classList.add("open");
    searchBtn.setAttribute("aria-expanded", "true");
    searchInput.focus();
  });
  searchClose.addEventListener("click", () => {
    searchBar.style.visibility = "hidden";
  });
});
