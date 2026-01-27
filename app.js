/*************************************************
* FIREBASE CONFIG
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
* GLOBAL STATE
*************************************************/
let role = null;
let selectedPrize = null;

const prizeOrder = ["ambo", "terno", "quaterna", "cinquina", "tombola"];

/*************************************************
* ROLE
*************************************************/
window.setRole = function (r) {
  role = r;
  document.getElementById("roleSelect").classList.add("hidden");
  document.getElementById(r).classList.remove("hidden");
};

/*************************************************
* GAME CONTROL
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
    players: {},
    cards: {}
  });
};

window.resetGame = function () {
  set(ref(db, "game"), null);
};

/*************************************************
* CARTELLE (GENERAZIONE)
*************************************************/
function generateCard() {
  const card = [];
  const used = new Set();

  for (let r = 0; r < 3; r++) {
    const row = new Array(9).fill(null);
    let count = 0;

    while (count < 5) {
      const col = Math.floor(Math.random() * 9);
      if (row[col] !== null) continue;

      const min = col * 10 + 1;
      const max = col === 8 ? 90 : col * 10 + 10;
      let num;

      do {
        num = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (used.has(num));

      used.add(num);
      row[col] = num;
      count++;
    }
    card.push(row);
  }
  return card;
}

/*************************************************
* ASSEGNA CARTELLE (CHIAMANTE)
*************************************************/
window.assignCards = function () {
  const name = document.getElementById("playerName").value.trim();
  const qty = parseInt(document.getElementById("cardQty").value);

  if (!name || qty < 1) return alert("Nome o numero cartelle non valido");

  const playerId = push(ref(db, "game/players")).key;
  const cards = [];

  for (let i = 0; i < qty; i++) {
    cards.push(generateCard());
  }

  set(ref(db, `game/players/${playerId}`), {
    name,
    wins: []
  });

  set(ref(db, `game/cards/${playerId}`), cards);

  const link = `${location.origin}${location.pathname.replace("index.html","")}cartelle.html?id=${playerId}`;
  document.getElementById("qrLink").value = link;
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
* RENDER SYNC
*************************************************/
onValue(ref(db, "game"), (snap) => {
  const game = snap.val();
  renderCaller(game);
  renderTV(game);
});

/*************************************************
* CALLER UI
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
    if (game.prizes[p].won) btn.disabled = true;
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
* TV UI
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
    d.textContent = `${p.name} → ${(p.wins || []).join(", ")}`;
    tvPlayers.appendChild(d);
  });

  prizeOrder.forEach(p => {
    const d = document.createElement("div");
    d.textContent = game.prizes[p].won
      ? `${p.toUpperCase()} VINTA`
      : `${p.toUpperCase()} DISPONIBILE`;
    tvPrizes.appendChild(d);
  });
}
