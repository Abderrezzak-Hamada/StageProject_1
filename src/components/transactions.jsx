import { useMemo, useState } from "react";
import "./transactions.css";

const MAANDEN = [
  "Januari",
  "Februari",
  "Maart",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Augustus",
  "September",
  "Oktober",
  "November",
  "December",
];

const euro = (bedrag) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Math.abs(bedrag));

const datumLabel = (datum) =>
  new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
  }).format(new Date(`${datum}T00:00:00`));

function maandKey(jaar, maand) {
  return `${jaar}-${String(maand + 1).padStart(2, "0")}`;
}

export const voorbeeldTransacties = [
  { id: 1, datum: "2026-10-05", omschrijving: "Boodschappen", categorie: "Boodschappen", bedrag: -23.4 },
  { id: 2, datum: "2026-10-04", omschrijving: "Uitgaan", detail: "bioscoop", categorie: "Uitgaan", bedrag: -18 },
  { id: 3, datum: "2026-10-03", omschrijving: "Vervoer", detail: "OV", categorie: "Vervoer", bedrag: -12.5 },
  { id: 4, datum: "2026-10-01", omschrijving: "Studiefinanciering", categorie: "Studiefinanciering", bedrag: 450 },
  { id: 7, datum: "2026-10-01", omschrijving: "Salaris", detail: "bijbaan", categorie: "Salaris", bedrag: 620 },
  { id: 8, datum: "2026-10-01", omschrijving: "Zorgtoeslag", categorie: "Toeslagen", bedrag: 80 },
  { id: 5, datum: "2026-10-01", omschrijving: "Wonen", detail: "huur", categorie: "Wonen", bedrag: -380 },
  { id: 6, datum: "2026-10-01", omschrijving: "Abonnementen", detail: "telefoon", categorie: "Abonnementen", bedrag: -15 },
];

export default function Transacties({
  transacties = voorbeeldTransacties,
  onNaarStart,
  onNaarTransactie,
  onNaarUitloggen,
  onNaarSorteren,
  onBewerken,
  onVerwijderen,
  sorteringen = {},
  initialFilter = "alles",
  onFilterChange,
}) {
  const [jaar, setJaar] = useState(2026);
  const [maand, setMaand] = useState(9);
  const [zoekterm, setZoekterm] = useState("");
  const [filter, setFilter] = useState(initialFilter);
  const zichtbareTransacties = useMemo(() => {
    const maandTransacties = transacties
      .filter((transactie) => transactie.datum.startsWith(maandKey(jaar, maand)))
      .filter((transactie) => {
        const zoek = zoekterm.trim().toLowerCase();
        return !zoek || `${transactie.omschrijving} ${transactie.categorie}`.toLowerCase().includes(zoek);
      })
      .filter((transactie) => {
        if (filter === "inkomsten") return transactie.bedrag > 0;
        if (filter === "uitgaven") return transactie.bedrag < 0;
        if (filter === "categorie") return transactie.categorie !== "";
        return true;
      });

    return [...maandTransacties].sort((a, b) => {
      const sortering = sorteringen[filter] || "nieuwste";
      if (sortering === "hoogste") return b.bedrag - a.bedrag;
      if (sortering === "laagste") return a.bedrag - b.bedrag;
      if (sortering === "categorie") return a.categorie.localeCompare(b.categorie, "nl");
      const verschil = a.datum.localeCompare(b.datum);
      return sortering === "oudste" ? verschil : -verschil;
    });
  }, [filter, maand, sorteringen, transacties, zoekterm, jaar]);

  const totaalInkomsten = zichtbareTransacties
    .filter((transactie) => transactie.bedrag > 0)
    .reduce((totaal, transactie) => totaal + transactie.bedrag, 0);
  const totaalUitgaven = zichtbareTransacties
    .filter((transactie) => transactie.bedrag < 0)
    .reduce((totaal, transactie) => totaal + Math.abs(transactie.bedrag), 0);
  const categorieUitgaven = useMemo(() => {
    const perCategorie = zichtbareTransacties
      .filter((transactie) => transactie.bedrag < 0)
      .reduce((categorieen, transactie) => {
        const categorie = transactie.categorie || "Overig";
        categorieen[categorie] = (categorieen[categorie] || 0) + Math.abs(transactie.bedrag);
        return categorieen;
      }, {});

    return Object.entries(perCategorie)
      .map(([categorie, bedrag]) => ({
        categorie,
        bedrag,
        percentage: totaalUitgaven ? Math.round((bedrag / totaalUitgaven) * 100) : 0,
      }))
      .sort((a, b) => b.bedrag - a.bedrag);
  }, [totaalUitgaven, zichtbareTransacties]);

  function verschuif(stap) {
    const nieuweDatum = new Date(jaar, maand + stap, 1);
    setJaar(nieuweDatum.getFullYear());
    setMaand(nieuweDatum.getMonth());
  }

  return (
    <div className="transacties-pagina">
      <header className="transacties-kop">
        <button type="button" className="transacties-maandknop" onClick={() => verschuif(-1)} aria-label="Vorige maand">
          &lt;
        </button>
        <h1>{MAANDEN[maand]} {jaar}</h1>
        <button type="button" className="transacties-maandknop" onClick={() => verschuif(1)} aria-label="Volgende maand">
          &gt;
        </button>
      </header>

      <main className="transacties-inhoud">
        <label className="zoek-label" htmlFor="transactie-zoekveld">Zoeken</label>
        <input
          id="transactie-zoekveld"
          className="zoekveld"
          type="search"
          placeholder={filter === "categorie" ? "Zoek op categorie" : "Zoek op omschrijving"}
          value={zoekterm}
          onChange={(e) => setZoekterm(e.target.value)}
        />

        <div className="transactie-filters" aria-label="Transactiefilters">
          {[
            ["alles", "Alles"],
            ["inkomsten", "Inkomsten"],
            ["uitgaven", "Uitgaven"],
            ["categorie", "Categorie"],
          ].map(([waarde, label]) => (
            <button
              type="button"
              key={waarde}
              className={filter === waarde ? "filterknop actief" : "filterknop"}
              aria-pressed={filter === waarde}
              onClick={() => {
                setFilter(waarde);
                onFilterChange?.(waarde);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {filter === "inkomsten" && (
          <section className="inkomsten-totaal">
            <span>Totaal inkomsten in {MAANDEN[maand].toLowerCase()}</span>
            <strong>{euro(totaalInkomsten)}</strong>
          </section>
        )}
        {filter === "uitgaven" && (
          <section className="inkomsten-totaal">
            <span>Totaal uitgaven in {MAANDEN[maand].toLowerCase()}</span>
            <strong>{euro(totaalUitgaven)}</strong>
          </section>
        )}

        {filter === "categorie" ? (
          <>
            <section className="categorie-totaal">
              <span>Totale uitgaven in {MAANDEN[maand].toLowerCase()}</span>
              <strong>{euro(totaalUitgaven)}</strong>
            </section>
            <section className="categorie-overzicht" aria-live="polite">
              <header className="categorie-overzicht-kop">
                <h2>Uitgaven per categorie</h2>
                <span>Van totaal</span>
              </header>
              {categorieUitgaven.length === 0 && (
                <p className="transacties-leeg">Geen uitgaven gevonden.</p>
              )}
              {categorieUitgaven.map(({ categorie, bedrag, percentage }) => (
                <article className="categorie-regel" key={categorie}>
                  <div className="categorie-regel-kop">
                    <strong>{categorie}</strong>
                    <span>{euro(bedrag)}</span>
                    <small>{percentage}%</small>
                  </div>
                  <div className="categorie-balk" aria-label={`${percentage}% van totaal`}>
                    <span style={{ width: `${percentage}%` }} />
                  </div>
                </article>
              ))}
            </section>
            <button type="button" className="categorie-beheren">
              Categorieën beheren
            </button>
          </>
        ) : (
          <>
            <div className="transacties-meta">
              <span>{zichtbareTransacties.length} transacties</span>
              <button type="button" onClick={() => onNaarSorteren(filter)}>
                Sorteren
              </button>
            </div>

            <section className="transacties-lijst" aria-live="polite">
              {zichtbareTransacties.length === 0 && (
                <p className="transacties-leeg">Geen transacties gevonden.</p>
              )}
              {zichtbareTransacties.map((transactie) => (
                <article className="transactie-regel" key={transactie.id}>
                  <span className="transactie-datum">{datumLabel(transactie.datum)}</span>
                  <div className="transactie-details">
                    <span>{transactie.omschrijving}{transactie.detail && ` · ${transactie.detail}`}</span>
                    <div className="transactie-bedrag-acties">
                      <strong className={transactie.bedrag >= 0 ? "bedrag positief" : "bedrag"}>
                        {transactie.bedrag >= 0 ? "+" : "-"} {euro(transactie.bedrag)}
                      </strong>
                      <button
                        type="button"
                        className="transactie-bewerken"
                        onClick={() => onBewerken?.(transactie)}
                        aria-label={`${transactie.omschrijving} aanpassen`}
                      >
                        Aanpassen
                      </button>
                      <button
                        type="button"
                        className="transactie-verwijderen"
                        onClick={() => onVerwijderen?.(transactie)}
                        aria-label={`${transactie.omschrijving} verwijderen`}
                      >
                        Verwijderen
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <p className="transacties-hint">Tik op een regel om te wijzigen of te verwijderen.</p>
          </>
        )}
        <div className="transactie-actie">
          <button type="button" className="transactie-toevoegen" onClick={onNaarTransactie}>
            + Transactie
          </button>
        </div>
      </main>

      <nav className="transacties-onderbalk" aria-label="Hoofdnavigatie">
        <button type="button" onClick={onNaarStart}>Start</button>
        <button type="button" className="actief">Transacties</button>
        <button type="button">Budgetten</button>
        <button type="button">Sparen</button>
        <button type="button" onClick={onNaarUitloggen}>Uitloggen</button>
      </nav>
    </div>
  );
}
