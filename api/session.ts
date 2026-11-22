// Connexion des gestionnaires du back-office.
//   GET    → compte connecté (401 sinon)
//   POST   { email, password } → ouvre la session (cookie)
//   PATCH  { password, newPassword } → change le mot de passe (obligatoire après un mot de passe provisoire)
//   DELETE → ferme la session
import { MIN_PASSWORD_LENGTH, clearCookie, dummyPasswordCheck, fail, hashPassword, json, sessionAccount, sessionCookie, sql, verifyPassword } from './_lib.js';

export async function GET(request: Request) {
  const admin = await sessionAccount(request);
  return admin ? json(admin) : fail('Non connecté', 401);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: unknown; password?: unknown };
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const rows = email ? await sql`SELECT email, name, pw_hash, must_change FROM admins WHERE email = ${email}` : [];
  const row = rows[0] as { email: string; name: string; pw_hash: string; must_change: boolean } | undefined;
  if (!row) dummyPasswordCheck();
  if (!row || !verifyPassword(password, row.pw_hash)) {
    // Un peu d'attente : décourage les essais de mots de passe à la chaîne.
    await new Promise((r) => setTimeout(r, 800));
    return fail('Email ou mot de passe incorrect.', 401);
  }
  return json({ email: row.email, name: row.name, mustChange: row.must_change }, 200, { 'set-cookie': sessionCookie(row.email) });
}

export async function PATCH(request: Request) {
  const account = await sessionAccount(request);
  if (!account) return fail('Non connecté', 401);
  const body = (await request.json().catch(() => ({}))) as { password?: unknown; newPassword?: unknown };
  const password = typeof body.password === 'string' ? body.password : '';
  const next = typeof body.newPassword === 'string' ? body.newPassword : '';
  if (next.length < MIN_PASSWORD_LENGTH) return fail(`Le nouveau mot de passe doit faire au moins ${MIN_PASSWORD_LENGTH} caractères.`);
  if (next === password) return fail("Le nouveau mot de passe doit être différent de l'ancien.");
  const rows = await sql`SELECT pw_hash FROM admins WHERE email = ${account.email}`;
  const row = rows[0] as { pw_hash: string } | undefined;
  if (!row || !verifyPassword(password, row.pw_hash)) {
    await new Promise((r) => setTimeout(r, 800));
    return fail('Mot de passe actuel incorrect.', 401);
  }
  await sql`UPDATE admins SET pw_hash = ${hashPassword(next)}, must_change = false WHERE email = ${account.email}`;
  return json({ email: account.email, name: account.name, mustChange: false });
}

export function DELETE() {
  return json({ ok: true }, 200, { 'set-cookie': clearCookie() });
}
