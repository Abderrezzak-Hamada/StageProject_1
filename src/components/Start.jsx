import { useState } from "react";
import "./start.css";
 
const MAANDEN = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December",
];
 
// Voorbeelddata per maand ("jaar-maandindex", 0 = januari). Later vervang je dit door localStorage.
const DATA = {
  "2026-7": {
    inkomsten: 1100,
    uitgaven: 690.2,
    budgetten: [
      { naam: "Boodschappen", besteed: 150, max: 200 },
      { naam: "Uitgaan", besteed: 60, max: 100 },
      { naam: "Vervoer", besteed: 48, max: 60 },
    ],
    transacties: [
      { naam: "Boodschappen", dag: "29 aug", bedrag: -31.2 },
      { naam: "Uitgaan", dag: "22 aug", bedrag: -25 },
      { naam: "Vervoer", dag: "15 aug", bedrag: -12 },
      { naam: "Studiefinanciering", dag: "1 aug", bedrag: 450 },
      { naam: "Wonen", dag: "1 aug", bedrag: -380 },
    ],
  },
  "2026-8": {
    inkomsten: 1250,
    uitgaven: 810.5,
    budgetten: [
      { naam: "Boodschappen", besteed: 185, max: 200 },
      { naam: "Uitgaan", besteed: 112, max: 100 },
      { naam: "Vervoer", besteed: 40, max: 60 },
    ],
    transacties: [
      { naam: "Uitgaan", dag: "27 sep", bedrag: -42.5 },
      { naam: "Boodschappen", dag: "24 sep", bedrag: -56.8 },
      { naam: "Vervoer", dag: "10 sep", bedrag: -20 },
      { naam: "Studiefinanciering", dag: "1 sep", bedrag: 450 },
      { naam: "Wonen", dag: "1 sep", bedrag: -380 },
    ],
  },
  "2026-9": {
    inkomsten: 1150,
    uitgaven: 737.7,
    budgetten: [
      { naam: "Boodschappen", besteed: 120, max: 200 },
      { naam: "Uitgaan", besteed: 85, max: 100 },
      { naam: "Vervoer", besteed: 64, max: 60 },
    ],
    transacties: [
      { naam: "Boodschappen", dag: "5 okt", bedrag: -23.4 },
      { naam: "Uitgaan", dag: "4 okt", bedrag: -18 },
      { naam: "Vervoer", dag: "3 okt", bedrag: -12.5 },
      { naam: "Studiefinanciering", dag: "1 okt", bedrag: 450 },
      { naam: "Wonen", dag: "1 okt", bedrag: -380 },
    ],
  },
  "2026-10": {
    inkomsten: 450,
    uitgaven: 380,
    budgetten: [
      { naam: "Boodschappen", besteed: 0, max: 200 },
      { naam: "Uitgaan", besteed: 0, max: 100 },
      { naam: "Vervoer", besteed: 0, max: 60 },
    ],
    transacties: [
      { naam: "Studiefinanciering", dag: "1 nov", bedrag: 450 },
      { naam: "Wonen", dag: "1 nov", bedrag: -380 },
    ],
  },
};
 
const euro = (n, cijfers = 2) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cijfers,
    maximumFractionDigits: cijfers,
  }).format(n);
 
function balkKleur(besteed, max) {
  const pct = besteed / max;
  if (pct > 1) return "rood";
  if (pct >= 0.8) return "oranje";
  return "blauw";
}
 
export default function Start({ onNaarTransactie, onNaarUitloggen }) {
  const [jaar, setJaar] = useState(2026);
  const [maand, setMaand] = useState(9); // 0 = januari, 9 = oktober
 
  const data = DATA[`${jaar}-${maand}`] || {
    budgetten: [],
    transacties: [],
    inkomsten: 0,
    uitgaven: 0,
  };
  const saldo = data.inkomsten - data.uitgaven;
 
  function verschuif(stap) {
    const nieuw = new Date(jaar, maand + stap, 1);
    setJaar(nieuw.getFullYear());
    setMaand(nieuw.getMonth());
  }
 
  function handleLogout(e) {
    e.preventDefault();
    onNaarUitloggen?.();
  }
 
  return (
    <div className="start">
      <header className="start-kop">
        <button className="maand-knop" onClick={() => verschuif(-1)} aria-label="Vorige maand">
          &lt;
        </button>
        <h1>{MAANDEN[maand]} {jaar}</h1>
        <button className="maand-knop" onClick={() => verschuif(1)} aria-label="Volgende maand">
          &gt;
        </button>
      </header>
 
      <main className="start-inhoud">
        <section className="kaart saldo-kaart">
          <p className="label">Nog te besteden / saldo</p>
          <p className="saldo">{euro(saldo)}</p>
          <div className="saldo-vakken">
            <div className="vak">
              <span>Inkomsten</span>
              <strong>{euro(data.inkomsten)}</strong>
            </div>
            <div className="vak">
              <span>Uitgaven</span>
              <strong>{euro(data.uitgaven)}</strong>
            </div>
          </div>
        </section>
 
        <section className="kaart">
          <div className="kaart-kop">
            <h2>Budgetten</h2>
            <a href="#budgetten">Alles</a>
          </div>
          {data.budgetten.length === 0 && <p className="leeg">Nog geen budgetten deze maand.</p>}
          {data.budgetten.map((b) => (
            <div className="budget" key={b.naam}>
              <div className="budget-rij">
                <span>{b.naam}</span>
                <span>{euro(b.besteed, 0)} van {euro(b.max, 0)}</span>
              </div>
              <div className="balk">
                <div
                  className={`balk-vulling ${balkKleur(b.besteed, b.max)}`}
                  style={{ width: `${Math.min(100, (b.besteed / b.max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </section>
 
        <section className="kaart">
          <div className="kaart-kop">
            <h2>Laatste 5 transacties</h2>
            <a href="#transacties">Alle</a>
          </div>
          {data.transacties.length === 0 && <p className="leeg">Nog geen transacties deze maand.</p>}
          <ul className="transacties">
            {data.transacties.slice(0, 5).map((t, i) => (
              <li key={i}>
                <span>{t.naam} · {t.dag}</span>
                <strong>
                  {t.bedrag < 0 ? "–" : "+"} {euro(Math.abs(t.bedrag))}
                </strong>
              </li>
            ))}
          </ul>
        </section>
 
        <div className="knop-rij">
          <button className="knop-primair" onClick={onNaarTransactie}>
            + Transactie
          </button>
        </div>
      </main>
 
      <nav className="onderbalk">
        <a href="#start" className="actief">Start</a>
        <a href="#transacties">Transacties</a>
        <a href="#budgetten">Budgetten</a>
        <a href="#sparen">Sparen</a>
        <a href="#uitloggen" onClick={handleLogout}>Uitloggen</a>
      </nav>
    </div>
  );
}