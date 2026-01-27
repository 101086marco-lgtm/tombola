/* ================= FIREBASE ================= */

const firebaseConfig = {
  apiKey: "TUO_API_KEY",
  authDomain: "TUO_DOMINIO",
  databaseURL: "TUO_DATABASE_URL",
  projectId: "TUO_PROJECT_ID",
  storageBucket: "TUO_BUCKET",
  messagingSenderId: "TUO_SENDER_ID",
  appId: "TUO_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/* ================= SCREEN ================= */

function setScreen(mode) {
  firebase.database().ref("screens/mode").set(mode);
}

/* ================= GAME CONTROL ================= */

function startGame() {
  firebase.database().ref("game").set({
    started: true,
    currentPrize: "ambo",
    prizes: {
      ambo: { won: false, player: null },
      terno: { won: false, player: null },
      quaterna: { won: false, player: null },
      cinquina: { won: false, player: null },
      tombola: { won: false, player: null }
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
  firebase.database().ref("screens/mode").set("select");
}

/* ================= ASSIGN PRIZE ================= */

let selectedPrize = null;

function selectPrize(p) {
  selectedPrize = p;
}

function assignPrize(playerId) {
  if (!selectedPrize) return;

  const prizeRef = firebase.database().ref(`game/prizes/${selectedPrize}`);
  prizeRef.once("value", snap => {
    if (snap.val().won) return;

    prizeRef.update({
      won: true,
      player: playerId
    });

    firebase.database()
      .ref(`game/players/${playerId}/wins/${Date.now()}`)
      .set(selectedPrize);

    selectedPrize = null;
  });
}

/* ================= RENDER ================= */

firebase.database().ref().on("value", snap => {
  const data = snap.val() || {};
  renderScreens(data.screens?.mode);
  renderCaller(data.game);
  renderTV(data.game);
});

function renderScreens(mode) {
  ["screenSelect", "caller", "tv", "player"].forEach(id =>
    document.getElementById(id).classList.add("hidden")
  );

  if (!mode || mode === "select") {
    document.getElementById("screenSelect").classList.remove("hidden");
  } else {
    document.getElementById(mode).classList.remove("hidden");
  }
}

function renderCaller(game) {
  if (!game) return;

  const prizesDiv = document.getElementById("callerPrizes");
  const playersDiv = document.getElementById("callerPlayers");
  prizesDiv.innerHTML = "";
  playersDiv.innerHTML = "";

  Object.entries(game.prizes).forEach(([p, val]) => {
    const b = document.createElement("button");
    b.textContent = p.toUpperCase();
    if (val.won) b.classList.add("prize-won");
    b.onclick = () => selectPrize(p);
    prizesDiv.appendChild(b);
  });

  Object.entries(game.players).forEach(([id, p]) => {
    const b = document.createElement("button");
    b.textContent = p.name;
    b.onclick = () => assignPrize(id);
    playersDiv.appendChild(b);
  });
}

function renderTV(game) {
  const prizeDiv = document.getElementById("tvPrize");
  const playersDiv = document.getElementById("tvPlayers");

  if (!game) {
    prizeDiv.textContent = "In attesa di partita…";
    playersDiv.innerHTML = "";
    return;
  }

  prizeDiv.textContent = game.currentPrize.toUpperCase();

  playersDiv.innerHTML = "";
  Object.values(game.players).forEach(p => {
    const d = document.createElement("div");
    d.textContent = `${p.name}: ${Object.values(p.wins || {}).join(", ")}`;
    playersDiv.appendChild(d);
  });
}
