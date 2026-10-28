// src/auth.js
const USERS_KEY = "users";
const SESSION_KEY = "huidigeGebruiker";

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

// Registratie (voor later)
export function registreer(email, wachtwoord) {
  const users = getUsers();
  if (users.some((u) => u.email === email)) {
    return { ok: false, fout: "Dit e-mailadres bestaat al" };
  }
  users.push({ email, wachtwoord });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { ok: true };
}

// Inloggen
export function login(email, wachtwoord) {
  const user = getUsers().find(
    (u) => u.email === email && u.wachtwoord === wachtwoord
  );
  if (!user) return { ok: false, fout: "Onjuist e-mailadres of wachtwoord" };
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email }));
  return { ok: true };
}

// Uitloggen (voor later)
export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

// Wie is ingelogd?
export function getHuidigeGebruiker() {
  return JSON.parse(localStorage.getItem(SESSION_KEY));
}