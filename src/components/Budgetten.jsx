import { useEffect, useState } from "react";
import "./budgetten.css";

const MAANDEN = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December",
];

const OPSLAG_BUDGETTEN = "budgetten";

const BEGINDATA = {
  "2026-9": [
    { naam: "Boodschappen", besteed: 120, max: 200 },
    { naam: "Uitgaan", besteed: 85, max: 100 },
    { naam: "Vervoer", besteed: 64, max: 60 },
    { naam: "Abonnementen", besteed: 15, max: 30 },
    { naam: "Kleding", besteed: 0, max: 40 },
  ],
};

function laad(sleutel, standaard) {
  try {
    const ruw = localStorage.getItem(sleutel);
    return ruw ? JSON.parse(ruw) : standaard;
  } catch {
    return standaard;
  }
}

function bewaar(sleutel, waarde) {
  try {
    localStorage.setItem(sleutel, JSON.stringify(waarde));
  } catch {
  }
}

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
  if (pct > 1) return ` · ${euro(b.besteed - b.max)} overschreden`;
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

const hoofdletter = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Budgetten({
  onNaarStart,
  onNaarTransacties,
  onNaarSparen,
  onNaarUitloggen,
}) {
  const [jaar, setJaar] = useState(2026);
  const [maand, setMaand] = useState(9);
  const [alleBudgetten, setAlleBudgetten] = useState(() => laad(OPSLAG_BUDGETTEN, BEGINDATA));

  const [toonFormulier, setToonFormulier] = useState(false);
  const [bewerkt, setBewerkt] = useState(null);
  const [naam, setNaam] = useState("");
  const [bedrag, setBedrag] = useState("");
  const [besteedInvoer, setBesteedInvoer] = useState("");
  const [fout, setFout] = useState("");
  const [bericht, setBericht] = useState("");
  const [teVerwijderen, setTeVerwijderen] = useState(null);
  const [toevoegenAan, setToevoegenAan] = useState(null);
  const [toevoegBedrag, setToevoegBedrag] = useState("");
  const [toevoegFout, setToevoegFout] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    bewaar(OPSLAG_BUDGETTEN, alleBudgetten);
  }, [alleBudgetten]);

  useEffect(() => {
    if (!menuOpen) return;
    const sluit = (e) => {
      const buiten = e.type === "keydown" ? e.key === "Escape" : !e.target.closest(".budget-menu");
      if (buiten) setMenuOpen(null);
    };
    document.addEventListener("mousedown", sluit);
    document.addEventListener("keydown", sluit);
    return () => {
      document.removeEventListener("mousedown", sluit);
      document.removeEventListener("keydown", sluit);
    };
  }, [menuOpen]);

  const sleutel = `${jaar}-${maand}`;
  const opgeslagen = alleBudgetten[sleutel] || [];

  const budgetten = opgeslagen;

  const melding = waarschuwing(budgetten);

  const volgende = new Date(jaar, maand + 1, 1);
  const volgendeSleutel = `${volgende.getFullYear()}-${volgende.getMonth()}`;
  const volgendeNaam = MAANDEN[volgende.getMonth()].toLowerCase();

  function sluitFormulier() {
    setToonFormulier(false);
    setBewerkt(null);
    setNaam("");
    setBedrag("");
    setBesteedInvoer("");
    setFout("");
  }

  function sluitToevoegen() {
    setToevoegenAan(null);
    setToevoegBedrag("");
    setToevoegFout("");
  }

  function startToevoegen(b) {
    setBericht("");
    setTeVerwijderen(null);
    sluitFormulier();
    setToevoegenAan(b.naam);
    setToevoegBedrag("");
    setToevoegFout("");
  }

  function voegToe(e, b) {
    e.preventDefault();
    const bedragNum = parseFloat(toevoegBedrag.replace(",", "."));
    if (!Number.isFinite(bedragNum) || bedragNum === 0) {
      return setToevoegFout("Vul een bedrag in, bijvoorbeeld 25 of 12,50.");
    }
    const nieuw = Math.round((b.besteed + bedragNum) * 100) / 100;
    if (nieuw < 0) {
      return setToevoegFout(`Je kunt maximaal ${euro(b.besteed, 2)} aftrekken.`);
    }
    setAlleBudgetten({
      ...alleBudgetten,
      [sleutel]: opgeslagen.map((x) => (x.naam === b.naam ? { ...x, besteed: nieuw } : x)),
    });
    setBericht(
      bedragNum > 0
        ? `${euro(bedragNum, 2)} toegevoegd aan ${b.naam}.`
        : `${euro(-bedragNum, 2)} afgetrokken van ${b.naam}.`
    );
    sluitToevoegen();
  }

  function verschuif(stap) {
    const nieuw = new Date(jaar, maand + stap, 1);
    setJaar(nieuw.getFullYear());
    setMaand(nieuw.getMonth());
    sluitFormulier();
    sluitToevoegen();
    setMenuOpen(null);
    setTeVerwijderen(null);
    setBericht("");
  }

  function startNieuw() {
    setBericht("");
    setMenuOpen(null);
    sluitToevoegen();
    setTeVerwijderen(null);
    setBewerkt(null);
    setNaam("");
    setBedrag("");
    setBesteedInvoer("");
    setFout("");
    setToonFormulier(true);
  }

  function startBewerken(b) {
    setBericht("");
    sluitToevoegen();
    setTeVerwijderen(null);
    setBewerkt(b.naam);
    setNaam(b.naam);
    setBedrag(String(b.max).replace(".", ","));
    setBesteedInvoer(String(b.besteed).replace(".", ","));
    setFout("");
    setToonFormulier(true);
  }

  function opslaan(e) {
    e.preventDefault();
    const schoneNaam = naam.trim();
    const max = parseFloat(bedrag.replace(",", "."));

    if (!schoneNaam) return setFout("Vul een categorie in.");
    if (!Number.isFinite(max) || max <= 0) return setFout("Vul een bedrag groter dan 0 in.");

    const besteedTekst = besteedInvoer.trim();
    const besteed = besteedTekst === "" ? 0 : parseFloat(besteedTekst.replace(",", "."));
    if (!Number.isFinite(besteed) || besteed < 0) {
      return setFout("Al besteed moet 0 of meer zijn.");
    }

    const klein = schoneNaam.toLowerCase();
    let nieuweLijst;
    let tekst;

    if (bewerkt) {
      const botstMetAndere = opgeslagen.some(
        (b) => b.naam !== bewerkt && b.naam.toLowerCase() === klein
      );
      if (botstMetAndere) return setFout(`Er bestaat al een budget voor ${schoneNaam}.`);
      nieuweLijst = opgeslagen.map((b) =>
        b.naam === bewerkt ? { ...b, naam: schoneNaam, max, besteed } : b
      );
      tekst = `Budget ${schoneNaam} bijgewerkt.`;
    } else {
      const bestaand = opgeslagen.some((b) => b.naam.toLowerCase() === klein);
      nieuweLijst = bestaand
        ? opgeslagen.map((b) => (b.naam.toLowerCase() === klein ? { ...b, max, ...(besteedTekst !== "" && { besteed }) } : b))
        : [...opgeslagen, { naam: schoneNaam, besteed, max }];
      tekst = bestaand ? `Budget ${schoneNaam} bijgewerkt.` : `Budget ${schoneNaam} toegevoegd.`;
    }

    setAlleBudgetten({ ...alleBudgetten, [sleutel]: nieuweLijst });
    setBericht(tekst);
    sluitFormulier();
  }

  function verwijder(naamTeVerwijderen) {
    setAlleBudgetten({
      ...alleBudgetten,
      [sleutel]: opgeslagen.filter((b) => b.naam !== naamTeVerwijderen),
    });
    setTeVerwijderen(null);
    setBericht(`Budget ${naamTeVerwijderen} verwijderd.`);
  }

  function overnemen() {
    if ((alleBudgetten[volgendeSleutel] || []).length > 0) {
      setBericht(`${hoofdletter(volgendeNaam)} heeft al budgetten.`);
      return;
    }
    setAlleBudgetten({
      ...alleBudgetten,
      [volgendeSleutel]: opgeslagen.map((b) => ({ ...b, besteed: 0 })),
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
          {budgetten.length === 0 && (
            <p className="leeg">Nog geen budgetten in {MAANDEN[maand].toLowerCase()}. Stel je eerste budget in.</p>
          )}
          {budgetten.map((b) => (
            <div className={`budget${menuOpen === b.naam ? " budget--menu-open" : ""}`} key={b.naam}>
              <div className="budget-rij">
                <span className="budget-naam">{b.naam}</span>
                <span className="budget-bedragen">
                  {euro(b.besteed)} van {euro(b.max)}
                  {statusTekst(b)}
                </span>
                <div className="budget-menu">
                  <button
                    type="button"
                    className="menu-knop"
                    aria-label={`Opties voor ${b.naam}`}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen === b.naam}
                    onClick={() => setMenuOpen(menuOpen === b.naam ? null : b.naam)}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                      <path
                        d="M3 5h14M3 10h14M3 15h14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </button>
                  {menuOpen === b.naam && (
                    <ul className="menu-lijst" role="menu">
                      <li role="none">
                        <button
                          type="button"
                          role="menuitem"
                          className="menu-item"
                          onClick={() => {
                            setMenuOpen(null);
                            startToevoegen(b);
                          }}
                        >
                          Bedrag toevoegen
                        </button>
                      </li>
                      <li role="none">
                        <button
                          type="button"
                          role="menuitem"
                          className="menu-item"
                          onClick={() => {
                            setMenuOpen(null);
                            startBewerken(b);
                          }}
                        >
                          Budget wijzigen
                        </button>
                      </li>
                      <li role="none">
                        <button
                          type="button"
                          role="menuitem"
                          className="menu-item gevaar"
                          onClick={() => {
                            setMenuOpen(null);
                            setBericht("");
                            sluitToevoegen();
                            setTeVerwijderen(b.naam);
                          }}
                        >
                          Verwijderen
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
              <div
                className="balk"
                role="progressbar"
                aria-label={`${b.naam}: ${euro(b.besteed)} van ${euro(b.max)}`}
                aria-valuemin={0}
                aria-valuemax={b.max}
                aria-valuenow={Math.min(b.besteed, b.max)}
              >
                <div
                  className={`balk-vulling ${balkKleur(b.besteed, b.max)}`}
                  style={{ width: `${Math.min(100, (b.besteed / b.max) * 100)}%` }}
                />
              </div>
              {teVerwijderen === b.naam && (
                <div className="budget-acties">
                  <span>Budget {b.naam} verwijderen?</span>
                  <button type="button" className="knop-link gevaar" onClick={() => verwijder(b.naam)}>
                    Ja, verwijder
                  </button>
                  <button type="button" className="knop-link" onClick={() => setTeVerwijderen(null)}>
                    Annuleren
                  </button>
                </div>
              )}
              {toevoegenAan === b.naam && (
                <form className="toevoeg-formulier" onSubmit={(e) => voegToe(e, b)} noValidate>
                  <label htmlFor={`toevoeg-${b.naam}`}>
                    Bedrag (€) voor {b.naam}
                  </label>
                  <div className="toevoeg-rij">
                    <input
                      id={`toevoeg-${b.naam}`}
                      type="text"
                      inputMode="decimal"
                      placeholder="Bijv. 25"
                      value={toevoegBedrag}
                      onChange={(e) => setToevoegBedrag(e.target.value)}
                      aria-invalid={toevoegFout ? "true" : "false"}
                      autoFocus
                    />
                    <button type="submit" className="knop-primair klein">Toevoegen</button>
                    <button type="button" className="knop-secundair klein" onClick={sluitToevoegen}>
                      Annuleren
                    </button>
                  </div>
                  {toevoegFout && <p className="budgetten-fout" role="alert">{toevoegFout}</p>}
                  <p className="toevoeg-hint">Tip: met een min-teken (bijv. -10) trek je een bedrag af.</p>
                </form>
              )}
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
              autoFocus
            />
            <label htmlFor="budget-bedrag">Maximumbedrag (€)</label>
            <input
              id="budget-bedrag"
              type="text"
              inputMode="decimal"
              placeholder="Bijv. 200"
              value={bedrag}
              onChange={(e) => setBedrag(e.target.value)}
              aria-invalid={fout && naam.trim() && !fout.includes("besteed") ? "true" : "false"}
            />
            <label htmlFor="budget-besteed">Al besteed (€)</label>
            <input
              id="budget-besteed"
              type="text"
              inputMode="decimal"
              placeholder="Bijv. 200 (leeg = 0)"
              value={besteedInvoer}
              onChange={(e) => setBesteedInvoer(e.target.value)}
              aria-invalid={fout.includes("besteed") ? "true" : "false"}
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
            <button className="knop-primair" onClick={startNieuw}>
              + Budget instellen
            </button>
            <button
              className="knop-secundair"
              onClick={overnemen}
              disabled={opgeslagen.length === 0}
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