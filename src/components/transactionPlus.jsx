import { useState } from "react";
import "./transaction.css";

const vandaag = () => new Date().toLocaleDateString("sv-SE"); // JJJJ-MM-DD
const mooieDatum = (iso) =>
  iso
    ? new Date(iso + "T00:00:00").toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Kies een datum";
const naarCenten = (tekst) => {
  const getal = parseFloat(tekst.replace(",", "."));
  return Number.isFinite(getal) ? Math.round(getal * 100) : 0; // N05: centen als geheel getal
};

function Veld({ id, label, fout, children }) {
  return (
    <div className="tv-veld">
      <label htmlFor={id}>{label}</label>
      {children}
      {fout && (
        <p className="tv-fout" id={`${id}-fout`} role="alert">
          {fout}
        </p>
      )}
    </div>
  );
}

export default function TransactieToevoegen({
  categorieen = ["Boodschappen", "Wonen", "Vervoer", "Uitgaan", "Abonnementen"],
  beginwaarden = {},
  toonFoutenMeteen = false,
  onOpslaan,
  onAnnuleren,
}) {
  const [type, setType] = useState(beginwaarden.type ?? "uitgave");
  const [bedrag, setBedrag] = useState(beginwaarden.bedrag ?? "");
  const [categorie, setCategorie] = useState(beginwaarden.categorie ?? "");
  const [datum, setDatum] = useState(beginwaarden.datum ?? vandaag());
  const [omschrijving, setOmschrijving] = useState(beginwaarden.omschrijving ?? "");
  const [vasteLast, setVasteLast] = useState(beginwaarden.vasteLast ?? false);
  const [verzocht, setVerzocht] = useState(toonFoutenMeteen);
  const [bezig, setBezig] = useState(false);
  const [serverFout, setServerFout] = useState("");

  const centen = naarCenten(bedrag);
  const fouten = {
    bedrag: centen > 0 ? "" : "Vul een bedrag in dat groter is dan 0",
    categorie: categorie ? "" : "Kies een categorie",
    datum: datum ? "" : "Kies een datum",
  };
  const fout = (naam) => (verzocht ? fouten[naam] : "");
  const aria = (naam) => ({
    "aria-invalid": fout(naam) ? "true" : undefined,
    "aria-describedby": fout(naam) ? `${naam}-fout` : undefined,
  });
  const klasse = (naam) => `tv-invoer${fout(naam) ? " tv-invoer--fout" : ""}`;

  async function handleSubmit(e) {
    e.preventDefault();
    setVerzocht(true);
    if (Object.values(fouten).some(Boolean)) return;
    setBezig(true);
    setServerFout("");
    try {
      await onOpslaan?.({ type, bedragInCenten: centen, categorie, datum, omschrijving, vasteLast });
    } catch {
      setServerFout("Opslaan is niet gelukt. Controleer je verbinding en probeer het opnieuw.");
      setBezig(false);
    }
  }

  return (
    <main className="tv-pagina">
      <div className="tv">
        <header className="tv-kop">
          <button type="button" className="tv-terug" aria-label="Terug" onClick={onAnnuleren}>
            &lt;
          </button>
          <h1>Transactie toevoegen</h1>
        </header>

        <form className="tv-formulier" onSubmit={handleSubmit} noValidate>
          <div className="tv-type">
            {["uitgave", "inkomst"].map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={type === t}
                className={type === t ? "tv-type--actief" : ""}
                onClick={() => setType(t)}
              >
                {t === "uitgave" ? "Uitgave" : "Inkomst"}
              </button>
            ))}
          </div>

          <Veld id="bedrag" label="Bedrag" fout={fout("bedrag")}>
            <div className={`${klasse("bedrag")} tv-bedrag`}>
              <span aria-hidden="true">€</span>
              <input
                id="bedrag"
                inputMode="decimal"
                placeholder="0,00"
                value={bedrag}
                onChange={(e) => setBedrag(e.target.value.replace(/[^\d,]/g, ""))}
                {...aria("bedrag")}
              />
            </div>
          </Veld>

          <Veld id="categorie" label="Categorie" fout={fout("categorie")}>
            <select
              id="categorie"
              className={klasse("categorie")}
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
              {...aria("categorie")}
            >
              <option value="" hidden>
                Kies een categorie ▾
              </option>
              {categorieen.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Veld>

          <Veld id="datum" label="Datum" fout={fout("datum")}>
            <div className={`${klasse("datum")} tv-datum`}>
              <span>{mooieDatum(datum)}</span>
              <input
                id="datum"
                type="date"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                onClick={(e) => e.target.showPicker?.()}
                {...aria("datum")}
              />
            </div>
          </Veld>

          <Veld id="omschrijving" label="Omschrijving (optioneel)">
            <input
              id="omschrijving"
              className="tv-invoer"
              placeholder="Bijv. lunch"
              value={omschrijving}
              onChange={(e) => setOmschrijving(e.target.value)}
            />
          </Veld>

          <div className="tv-vast">
            <input
              id="vastelast"
              type="checkbox"
              checked={vasteLast}
              onChange={(e) => setVasteLast(e.target.checked)}
            />
            <label htmlFor="vastelast">Vaste last (elke maand)</label>
          </div>

          {serverFout && (
            <p className="tv-fout tv-fout--blok" role="alert">
              {serverFout}
            </p>
          )}

          <button type="submit" className="tv-knop tv-knop--primair" disabled={bezig}>
            {bezig ? "Bezig met opslaan…" : "Opslaan"}
          </button>
          <button type="button" className="tv-knop tv-knop--rand" onClick={onAnnuleren} disabled={bezig}>
            Annuleren
          </button>
        </form>
      </div>
    </main>
  );
}