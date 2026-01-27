/*************************************************
* 🔥 FIREBASE INIT (OBBLIGATORIO)
*************************************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, update, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCtuepB5Zrdqo1fN37P9Aivww0Cqc5950M",
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
* 🎮 STATO LOCALE
*************************************************/
let role = null;
let selectedPrize = null;

const prizeOrder = ["ambo", "terno", "quaterna", "cinquina", "tombola"];

/*************************************************
* 🎭 SELEZIONE RUOLO
*************************************************/
window.setRole = function (r) {
  role = r;
  document.getElementById("roleSelect").classList.add("hidden");
  document.getElementById(r).classList.remove("hidden");
};

/*************************************************
* ▶️ AVVIO / RESET PARTITA
*************************************************/
window.startGame = function () {
  set(ref(db, "game"), {
    started: true,
    currentPrize: "ambo",
    prizes: {
      ambo: { won: false },
      terno: { won: false },
      quaterna: { won: false },
      cinquina: { won: false },
      tombola: { won: false }
    },
    players: {
      1: { name: "Giocatore 1", wins: [] },
      2: { name: "Giocatore 2", wins: [] },
      3: { name: "Giocatore 3", wins: [] }
    }
  });
};

window.resetGame = function () {
  remove(ref(db, "game"));
};

/*************************************************
* 🏆 PREMI
*************************************************/
window.selectPrize = function (prize) {
  selectedPrize = prize;
};

window.assignPrize = function (playerId) {
  if (!selectedPrize) return;

  update(ref(db, `game/prizes/${selectedPrize}`), {
    won: true,
    player: playerId
  });

  update(ref(db, `game/players/${playerId}/wins`), {
    [Date.now()]: selectedPrize
  });

  const next = prizeOrder[prizeOrder.indexOf(selectedPrize) + 1];
  if (next) {
    update(ref(db, "game"), { currentPrize: next });
  }

  selectedPrize = null;
};

/*************************************************
* 📡 SINCRONIZZAZIONE REALTIME
*************************************************/
onValue(ref(db, "game"), (snap) => {
  const game = snap.val();
  renderCaller(game);
  renderTV(game);
});

/*************************************************
* 🧑‍💼 SCHERMATA CHIAMANTE
*************************************************/
function renderCaller(game) {
  if (role !== "caller") return;

  const prizeDiv = document.getElementById("prizes");
  const playersDiv = document.getElementById("players");

  prizeDiv.innerHTML = "";
  playersDiv.innerHTML = "";

  if (!game) return;

  prizeOrder.forEach(p => {
    const btn = document.createElement("button");
    btn.textContent = p.toUpperCase();
    if (game.prizes[p].won) {
      btn.disabled = true;
      btn.style.opacity = 0.4;
    }
    btn.onclick = () => selectPrize(p);
    prizeDiv.appendChild(btn);
  });

  Object.entries(game.players).forEach(([id, p]) => {
    const b = document.createElement("button");
    b.textContent = p.name;
    b.onclick = () => assignPrize(id);
    playersDiv.appendChild(b);
  });
}

/*************************************************
* 📺 SCHERMATA TV
*************************************************/
function renderTV(game) {
  if (role !== "tv") return;

  const tvPlayers = document.getElementById("tvPlayers");
  const tvPrize = document.getElementById("tvPrize");

  tvPlayers.innerHTML = "";
  tvPrize.innerHTML = "";

  if (!game) {
    tvPrize.textContent = "In attesa di partita...";
    return;
  }

  tvPrize.textContent = `🏆 Premio in gioco: ${game.currentPrize.toUpperCase()}`;

  Object.values(game.players).forEach(p => {
    const d = document.createElement("div");
    d.textContent = `${p.name} → ${Object.values(p.wins || {}).join(", ")}`;
    tvPlayers.appendChild(d);
  });
}