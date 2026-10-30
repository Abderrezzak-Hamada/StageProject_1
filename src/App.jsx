import { useState } from "react";
import { getHuidigeGebruiker, login, logout, registreer } from "./auth.js";
import Login from "./components/Login.jsx";
import SignUp from "./components/signup.jsx";
import Start from "./components/Start.jsx";
import Budgetten from "./components/Budgetten.jsx";
import Uitloggen from "./components/Uitloggen.jsx";

export default function App() {
  const [pagina, setPagina] = useState(() =>
    getHuidigeGebruiker() ? "start" : "login"
  );

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
        onNaarUitloggen={() => setPagina("uitloggen")}
      />
    );
  }

  if (pagina === "budgetten") {
    return <Budgetten onNaarStart={() => setPagina("start")} />;
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
