import { useState } from "react";
import "./categorieenBeheren.css";

export default function CategorieenBeheren({
  categorieen,
  onToevoegen,
  onHernoem,
  onVerwijder,
  onTerug,
}) {
  const [type, setType] = useState("uitgaven");
  const [nieuweNaam, setNieuweNaam] = useState("");
  const [bewerkt, setBewerkt] = useState(null); // oude naam van de categorie die je bewerkt
  const [bewerkTekst, setBewerkTekst] = useState("");
  const [fout, setFout] = useState("");

  const lijst = categorieen[type];

  const bestaatAl = (naam, behalve) =>
    lijst.some(
      (c) => c.toLowerCase() === naam.toLowerCase() && c !== behalve
    );

  function wisselType(nieuwType) {
    setType(nieuwType);
    setBewerkt(null);
    setNieuweNaam("");
    setFout("");
  }

  function handleToevoegen(e) {
    e.preventDefault();
    const naam = nieuweNaam.trim();
    if (!naam) return setFout("Vul een naam in");
    if (bestaatAl(naam)) return setFout("Deze categorie bestaat al");
    onToevoegen(type, naam);
    setNieuweNaam("");
    setFout("");
  }

  function startBewerken(naam) {
    setBewerkt(naam);
    setBewerkTekst(naam);
    setFout("");
  }

  function handleOpslaan(e) {
    e.preventDefault();
    const naam = bewerkTekst.trim();
    if (!naam) return setFout("Vul een naam in");
    if (bestaatAl(naam, bewerkt)) return setFout("Deze categorie bestaat al");
    if (naam !== bewerkt) onHernoem(type, bewerkt, naam);
    setBewerkt(null);
    setFout("");
  }

  function handleVerwijder(naam) {
    if (!window.confirm(`Categorie "${naam}" verwijderen?`)) return;
    onVerwijder(type, naam);
    if (bewerkt === naam) setBewerkt(null);
    setFout("");
  }

  return (
    <div className="cb-pagina">
      <header className="cb-kop">
        <button type="button" className="cb-terug" aria-label="Terug" onClick={onTerug}>
          &lt;
        </button>
        <h1>Categorieën beheren</h1>
      </header>

      <main className="cb-inhoud">
        <div className="cb-type">
          {[
            ["uitgaven", "Uitgaven"],
            ["inkomsten", "Inkomsten"],
          ].map(([waarde, label]) => (
            <button
              key={waarde}
              type="button"
              aria-pressed={type === waarde}
              className={type === waarde ? "actief" : ""}
              onClick={() => wisselType(waarde)}
            >
              {label}
            </button>
          ))}
        </div>

        <form className="cb-toevoegen" onSubmit={handleToevoegen} noValidate>
          <input
            type="text"
            placeholder="Nieuwe categorie"
            aria-label="Nieuwe categorie"
            value={nieuweNaam}
            onChange={(e) => setNieuweNaam(e.target.value)}
            maxLength={30}
          />
          <button type="submit">Toevoegen</button>
        </form>

        {fout && (
          <p className="cb-fout" role="alert">
            {fout}
          </p>
        )}

        <ul className="cb-lijst">
          {lijst.length === 0 && (
            <li className="cb-leeg">Nog geen categorieën.</li>
          )}
          {lijst.map((naam) =>
            bewerkt === naam ? (
              <li key={naam} className="cb-regel">
                <form className="cb-bewerk" onSubmit={handleOpslaan} noValidate>
                  <input
                    type="text"
                    aria-label="Naam van de categorie"
                    value={bewerkTekst}
                    onChange={(e) => setBewerkTekst(e.target.value)}
                    maxLength={30}
                    autoFocus
                  />
                  <button type="submit" className="cb-knop cb-knop--primair">
                    Opslaan
                  </button>
                  <button
                    type="button"
                    className="cb-knop"
                    onClick={() => {
                      setBewerkt(null);
                      setFout("");
                    }}
                  >
                    Annuleren
                  </button>
                </form>
              </li>
            ) : (
              <li key={naam} className="cb-regel">
                <span className="cb-naam">{naam}</span>
                <button type="button" className="cb-knop" onClick={() => startBewerken(naam)}>
                  Wijzig
                </button>
                <button
                  type="button"
                  className="cb-knop cb-knop--gevaar"
                  onClick={() => handleVerwijder(naam)}
                >
                  Verwijder
                </button>
              </li>
            )
          )}
        </ul>

        <p className="cb-hint">
          Bestaande transacties behouden hun categorie als je die verwijdert. Bij wijzigen
          wordt de naam in je transacties ook aangepast.
        </p>
      </main>
    </div>
  );
}
