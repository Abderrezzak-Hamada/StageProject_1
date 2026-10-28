import { useState } from "react";
import { getHuidigeGebruiker, logout } from "./auth.js";
import Login from "./components/Login.jsx";
import Start from "./components/Start.jsx";
import TransactieToevoegen from "./components/transactionPlus.jsx";
import Uitloggen from "./components/Uitloggen.jsx";

export default function App() {
  const [pagina, setPagina] = useState(() =>
    getHuidigeGebruiker() ? "start" : "login"
  );

  function handleLogin() {
    setPagina("start");
  }

  function handleUitloggen() {
    logout();
    setPagina("login");
  }

  if (pagina === "start") {
    return (
      <Start
        onNaarTransactie={() => setPagina("transactie")}
        onNaarUitloggen={() => setPagina("uitloggen")}
      />
    );
  }

  if (pagina === "transactie") {
    return (
      <TransactieToevoegen
        onOpslaan={async () => setPagina("start")}
        onAnnuleren={() => setPagina("start")}
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

  return <Login onLogin={handleLogin} />;
}
