import { useState } from "react";
import "./signup.css";

export default function SignUp({ onRegister, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Je wachtwoord moet minimaal 8 tekens bevatten.");
      return;
    }
    if (password !== repeatPassword) {
      setError("De wachtwoorden komen niet overeen.");
      return;
    }
    const result = onRegister?.({ name, email, password });
    if (!result?.ok) {
      setError(result?.fout || "Account aanmaken is niet gelukt.");
      return;
    }

    setError("");
  }

  return (
    <main className="signup">
      <div className="signup__logo" aria-hidden="true">B</div>
      <h1 className="signup__title">Account aanmaken</h1>
      <p className="signup__subtitle">Vul je gegevens in om te beginnen.</p>

      <form className="signup__card" onSubmit={handleSubmit}>
        <label className="signup__label" htmlFor="name">Naam</label>
        <input
          id="name"
          className="signup__input"
          type="text"
          placeholder="Voor- en achternaam"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label className="signup__label" htmlFor="email">E-mailadres</label>
        <input
          id="email"
          className="signup__input"
          type="email"
          placeholder="naam@voorbeeld.nl"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="signup__label" htmlFor="password">Wachtwoord</label>
        <input
          id="password"
          className="signup__input"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="signup__label" htmlFor="repeatPassword">Herhaal wachtwoord</label>
        <input
          id="repeatPassword"
          className="signup__input"
          type="password"
          autoComplete="new-password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          required
        />

        {error && <p className="signup__error" role="alert">{error}</p>}

        <button type="submit" className="signup__button">Account aanmaken</button>

        <a
          href="#"
          className="signup__link"
          onClick={(e) => {
            e.preventDefault();
            onLogin?.();
          }}
        >
          Ik heb al een account.
        </a>
      </form>
    </main>
  );
}