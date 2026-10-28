const USERS_KEY = "users";
const SESSION_KEY = "huidigeGebruiker";

const schoon = (email) => email.trim().toLowerCase();

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

export function registreer(email, wachtwoord) {
  email = schoon(email);
  const users = getUsers();
  if (users.some((u) => u.email === email)) {
    return { ok: false, fout: "Dit e-mailadres bestaat al" };
  }
  users.push({ email, wachtwoord });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { ok: true };
}

export function login(email, wachtwoord) {
  email = schoon(email);
  const user = getUsers().find(
    (u) => u.email === email && u.wachtwoord === wachtwoord
  );
  if (!user) return { ok: false, fout: "Onjuist e-mailadres of wachtwoord" };
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email }));
  return { ok: true };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getHuidigeGebruiker() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}
