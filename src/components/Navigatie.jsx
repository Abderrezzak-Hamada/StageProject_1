import "./navigatie.css";

const ITEMS = [
  { id: "start", label: "Start", prop: "onNaarStart" },
  { id: "transacties", label: "Transacties", prop: "onNaarTransacties" },
  { id: "budgetten", label: "Budgetten", prop: "onNaarBudgetten" },
  { id: "sparen", label: "Sparen", prop: "onNaarSparen" },
  { id: "uitloggen", label: "Uitloggen", prop: "onNaarUitloggen" },
];

// actief: "start" | "transacties" | "budgetten" | "sparen"
// De andere props zijn de functies die je al in App.jsx doorgeeft.
export default function Navigatie({ actief, ...handlers }) {
  return (
    <nav className="onderbalk" aria-label="Hoofdmenu">
      {ITEMS.map(({ id, label, prop }) => (
        <button
          key={id}
          type="button"
          className={"onderbalk-item" + (actief === id ? " actief" : "")}
          aria-current={actief === id ? "page" : undefined}
          onClick={() => handlers[prop]?.()}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
