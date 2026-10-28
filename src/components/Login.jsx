import { useState } from "react";
import { login, registreer } from "../auth.js";
import "./login.css";
 
export default function Login({ onLogin, onNaarRegistreren }) {
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [fouten, setFouten] = useState({});

  function handleTestLogin() {
    const testEmail = "test@budget.local";
    const testWachtwoord = "BudgetTest123!";
    const registratie = registreer(testEmail, testWachtwoord);

    if (!registratie.ok && registratie.fout !== "Dit e-mailadres bestaat al") {
      setFouten({ algemeen: registratie.fout });
      return;
    }

    const result = login(testEmail, testWachtwoord);
    if (!result.ok) {
      setFouten({ algemeen: result.fout });
      return;
    }

    setFouten({});
    onLogin?.();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const f = {};
    if (!email.trim()) f.email = "Vul je e-mailadres in";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) f.email = "Dit is geen geldig e-mailadres";
    if (!wachtwoord) f.wachtwoord = "Vul je wachtwoord in";
    if (Object.keys(f).length) return setFouten(f);
 
    const result = login(email, wachtwoord);
    if (!result.ok) return setFouten({ algemeen: result.fout });
 
    setFouten({});
    onLogin?.();
  }
 
  return (
    <div className="login">
      <div className="login-kop">
        <div className="login-logo" aria-hidden="true">B</div>
        <h1>Welkom terug</h1>
        <p>Log in om je budget te bekijken.</p>
      </div>
 
      <form className="login-kaart" onSubmit={handleSubmit} noValidate>
        {fouten.algemeen && <p className="login-melding" role="alert">{fouten.algemeen}</p>}
 
        <label htmlFor="email">E-mailadres</label>
        <input
          id="email"
          type="email"
          placeholder="naam@voorbeeld.nl"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!fouten.email}
        />
        {fouten.email && <span className="login-fout">{fouten.email}</span>}
 
        <label htmlFor="wachtwoord">Wachtwoord</label>
        <input
          id="wachtwoord"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={wachtwoord}
          onChange={(e) => setWachtwoord(e.target.value)}
          aria-invalid={!!fouten.wachtwoord}
        />
        {fouten.wachtwoord && <span className="login-fout">{fouten.wachtwoord}</span>}
 
        <button type="submit" className="login-knop">Inloggen</button>
        {import.meta.env.DEV && (
          <button
            type="button"
            className="login-testknop"
            onClick={handleTestLogin}
          >
            Inloggen met testaccount
          </button>
        )}

         <button
            type="button"
            className="register-knop"
            onClick={() => onNaarRegistreren?.()}
          >
            Registreren
          </button>
      </form>
    </div>
  );
}