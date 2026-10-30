import { useState } from "react";
import "./budgetten.css";

const MAANDEN = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December",
];

// Voorbeelddata per maand ("jaar-maandindex", 0 = januari). Later vervang je dit door localStorage.
const BEGINDATA = {
  "2026-9": [
    { naam: "Boodschappen", besteed: 120, max: 200 },
    { naam: "Uitgaan", besteed: 85, max: 100 },
    { naam: "Vervoer", besteed: 64, max: 60 },
    { naam: "Abonnementen", besteed: 15, max: 30 },
    { naam: "Kleding", besteed: 0, max: 40 },
  ],
};

const euro = (n, cijfers = 0) =>
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

function statusTekst(b) {
  const pct = b.besteed / b.max;
  if (pct > 1) return " · overschreden";
  if (pct >= 0.8) return ` · ${Math.round(pct * 100)}%: bijna op`;
  if (b.besteed > b.max * 0.5) return ` · over ${euro(b.max - b.besteed)}`;
  return "";
}

function lijstTekst(namen) {
  return namen.length > 1
    ? `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`
    : namen[0];
}

function waarschuwing(budgetten) {
  const over = budgetten.filter((b) => b.besteed > b.max).map((b) => b.naam);
  const bijna = budgetten
    .filter((b) => b.besteed <= b.max && b.besteed / b.max >= 0.8)
    .map((b) => b.naam);
  const delen = [];
  if (over.length) delen.push(`${lijstTekst(over)} ${over.length > 1 ? "zijn" : "is"} overschreden`);
  if (bijna.length) delen.push(`${lijstTekst(bijna)} ${bijna.length > 1 ? "zijn" : "is"} bijna op`);
  return delen.length ? `Let op: ${delen.join(" en ")}.` : "";
}

export default function Budgetten({
  onNaarStart,
  onNaarTransacties,
  onNaarSparen,
  onNaarUitloggen,
}) {
  const [jaar, setJaar] = useState(2026);
  const [maand, setMaand] = useState(9); // 0 = januari, 9 = oktober
  const [alleBudgetten, setAlleBudgetten] = useState(BEGINDATA);

  const [toonFormulier, setToonFormulier] = useState(false);
  const [naam, setNaam] = useState("");
  const [bedrag, setBedrag] = useState("");
  const [fout, setFout] = useState("");
  const [bericht, setBericht] = useState("");

  const sleutel = `${jaar}-${maand}`;
  const budgetten = alleBudgetten[sleutel] || [];
  const melding = waarschuwing(budgetten);

  const volgende = new Date(jaar, maand + 1, 1);
  const volgendeSleutel = `${volgende.getFullYear()}-${volgende.getMonth()}`;
  const volgendeNaam = MAANDEN[volgende.getMonth()].toLowerCase();

  function sluitFormulier() {
    setToonFormulier(false);
    setNaam("");
    setBedrag("");
    setFout("");
  }

  function verschuif(stap) {
    const nieuw = new Date(jaar, maand + stap, 1);
    setJaar(nieuw.getFullYear());
    setMaand(nieuw.getMonth());
    sluitFormulier();
    setBericht("");
  }

  function opslaan(e) {
    e.preventDefault();
    const schoneNaam = naam.trim();
    const max = parseFloat(bedrag.replace(",", "."));

    if (!schoneNaam) return setFout("Vul een categorie in.");
    if (!Number.isFinite(max) || max <= 0) return setFout("Vul een bedrag groter dan 0 in.");

    const bestaand = budgetten.some((b) => b.naam.toLowerCase() === schoneNaam.toLowerCase());
    const nieuweLijst = bestaand
      ? budgetten.map((b) =>
          b.naam.toLowerCase() === schoneNaam.toLowerCase() ? { ...b, max } : b
        )
      : [...budgetten, { naam: schoneNaam, besteed: 0, max }];

    setAlleBudgetten({ ...alleBudgetten, [sleutel]: nieuweLijst });
    setBericht(bestaand ? `Budget ${schoneNaam} bijgewerkt.` : `Budget ${schoneNaam} toegevoegd.`);
    sluitFormulier();
  }

  function overnemen() {
    if ((alleBudgetten[volgendeSleutel] || []).length > 0) {
      setBericht(`${volgendeNaam[0].toUpperCase() + volgendeNaam.slice(1)} heeft al budgetten.`);
      return;
    }
    setAlleBudgetten({
      ...alleBudgetten,
      [volgendeSleutel]: budgetten.map((b) => ({ ...b, besteed: 0 })),
    });
    setBericht(`Budgetten overgenomen naar ${volgendeNaam}.`);
  }

  function handleLogout(e) {
    e.preventDefault();
    onNaarUitloggen?.();
  }

  function nav(fn) {
    return (e) => {
      e.preventDefault();
      fn?.();
    };
  }

  return (
    <div className="budgetten">
      <header className="budgetten-kop">
        <button className="maand-knop" onClick={() => verschuif(-1)} aria-label="Vorige maand">
          &lt;
        </button>
        <h1>{MAANDEN[maand]} {jaar}</h1>
        <button className="maand-knop" onClick={() => verschuif(1)} aria-label="Volgende maand">
          &gt;
        </button>
      </header>

      <main className="budgetten-inhoud">
        {melding && <p className="budgetten-melding" role="alert">{melding}</p>}

        <section className="kaart">
          {budgetten.length === 0 && <p className="leeg">Nog geen budgetten deze maand.</p>}
          {budgetten.map((b) => (
            <div className="budget" key={b.naam}>
              <div className="budget-rij">
                <span>{b.naam}</span>
                <span>
                  {euro(b.besteed)} van {euro(b.max)}
                  {statusTekst(b)}
                </span>
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

        {toonFormulier && (
          <form className="kaart budgetten-formulier" onSubmit={opslaan} noValidate>
            <label htmlFor="budget-naam">Categorie</label>
            <input
              id="budget-naam"
              type="text"
              placeholder="Bijv. Boodschappen"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              aria-invalid={fout && !naam.trim() ? "true" : "false"}
            />
            <label htmlFor="budget-bedrag">Maximumbedrag (€)</label>
            <input
              id="budget-bedrag"
              type="text"
              inputMode="decimal"
              placeholder="Bijv. 200"
              value={bedrag}
              onChange={(e) => setBedrag(e.target.value)}
              aria-invalid={fout && naam.trim() ? "true" : "false"}
            />
            {fout && <p className="budgetten-fout" role="alert">{fout}</p>}
            <div className="knop-rij">
              <button type="submit" className="knop-primair">Opslaan</button>
              <button type="button" className="knop-secundair" onClick={sluitFormulier}>
                Annuleren
              </button>
            </div>
          </form>
        )}

        {bericht && <p className="budgetten-bericht" role="status">{bericht}</p>}

        {!toonFormulier && (
          <div className="knop-rij">
            <button
              className="knop-primair"
              onClick={() => {
                setBericht("");
                setToonFormulier(true);
              }}
            >
              + Budget instellen
            </button>
            <button
              className="knop-secundair"
              onClick={overnemen}
              disabled={budgetten.length === 0}
            >
              Budgetten overnemen naar {volgendeNaam}
            </button>
          </div>
        )}
      </main>

      <nav className="onderbalk">
        <a href="#start" onClick={nav(onNaarStart)}>Start</a>
        <a href="#transacties" onClick={nav(onNaarTransacties)}>Transacties</a>
        <a href="#budgetten" className="actief">Budgetten</a>
        <a href="#sparen" onClick={nav(onNaarSparen)}>Sparen</a>
        <a href="#uitloggen" onClick={handleLogout}>Uitloggen</a>
      </nav>
    </div>
  );
}