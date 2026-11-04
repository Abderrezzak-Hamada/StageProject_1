
import { useState } from "react";
import { login, logout, registreer } from "./auth.js";
import Login from "./components/Login.jsx";
import SignUp from "./components/signup.jsx";
import Start from "./components/Start.jsx";
import AddTransaction from "./components/addTransaction.jsx";
import Transactions, { voorbeeldTransacties } from "./components/transactions.jsx";
import SortTransactions from "./components/SortTransactions.jsx";
import CategorieenBeheren from "./components/CategorieenBeheren.jsx";
import Budgetten from "./components/Budgetten.jsx";
import Uitloggen from "./components/Uitloggen.jsx";
import Sparen from "./components/Sparen.jsx";
 
const CATEGORIEEN_KEY = "categorieen";
const STANDAARD_CATEGORIEEN = {
  uitgaven: ["Boodschappen", "Wonen", "Vervoer", "Uitgaan", "Abonnementen"],
  inkomsten: ["Salaris", "Studiefinanciering", "Toeslagen", "Freelance", "Overig"],
};
 
function laadCategorieen() {
  try {
    const opgeslagen = JSON.parse(localStorage.getItem(CATEGORIEEN_KEY));
    if (Array.isArray(opgeslagen?.uitgaven) && Array.isArray(opgeslagen?.inkomsten)) {
      return opgeslagen;
    }
  } catch {
    // ongeldige opslag: gebruik de standaardlijst
  }
  return STANDAARD_CATEGORIEEN;
}
 
export default function App() {
  // Altijd starten op de loginpagina
  const [pagina, setPagina] = useState("login");
  const [transacties, setTransacties] = useState(voorbeeldTransacties);
  const [transactiesFilter, setTransactiesFilter] = useState("alles");
  const [sorteringen, setSorteringen] = useState({});
  const [sorteerFilter, setSorteerFilter] = useState("alles");
  const [categorieen, setCategorieen] = useState(laadCategorieen);
 
  function slaCategorieenOp(nieuw) {
    setCategorieen(nieuw);
    try {
      localStorage.setItem(CATEGORIEEN_KEY, JSON.stringify(nieuw));
    } catch {
      // opslaan mislukt: de wijziging blijft wel zichtbaar tijdens deze sessie
    }
  }
 
  function handleCategorieToevoegen(type, naam) {
    slaCategorieenOp({ ...categorieen, [type]: [...categorieen[type], naam] });
  }
 
  function handleCategorieHernoem(type, oudeNaam, nieuweNaam) {
    slaCategorieenOp({
      ...categorieen,
      [type]: categorieen[type].map((c) => (c === oudeNaam ? nieuweNaam : c)),
    });
    // Pas ook bestaande transacties van dit type aan
    setTransacties((huidige) =>
      huidige.map((t) => {
        const hoortBijType = type === "inkomsten" ? t.bedrag > 0 : t.bedrag < 0;
        if (!hoortBijType || t.categorie !== oudeNaam) return t;
        return {
          ...t,
          categorie: nieuweNaam,
          omschrijving: t.omschrijving === oudeNaam ? nieuweNaam : t.omschrijving,
        };
      })
    );
  }
 
  function handleCategorieVerwijder(type, naam) {
    slaCategorieenOp({
      ...categorieen,
      [type]: categorieen[type].filter((c) => c !== naam),
    });
  }
 
  function handleLogin() {
    setPagina("start");
  }
 
  function handleRegister({ email, password }) {
    const registratie = registreer(email, password);
    if (!registratie.ok) return registratie;
 
    const loginResultaat = login(email, password);
    if (!loginResultaat.ok) return loginResultaat;
 
    handleLogin();
    return { ok: true };
  }
 
  function handleUitloggen() {
    logout();
    setPagina("login");
  }
 
  if (pagina === "signup") {
    return (
      <SignUp
        onRegister={handleRegister}
        onLogin={() => setPagina("login")}
      />
    );
  }
 
  if (pagina === "start") {
    return (
      <Start
        onNaarBudgetten={() => setPagina("budgetten")}
        onNaarTransactie={() => setPagina("transactie")}
        onNaarSparen={() => setPagina("sparen")}
        onNaarSorteren={() => setPagina("sorteren")}
        onNaarTransacties={() => setPagina("transacties")}
        onNaarUitloggen={() => setPagina("uitloggen")}
      />
    );
  }
 
  if (pagina === "budgetten") {
    return (
      <Budgetten
        onNaarStart={() => setPagina("start")}
        onNaarTransacties={() => setPagina("transacties")}
        onNaarSparen={() => setPagina("sparen")}
        onNaarUitloggen={() => setPagina("uitloggen")}
      />
    );
  }
 
  if (pagina === "sorteren") {
    return (
      <SortTransactions
        huidigeSortering={sorteringen[sorteerFilter] || "nieuwste"}
        onToepassen={(nieuweSortering) => {
          setSorteringen((huidige) => ({
            ...huidige,
            [sorteerFilter]: nieuweSortering,
          }));
          setPagina("transacties");
        }}
        onAnnuleren={() => setPagina("transacties")}
      />
    );
  }
 
  if (pagina === "categorieen") {
    return (
      <CategorieenBeheren
        categorieen={categorieen}
        onToevoegen={handleCategorieToevoegen}
        onHernoem={handleCategorieHernoem}
        onVerwijder={handleCategorieVerwijder}
        onTerug={() => setPagina("transacties")}
      />
    );
  }
 
  if (pagina === "transacties") {
    return (
      <Transactions
        transacties={transacties}
        initialFilter={transactiesFilter}
        onFilterChange={setTransactiesFilter}
        onNaarStart={() => setPagina("start")}
        onNaarBudgetten={() => setPagina("budgetten")}
        onNaarSparen={() => setPagina("sparen")}
        onNaarTransactie={() => setPagina("transactie")}
        onNaarCategorieen={() => setPagina("categorieen")}
        onNaarSorteren={(filter) => {
          setSorteerFilter(filter);
          setPagina("sorteren");
        }}
        onNaarUitloggen={() => setPagina("uitloggen")}
        sorteringen={sorteringen}
      />
    );
  }
 
  if (pagina === "transactie") {
    return (
      <AddTransaction
        categorieen={categorieen.uitgaven}
        inkomenscategorieen={categorieen.inkomsten}
        onOpslaan={async (transactie) => {
          setTransacties((huidige) => [
            ...huidige,
            {
              id: Date.now(),
              datum: transactie.datum,
              omschrijving: transactie.omschrijving || transactie.categorie,
              categorie: transactie.categorie,
              bedrag:
                ((transactie.type === "inkomst" ? 1 : -1) *
                  transactie.bedragInCenten) /
                100,
            },
          ]);
          setPagina("transacties");
        }}
        onAnnuleren={() => setPagina("transacties")}
      />
    );
  }
 
  if (pagina === "sparen") {
    return (
      <Sparen
        onNaarStart={() => setPagina("start")}
        onNaarTransacties={() => setPagina("transacties")}
        onNaarBudgetten={() => setPagina("budgetten")}
        onNaarUitloggen={() => setPagina("uitloggen")}
      />
    );
  }
 
  if (pagina === "uitloggen") {
    return (
      <Uitloggen
        onUitloggen={handleUitloggen}
        onAnnuleren={() => setPagina("start")}
      />
    );
  }
 
  return (
    <Login
      onLogin={handleLogin}
      onNaarRegistreren={() => setPagina("signup")}
    />
  );
}