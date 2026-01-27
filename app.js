let role = null;
let selectedPrize = null;

const prizeOrder = ["ambo", "terno", "quaterna", "cinquina", "tombola"];

function setRole(r) {
  role = r;
  document.getElementById("roleSelect").classList.add("hidden");
  document.getElementById(r).classList.remove("hidden");
}

/* ------------------ GAME CONTROL ------------------ */

function startGame() {
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
      1: { name: "Giocatore 1", wins: [] },
      2: { name: "Giocatore 2", wins: [] },
      3: { name: "Giocatore 3", wins: [] }
    }
  });
}

function resetGame() {
  set(ref(db, "game"), null);
}

/* ------------------ ASSIGN PRIZE ------------------ */

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
    [Date.now()]: selectedPrize
  });

  selectedPrize = null;
}

/* ------------------ UI RENDER ------------------ */

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
    if (game.prizes[p].won) btn.disabled = true;
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
    const d = document.createElement("div");
    d.textContent = `${p.name} → ${Object.values(p.wins || {}).join(", ")}`;
    tvPlayers.appendChild(d);
  });

  prizeOrder.forEach(p => {
    const d = document.createElement("div");
    d.textContent = game.prizes[p].won
      ? `${p.toUpperCase()} vinta`
      : `${p.toUpperCase()} disponibile`;
    tvPrizes.appendChild(d);
  });
}