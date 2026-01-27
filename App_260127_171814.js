import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "PROJECT.firebaseapp.com",
  databaseURL: "https://PROJECT-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "PROJECT",
  storageBucket: "PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "APPID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let role = null;
let selectedPrize = null;

const prizeOrder = ["ambo", "terno", "quaterna", "cinquina", "tombola"];

window.setRole = (r) => {
  role = r;
  document.getElementById("roleSelect").classList.add("hidden");
  document.getElementById(r).classList.remove("hidden");
};

window.startGame = () => {
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
      1: { name: "Giocatore 1", wins: {}, cards: {} },
      2: { name: "Giocatore 2", wins: {}, cards: {} },
      3: { name: "Giocatore 3", wins: {}, cards: {} }
    }
  });
};

window.resetGame = () => {
  set(ref(db, "game"), null);
};

window.selectPrize = (p) => selectedPrize = p;

window.assignPrize = (playerId) => {
  if (!selectedPrize) return;

  update(ref(db, `game/prizes/${selectedPrize}`), {
    won: true,
    player: playerId
  });

  update(ref(db, `game/players/${playerId}/wins`), {
    [selectedPrize]: true
  });

  const next = prizeOrder.find(p => !document.game?.prizes?.[p]?.won);
  if (next) update(ref(db, "game"), { currentPrize: next });

  selectedPrize = null;
};

onValue(ref(db, "game"), snap => {
  const game = snap.val();
  if (role === "caller") renderCaller(game);
  if (role === "tv") renderTV(game);
});

function renderCaller(game) {
  const prizes = document.getElementById("prizes");
  const players = document.getElementById("players");
  prizes.innerHTML = "";
  players.innerHTML = "";

  if (!game) return;

  prizeOrder.forEach(p => {
    const b = document.createElement("button");
    b.textContent = p.toUpperCase();
    if (game.prizes[p].won) {
      b.disabled = true;
      b.style.textDecoration = "line-through";
      b.style.background = "#555";
    }
    b.onclick = () => selectPrize(p);
    prizes.appendChild(b);
  });

  Object.entries(game.players).forEach(([id, pl]) => {
    const b = document.createElement("button");
    b.textContent = pl.name;
    b.onclick = () => assignPrize(id);
    players.appendChild(b);
  });
}

function renderTV(game) {
  const tvPrize = document.getElementById("tvPrize");
  const tvPlayers = document.getElementById("tvPlayers");
  tvPlayers.innerHTML = "";

  if (!game) {
    tvPrize.textContent = "In attesa di partita…";
    return;
  }

  tvPrize.textContent = `Si gioca per: ${game.currentPrize.toUpperCase()}`;

  Object.values(game.players).forEach(p => {
    const d = document.createElement("div");
    d.textContent = `${p.name} → ${Object.keys(p.wins || {}).join(", ")}`;
    tvPlayers.appendChild(d);
  });
}