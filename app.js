// 🔥 FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "LA_TUA_API_KEY",
  authDomain: "TUO_PROGETTO.firebaseapp.com",
  databaseURL: "https://TUO_PROGETTO-default-rtdb.firebaseio.com",
  projectId: "TUO_PROGETTO",
  storageBucket: "TUO_PROGETTO.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --------------------

let role = null;
let selectedPrize = null;

const prizeOrder = ["ambo", "terno", "quaterna", "cinquina", "tombola"];

window.setRole = (r) => {
  role = r;
  document.getElementById("roleSelect").classList.add("hidden");
  document.getElementById(r).classList.remove("hidden");
};

// ---------------- GAME ----------------

window.startGame = () => {
  set(ref(db, "game"), {
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
};

window.resetGame = () => {
  set(ref(db, "game"), null);
};

// ---------------- PREMI ----------------

function selectPrize(prize) {
  selectedPrize = prize;
}

function assignPrize(playerId) {
  if (!selectedPrize) return;

  update(ref(db, `game/prizes/${selectedPrize}`), {
    won: true,
    player: playerId
  });

  update(ref(db, `game/players/${playerId}/wins`), {
    [selectedPrize]: true
  });

  selectedPrize = null;
}

// ---------------- RENDER ----------------

onValue(ref(db, "game"), (snap) => {
  const game = snap.val();
  renderCaller(game);
  renderTV(game);
});

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
    if (game.prizes[p].won) btn.classList.add("won");
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

  Object.values(game.players).forEach(p => {
    const wins = Object.keys(p.wins || {}).join(", ");
    const d = document.createElement("div");
    d.textContent = `${p.name} → ${wins}`;
    tvPlayers.appendChild(d);
  });

  prizeOrder.forEach(p => {
    const d = document.createElement("div");
    d.textContent = game.prizes[p].won
      ? `🏆 ${p.toUpperCase()}`
      : p.toUpperCase();
    tvPrizes.appendChild(d);
  });
}