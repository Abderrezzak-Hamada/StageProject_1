import { useState } from "react";
import "./Uitloggen.css";

function Knop({ variant = "primair", children, ...props }) {
  return (
    <button className={`knop knop--${variant}`} {...props}>
      {children}
    </button>
  );
}

export default function Uitloggen({ onUitloggen, onAnnuleren }) {
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  async function handleUitloggen() {
    setBezig(true);
    setFout("");
    try {
      await onUitloggen?.();
    } catch {
      setFout("Uitloggen is niet gelukt. Controleer je verbinding en probeer het opnieuw.");
      setBezig(false);
    }
  }

  return (
    <main className="uitloggen-pagina">
      <div className="uitloggen">
      <header className="uitloggen__kop">
        <h1>Uitloggen</h1>
      </header>

      <section className="uitloggen__inhoud">
        <div className="uitloggen__kaart">
          <h2>Wil je uitloggen?</h2>
          <p>Je kunt later opnieuw inloggen om je budgetten te bekijken.</p>

          {fout && (
            <p className="uitloggen__fout" role="alert">
              {fout}
            </p>
          )}

          <Knop onClick={handleUitloggen} disabled={bezig}>
            {bezig ? "Bezig met uitloggen…" : "Uitloggen"}
          </Knop>
          <Knop variant="rand" onClick={onAnnuleren} disabled={bezig}>
            Annuleren
          </Knop>
        </div>
      </section>
      </div>
    </main>
  );
}