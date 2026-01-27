console.log("APP.JS CARICATO OK");

let role = null;
let partitaAvviata = false;
let numeriEstratti = [];
let premioCorrente = "AMBO";

const premi = ["AMBO","TERNO","QUATERNA","CINQUINA","TOMBOLA"];
const giocatori = [
  { nome:"Mario", premi:[], cartelle:2 },
  { nome:"Luigi", premi:[], cartelle:1 },
  { nome:"Anna", premi:[], cartelle:3 }
];

function setRole(r){
  role = r;
  document.getElementById("roleSelect").classList.add("hidden");
  document.getElementById(r).classList.remove("hidden");
  console.log("Ruolo selezionato:", r);

  if(r==="tv"){
    document.documentElement.requestFullscreen().catch(()=>{});
    renderTV();
  }
  if(r==="chiamante"){
    renderPremi();
    renderGiocatori();
  }
}

function startGame(){
  partitaAvviata = true;
  premioCorrente = premi[0];
  updateTVPremio();
}

function extractNumber(){
  if(!partitaAvviata) return;
  let n;
  do { n = Math.floor(Math.random()*90)+1 } while(numeriEstratti.includes(n));
  numeriEstratti.push(n);
}

function assegnaPremio(nome){
  const g = giocatori.find(x=>x.nome===nome);
  g.premi.push(premioCorrente);

  mostraVincitaTV(nome);

  const idx = premi.indexOf(premioCorrente);
  if(idx < premi.length-1){
    premioCorrente = premi[idx+1];
    setTimeout(updateTVPremio, 4000);
  } else {
    setTimeout(()=> {
      document.getElementById("tvPremio").innerText="FINE PARTITA";
    },4000);
  }

  document.getElementById(premioCorrente)?.classList.add("sbarrato");
  renderGiocatori();
  renderTV();
}

function renderPremi(){
  const div = document.getElementById("premi");
  div.innerHTML="";
  premi.forEach(p=>{
    const b=document.createElement("button");
    b.id=p;
    b.innerText=p;
    b.onclick=()=>premioCorrente=p;
    div.appendChild(b);
  });
}

function renderGiocatori(){
  const div=document.getElementById("giocatori");
  div.innerHTML="";
  giocatori.forEach(g=>{
    const b=document.createElement("button");
    b.innerText=g.nome+" ("+g.premi.join(", ")+")";
    b.onclick=()=>assegnaPremio(g.nome);
    div.appendChild(b);
  });
}

function renderTV(){
  const div=document.getElementById("tvGiocatori");
  div.innerHTML="";
  giocatori.forEach(g=>{
    const d=document.createElement("div");
    d.innerText=g.nome+" → "+g.premi.join(", ");
    div.appendChild(d);
  });
}

function updateTVPremio(){
  const el=document.getElementById("tvPremio");
  el.className="premio-attivo";
  el.innerText=premioCorrente;
}

function mostraVincitaTV(nome){
  const el=document.getElementById("tvPremio");
  el.className="premio-vinto";
  el.innerText=`${premioCorrente} di ${nome}!`;
}

function resetGame(){
  numeriEstratti=[];
  premioCorrente="AMBO";
  partitaAvviata=false;
  giocatori.forEach(g=>g.premi=[]);
  updateTVPremio();
  renderGiocatori();
  renderTV();
}