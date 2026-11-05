import "./appNavigation.css";

const PAGINAS = [
  ["start", "Start"],
  ["transacties", "Transacties"],
  ["budgetten", "Budgetten"],
  ["sparen", "Sparen"],
  ["uitloggen", "Uitloggen"],
];

export default function AppNavigation({ actievePagina, uitgeschakeld, onNavigeren }) {
  return (
    <nav className="app-navigatie" aria-label="Hoofdnavigatie">
      {PAGINAS.map(([pagina, label]) => (
        <button
          key={pagina}
          type="button"
          className={actievePagina === pagina ? "actief" : ""}
          aria-current={actievePagina === pagina ? "page" : undefined}
          disabled={uitgeschakeld}
          onClick={() => onNavigeren(pagina)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
