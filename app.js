/*************************************************
* FIREBASE
*************************************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  push
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCtuepB5ZrdqO1fN37P9Aivw0Cqc5950M",
  authDomain: "super-tombola.firebaseapp.com",
  databaseURL: "https://super-tombola-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "super-tombola",
  storageBucket: "super-tombola.appspot.com",
  messagingSenderId: "435954736235",
  appId: "1:435954736235:web:888090e32d4a663ae9e52e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/*************************************************
* GLOBALI
*************************************************/
let role = null;
let selectedPrize = null;

const prizeOrder = ["ambo", "terno", "quaterna", "cinquina", "tombola"];

/*************************************************
* RUOLI
*************************************************/
window.setRole = function (r) {
  role = r;
  document.getElementById("roleSelect").classList.add("hidden");
  document.getElementById(r).classList.remove("hidden");
};

/*************************************************
* PARTITA
*************************************************/
window.startGame = function () {
  set(ref(db, "game"), {
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
};

window.resetGame = function () {
  set(ref(db, "game"), null);
};

/*************************************************
* PREMI
*************************************************/
window.selectPrize = function (p) {
  selectedPrize = p;
};

window.assignPrize = function (playerId) {
  if (!selectedPrize) return;

  update(ref(db, `game/prizes/${selectedPrize}`), {
    won: true,
    player: playerId
  });

  push(ref(db, `game/players/${playerId}/wins`), selectedPrize);
  selectedPrize = null;
};

/*************************************************
* SYNC GLOBALE
*************************************************/
onValue(ref(db, "game"), (snap) => {
  const game = snap.val();
  renderCaller(game);
  renderTV(game);
});

/*************************************************
* CALLER
*************************************************/
function renderCaller(game) {
  if (role !== "caller") return;

  const prizesDiv = document.getElementById("prizes");
  const playersDiv = document.getElementById("players");

  prizesDiv.innerHTML = "";
  playersDiv.innerHTML = "";

  if (!game) return;

  prizeOrder.forEach(p => {
    const btn = document.createElement("button");
    btn.textContent = p.toUpperCase();
    btn.disabled = game.prizes[p].won;
    btn.onclick = () => selectPrize(p);
    prizesDiv.appendChild(btn);
  });

  Object.entries(game.players || {}).forEach(([id, p]) => {
    const b = document.createElement("button");
    b.textContent = p.name;
    b.onclick = () => assignPrize(id);
    playersDiv.appendChild(b);
  });
}

/*************************************************
* TV
*************************************************/
function renderTV(game) {
  if (role !== "tv") return;

  const tvPlayers = document.getElementById("tvPlayers");
  const tvPrizes = document.getElementById("tvPrizes");

  tvPlayers.innerHTML = "";
  tvPrizes.innerHTML = "";

  if (!game) {
    tvPlayers.textContent = "In attesa di partita...";
    return;
  }

  Object.values(game.players || {}).forEach(p => {
    const d = document.createElement("div");
    d.style.fontSize = "1.5em";
    d.textContent = `${p.name} → ${(p.wins || []).join(", ")}`;
    tvPlayers.appendChild(d);
  });

  prizeOrder.forEach(p => {
    const d = document.createElement("div");
    d.style.fontSize = "1.3em";
    d.textContent = game.prizes[p].won
      ? `${p.toUpperCase()} VINTA`
      : `${p.toUpperCase()} DISPONIBILE`;
    tvPrizes.appendChild(d);
  });
}
