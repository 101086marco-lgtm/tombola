/*************************
* FIREBASE CONFIG (V8)
*************************/
var firebaseConfig = {
  apiKey: "INSERISCI_LA_TUA_API_KEY",
  authDomain: "super-tombola.firebaseapp.com",
  databaseURL: "https://super-tombola-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "super-tombola",
  storageBucket: "super-tombola.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.database();

/*************************
* STATO LOCALE
*************************/
let currentScreen = "home";
let selectedPrize = null;

const prizeOrder = ["ambo", "terno", "quaterna", "cinquina", "tombola"];

/*************************
* CAMBIO SCHERMATA
*************************/
function setScreen(screen) {
  currentScreen = screen;

  document.getElementById("home").style.display = "none";
  document.getElementById("caller").style.display = "none";
  document.getElementById("tv").style.display = "none";

  document.getElementById(screen).style.display = "block";
}

/*************************
* CLICK PULSANTI HOME
*************************/
function openCaller() {
  console.log("chiamante cliccato");
  setScreen("caller");
}

function openTV() {
  console.log("tv cliccato");
  setScreen("tv");
}

/*************************
* AVVIO / RESET PARTITA
*************************/
function startGame() {
  firebase.database().ref("game").set({
    started: true,
    prizes: {
      ambo: { won: false },
      terno: { won: false },
      quaterna: { won: false },
      cinquina: { won: false },
      tombola: { won: false }
    },
    players: {}
  });
}

function resetGame() {
  firebase.database().ref("game").remove();
}

/*************************
* PREMI
*************************/
function selectPrize(prize) {
  selectedPrize = prize;
}

function assignPrize(playerId) {
  if (!selectedPrize) return;

  firebase.database().ref("game/prizes/" + selectedPrize).update({
    won: true,
    player: playerId
  });

  firebase.database().ref("game/players/" + playerId + "/wins").push(selectedPrize);
  selectedPrize = null;
}

/*************************
* RENDER CHIAMANTE
*************************/
function renderCaller(game) {
  if (!game) return;

  const prizesDiv = document.getElementById("prizes");
  const playersDiv = document.getElementById("players");

  prizesDiv.innerHTML = "";
  playersDiv.innerHTML = "";

  prizeOrder.forEach(p => {
    const b = document.createElement("button");
    b.textContent = p.toUpperCase();
    if (game.prizes[p].won) b.disabled = true;
    b.onclick = () => selectPrize(p);
    prizesDiv.appendChild(b);
  });

  Object.keys(game.players || {}).forEach(id => {
    const b = document.createElement("button");
    b.textContent = game.players[id].name;
    b.onclick = () => assignPrize(id);
    playersDiv.appendChild(b);
  });
}

/*************************
* RENDER TV
*************************/
function renderTV(game) {
  const tv = document.getElementById("tvContent");
  tv.innerHTML = "";

  if (!game || !game.started) {
    tv.textContent = "In attesa di partita...";
    return;
  }

  Object.values(game.players || {}).forEach(p => {
    const d = document.createElement("div");
    d.textContent = p.name + " → " + Object.values(p.wins || {}).join(", ");
    tv.appendChild(d);
  });
}

/*************************
* LISTENER FIREBASE
*************************/
firebase.database().ref("game").on("value", snap => {
  const game = snap.val();
  if (currentScreen === "caller") renderCaller(game);
  if (currentScreen === "tv") renderTV(game);
});