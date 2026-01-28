const db = firebase.database();
const statoRef = db.ref("stato");

const btnChiamante = document.getElementById("btnChiamante");
const btnTV = document.getElementById("btnTV");
const btnGiocatore = document.getElementById("btnGiocatore");
const schermo = document.getElementById("schermo");

/* ------------------ CLICK ------------------ */

btnChiamante.onclick = () => {
    statoRef.set({ ruolo: "chiamante" });
};

btnTV.onclick = () => {
    statoRef.set({ ruolo: "tv" });
};

btnGiocatore.onclick = () => {
    statoRef.set({ ruolo: "giocatore" });
};

/* ------------------ SINCRONIZZAZIONE ------------------ */

statoRef.on("value", (snap) => {
    const stato = snap.val();
    if (!stato) return;

    if (stato.ruolo === "chiamante") {
        schermo.innerHTML = `
            <h2>CHIAMANTE</h2>
            <p>Qui controllerai la partita</p>
        `;
    }

    if (stato.ruolo === "tv") {
        schermo.innerHTML = `
            <h2>TOMBOLA</h2>
            <p>Schermo TV sincronizzato</p>
        `;
    }

    if (stato.ruolo === "giocatore") {
        schermo.innerHTML = `
            <h2>GIOCATORE</h2>
            <p>In attesa delle cartelle</p>
        `;
    }
});