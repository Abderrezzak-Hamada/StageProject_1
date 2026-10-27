
import { useState } from "react";
import "./Login.css";
 
export default function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 
  function handleSubmit(e) {
    e.preventDefault();
    onLogin?.({ email, password });
  }
 
  return (
    <main className="login">
      <div className="login__logo" aria-hidden="true">B</div>
      <h1 className="login__title">Welkom terug</h1>
      <p className="login__subtitle">Log in om je budget te bekijken.</p>
 
      <form className="login__card" onSubmit={handleSubmit}>
        <label className="login__label" htmlFor="email">E-mailadres</label>
        <input
          id="email"
          className="login__input"
          type="email"
          placeholder="naam@voorbeeld.nl"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
 
        <label className="login__label" htmlFor="password">Wachtwoord</label>
        <input
          id="password"
          className="login__input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
 
        <a
          href="#"
          className="login__link"
          onClick={(e) => {
            e.preventDefault();
            onRegister?.();
          }}
        >
          Account aanmaken.
        </a>
 
        <button type="submit" className="login__button">Inloggen</button>
      </form>
    </main>
  );
}
 