
import { useState } from "react";
import { getHuidigeGebruiker, login, logout, registreer } from "./auth.js";
import Login from "./components/Login.jsx";
import SignUp from "./components/signup.jsx";
import Start from "./components/Start.jsx";
import AddTransaction from "./components/addTransaction.jsx";
import Transactions, { voorbeeldTransacties } from "./components/transactions.jsx";
import SortTransactions from "./components/SortTransactions.jsx";
import Budgetten from "./components/Budgetten.jsx";
import Uitloggen from "./components/Uitloggen.jsx";
import Sparen from "./components/Sparen.jsx";
import AppNavigation from "./components/AppNavigation.jsx";
 
export default function App() {
  const [pagina, setPagina] = useState(() =>
    getHuidigeGebruiker() ? "start" : "login"
  );
  const [transacties, setTransacties] = useState(voorbeeldTransacties);
  const [transactiesFilter, setTransactiesFilter] = useState("alles");
  const [sorteringen, setSorteringen] = useState({});
  const [sorteerFilter, setSorteerFilter] = useState("alles");
 
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
 
  let inhoud;

  if (pagina === "signup") {
    inhoud = (
      <SignUp
        onRegister={handleRegister}
        onLogin={() => setPagina("login")}
      />
    );
  } else if (pagina === "start") {
    inhoud = (
      <Start
        onNaarBudgetten={() => setPagina("budgetten")}
        onNaarTransactie={() => setPagina("transactie")}
        onNaarTransacties={() => setPagina("transacties")}
      />
    );
  } else if (pagina === "budgetten") {
    inhoud = <Budgetten />;
  } else if (pagina === "sorteren") {
    inhoud = (
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
  } else if (pagina === "transacties") {
    inhoud = (
      <Transactions
        transacties={transacties}
        initialFilter={transactiesFilter}
        onFilterChange={setTransactiesFilter}
        onNaarTransactie={() => setPagina("transactie")}
        onNaarSorteren={(filter) => {
          setSorteerFilter(filter);
          setPagina("sorteren");
        }}
        sorteringen={sorteringen}
      />
    );
  } else if (pagina === "transactie") {
    inhoud = (
      <AddTransaction
        onOpslaan={async (transactie) => {
          setTransacties((huidige) => [
            ...huidige,
            {
              id: Date.now(),
              datum: transactie.datum,
              omschrijving: transactie.omschrijving || transactie.categorie,
              categorie: transactie.categorie,
              bedrag: (transactie.type === "inkomst" ? 1 : -1) * transactie.bedragInCenten / 100,
            },
          ]);
          setPagina("transacties");
        }}
        onAnnuleren={() => setPagina("transacties")}

      />
    );
  } else if (pagina === "sparen") {
    inhoud = <Sparen />;
  } else if (pagina === "uitloggen") {
    inhoud = (
      <Uitloggen
        onUitloggen={handleUitloggen}
        onAnnuleren={() => setPagina("start")}
      />
    );
  } else {
    inhoud = (
      <Login
        onLogin={handleLogin}
        onNaarRegistreren={() => setPagina("signup")}
      />
    );
  }

  const actievePagina = {
    transactie: "transacties",
    sorteren: "transacties",
  }[pagina] || (["login", "signup"].includes(pagina) ? null : pagina);

  return (
    <div className="app-shell">
      {inhoud}
      <AppNavigation
        actievePagina={actievePagina}
        uitgeschakeld={!getHuidigeGebruiker()}
        onNavigeren={setPagina}
      />
    </div>
  );
}