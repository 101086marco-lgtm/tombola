console.log("APP.JS CARICATO OK");

let ruolo = null;
let partitaAttiva = false;

const giocatori = [
  { nome: "Mario", premi: [] },
  { nome: "Luigi", premi: [] },
  { nome: "Anna", premi: [] }
];

const premi = {
  ambo:     { vinto: false, vincitore: null },
  terno:    { vinto: false, vincitore: null },
  quaterna: { vinto: false, vincitore: null },
  cinquina: { vinto: false, vincitore: null },
  tombola:  { vinto: false, vincitore: null }
};

let premioCorrente = "ambo";

/* ---------------- RUOLO ---------------- */

function setRuolo(r) {
  ruolo = r;
  document.getElementById("schermata-ruolo").classList.add("hidden");

  if (r === "chiamante") {
    document.getElementById("schermata-chiamante").classList.remove("hidden");
    renderChiamante();
  } else {
    document.getElementById("schermata-tv").classList.remove("hidden");
    aggiornaTV();
    document.documentElement.requestFullscreen?.();
  }
}

/* ---------------- PARTITA ---------------- */

function avviaPartita() {
  partitaAttiva = true;
  premioCorrente = "ambo";
  aggiornaTV();
}

function resetPartita() {
  partitaAttiva = false;
  premioCorrente = "ambo";

  for (let p in premi) {
    premi[p].vinto = false;
    premi[p].vincitore = null;
  }

  giocatori.forEach(g => g.premi = []);

  renderChiamante();
  aggiornaTV();
}

/* ---------------- PREMI ---------------- */

function assegnaPremio(premio, nomeGiocatore) {
  if (premi[premio].vinto) return;

  premi[premio].vinto = true;
  premi[premio].vincitore = nomeGiocatore;

  const g = giocatori.find(g => g.nome === nomeGiocatore);
  g.premi.push(premio);

  premioCorrente = prossimoPremio();
  renderChiamante();
  aggiornaTV();
}

function prossimoPremio() {
  for (let p in premi) {
    if (!premi[p].vinto) return p;
  }
  return "FINE PARTITA";
}

/* ---------------- RENDER CHIAMANTE ---------------- */

function renderChiamante() {
  const premiDiv = document.getElementById("lista-premi");
  premiDiv.innerHTML = "";

  for (let p in premi) {
    const div = document.createElement("div");
    div.className = "premio" + (premi[p].vinto ? " vinto" : "");
    div.textContent = p.toUpperCase();

    if (!premi[p].vinto) {
      div.onclick = () => {
        const nome = prompt("Assegna a chi?");
        if (nome) assegnaPremio(p, nome);
      };
    }

    premiDiv.appendChild(div);
  }

  const gDiv = document.getElementById("lista-giocatori");
  gDiv.innerHTML = "";

  giocatori.forEach(g => {
    const d = document.createElement("div");
    d.className = "giocatore";
    d.innerHTML = `<strong>${g.nome}</strong><br>Premi: ${g.premi.join(", ") || "-"}`;
    gDiv.appendChild(d);
  });
}

/* ---------------- TV ---------------- */

function aggiornaTV() {
  document.getElementById("tv-premio").textContent =
    partitaAttiva ? premioCorrente.toUpperCase() : "IN ATTESA";

  let testo = "";
  for (let p in premi) {
    if (premi[p].vinto) {
      testo += `<div>${p.toUpperCase()} → ${premi[p].vincitore}</div>`;
    }
  }

  document.getElementById("tv-vincitore").innerHTML = testo;

  const tg = document.getElementById("tv-giocatori");
  tg.innerHTML = "";
  giocatori.forEach(g => {
    tg.innerHTML += `<div>${g.nome}: ${g.premi.join(", ") || "-"}</div>`;
  });
}