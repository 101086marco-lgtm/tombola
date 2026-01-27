/* =====================================================
   🔥 FIREBASE INIT (OBBLIGATORIO IN CIMA)
===================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCtuepB5Zrdg01fN37P9AivwwQCqc5950M",
  authDomain: "super-tombola.firebaseapp.com",
  databaseURL: "https://super-tombola-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "super-tombola",
  storageBucket: "super-tombola.appspot.com",
  messagingSenderId: "435954736235",
  appId: "1:435954736235:web:888090e32d4a663ae9e52e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* =====================================================
   🎮 STATO LOCALE
===================================================== */
let role = null;
let selectedPrize = null;

const prizeOrder = ["ambo", "terno", "quaterna", "cinquina", "tombola"];

/* =====================================================
   👤 RUOLI
===================================================== */
window.setRole = function (r) {
  role = r;
  document.getElementById("roleSelect").classList.add("hidden");
  document.getElementById(r).classList.remove("hidden");
};

/* =====================================================
   ▶️ AVVIO / RESET PARTITA
===================================================== */
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
    players: {
      1: { name: "Giocatore 1", wins: {} },
      2: { name: "Giocatore 2", wins: {} },
      3: { name: "Giocatore 3", wins: {} }
    }
  });
};

window.resetGame = function () {
  set(ref(db, "game"), null);
};

/* =====================================================
   🏆 PREMI
===================================================== */
function selectPrize(prize) {
  selectedPrize = prize;
}

function assignPrize(playerId) {
  if (!selectedPrize) return;

  const prizeRef = ref(db, `game/prizes/${selectedPrize}`);

  update(prizeRef, {
    won: true,
    player: playerId
  });

  update(ref(db, `game/players/${playerId}/wins`), {
    [selectedPrize]: true
  });

  selectedPrize = null;
}

/* =====================================================
   🔄 SYNC REALTIME
===================================================== */
onValue(ref(db, "game"), (snap) => {
  const game = snap.val();
  renderCaller(game);
  renderTV(game);
});

/* =====================================================
   📣 CHIAMANTE
===================================================== */
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
      btn.classList.add("disabled");
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

/* =====================================================
   📺 TV
===================================================== */
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
    const d = document.createElement("div");
    const wins = Object.keys(p.wins || {}).join(", ");
    d.textContent = `${p.name} → ${wins || "nessun premio"}`;
    tvPlayers.appendChild(d);
  });

  prizeOrder.forEach(p => {
    const d = document.createElement("div");
    d.textContent = game.prizes[p].won
      ? `${p.toUpperCase()} VINTA`
      : `${p.toUpperCase()} disponibile`;
    tvPrizes.appendChild(d);
  });
}