import { useState } from "react";
import { getHuidigeGebruiker, login, logout, registreer } from "./auth.js";
import Login from "./components/Login.jsx";
import SignUp from "./components/signup.jsx";
import Start from "./components/Start.jsx";
import AddTransaction from "./components/addTransaction.jsx";
import Transactions, { voorbeeldTransacties } from "./components/transactions.jsx";
import SortTransactions from "./components/SortTransactions.jsx";
import Uitloggen from "./components/Uitloggen.jsx";

export default function App() {
  const [pagina, setPagina] = useState(() =>
    getHuidigeGebruiker() ? "start" : "login"
  );
  const [transacties, setTransacties] = useState(voorbeeldTransacties);
  const [sorteringen, setSorteringen] = useState({});
  const [sorteerFilter, setSorteerFilter] = useState("alles");
  const [transactiesFilter, setTransactiesFilter] = useState("alles");

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
        onNaarTransactie={() => setPagina("transactie")}
        onNaarSorteren={() => setPagina("sorteren")}
        onNaarTransacties={() => setPagina("transacties")}
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

  if (pagina === "transacties") {
    return (
      <Transactions
        transacties={transacties}
        initialFilter={transactiesFilter}
        onFilterChange={setTransactiesFilter}
        onNaarStart={() => setPagina("start")}
        onNaarTransactie={() => setPagina("transactie")}
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
