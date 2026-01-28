/*************************
 * FIREBASE CONFIG (v8)
 *************************/
var firebaseConfig = {
  apiKey: "INSERISCI_LA_TUA_API_KEY",
  authDomain: "super-tombola.firebaseapp.com",
  databaseURL: "https://super-tombola-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "super-tombola",
  storageBucket: "super-tombola.appspot.com",
  messagingSenderId: "INSERISCI_SENDER_ID",
  appId: "INSERISCI_APP_ID"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.database();

/*************************
 * STATO
 *************************/
let currentScreen = "home";
let selectedPrize = null;

const prizeOrder = ["ambo", "terno", "quaterna", "cinquina", "tombola"];

/*************************
 * NAVIGAZIONE SCHERMI
 *************************/
function showScreen(screen) {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("caller").classList.add("hidden");
  document.getElementById("tv").classList.add("hidden");

  document.getElementById(screen).classList.remove("hidden");
  currentScreen = screen;
}

function openCaller() {
  console.log("chiamante cliccato");
  showScreen("caller");
}

function openTV() {
  console.log("tv cliccato");
  showScreen("tv");
}

/*************************
 * PARTITA
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
    players: {
      1: { name: "Giocatore 1", wins: {} },
      2: { name: "Giocatore 2", wins: {} },
      3: { name: "Giocatore 3", wins: {} }
    }
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

  const prizeRef = firebase.database().ref("game/prizes/" + selectedPrize);

  prizeRef.once("value").then(snap => {
    if (snap.val().won) return;

    prizeRef.update({
      won: true,
      player: playerId
    });

    firebase.database()
      .ref("game/players/" + playerId + "/wins")
      .push(selectedPrize);

    selectedPrize = null;
  });
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
    const btn = document.createElement("button");
    btn.textContent = p.toUpperCase();
    if (game.prizes[p].won) btn.classList.add("prize-won");
    btn.onclick = () => selectPrize(p);
    prizesDiv.appendChild(btn);
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

  Object.values(game.players).forEach(p => {
    const d = document.createElement("div");
    d.textContent = p.name + " → " + Object.values(p.wins || {}).join(", ");
    tv.appendChild(d);
  });
}

/*************************
 * SYNC FIREBASE
 *************************/
firebase.database().ref("game").on("value", snap => {
  const game = snap.val();
  if (currentScreen === "caller") renderCaller(game);
  if (currentScreen === "tv") renderTV(game);
});