console.log("app.js caricato correttamente");

const home = document.getElementById("home");
const chiamante = document.getElementById("chiamante");
const tv = document.getElementById("tv");

const btnChiamante = document.getElementById("btnChiamante");
const btnTV = document.getElementById("btnTV");

function showScreen(screen) {
  home.classList.add("hidden");
  chiamante.classList.add("hidden");
  tv.classList.add("hidden");

  screen.classList.remove("hidden");
}

btnChiamante.addEventListener("click", () => {
  console.log("CHIAMANTE cliccato");
  showScreen(chiamante);
});

btnTV.addEventListener("click", () => {
  console.log("TV cliccato");
  showScreen(tv);
});