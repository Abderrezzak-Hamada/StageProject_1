import { useState } from "react";
import { getHuidigeGebruiker, logout } from "./auth.js";
import Login from "./components/Login.jsx";
import Start from "./components/Start.jsx";
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
    return <Start onNaarUitloggen={() => setPagina("uitloggen")} />;
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
