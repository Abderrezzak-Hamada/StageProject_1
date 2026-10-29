import { useState } from "react";
import "./sortTransactions.css";

const opties = [
  ["nieuwste", "Nieuwste eerst"],
  ["oudste", "Oudste eerst"],
  ["hoogste", "Hoogste bedrag eerst"],
  ["laagste", "Laagste bedrag eerst"],
  ["categorie", "Categorie A–Z"],
];

export default function SortTransactions({ huidigeSortering = "nieuwste", onToepassen, onAnnuleren }) {
  const [sortering, setSortering] = useState(huidigeSortering);
  const gekozenLabel = opties.find(([waarde]) => waarde === sortering)?.[1] || opties[0][1];

  return (
    <div className="sorteren-pagina">
      <header className="sorteren-kop">
        <button type="button" className="sorteren-terug" onClick={onAnnuleren} aria-label="Terug">
          &lt;
        </button>
        <h1>Transacties sorteren</h1>
      </header>

      <main className="sorteren-inhoud">
        <p className="sorteren-uitleg">Kies in welke volgorde je transacties wilt bekijken.</p>

        <fieldset className="sorteren-opties">
          <legend className="visueel-verborgen">Sorteervolgorde</legend>
          {opties.map(([waarde, label]) => (
            <label className="sorteren-optie" key={waarde}>
              <input
                type="radio"
                name="sortering"
                value={waarde}
                checked={sortering === waarde}
                onChange={() => setSortering(waarde)}
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>

        <section className="sorteren-voorbeeld" aria-live="polite">
          <span>Voorbeeldweergave</span>
          <strong>{gekozenLabel}</strong>
          <small>Je keuze blijft actief totdat je deze wijzigt.</small>
        </section>

        <button type="button" className="sorteren-toepassen" onClick={() => onToepassen(sortering)}>
          Sortering toepassen
        </button>
        <button type="button" className="sorteren-annuleren" onClick={onAnnuleren}>
          Annuleren
        </button>
      </main>
    </div>
  );
}
