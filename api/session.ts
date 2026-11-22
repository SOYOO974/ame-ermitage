// Connexion des gestionnaires du back-office.
//   GET    → compte connecté (401 sinon)
//   POST   { email, password } → ouvre la session (cookie)
//   DELETE → ferme la session
import { clearCookie, currentAdmin, dummyPasswordCheck, fail, json, sessionCookie, sql, verifyPassword } from './_lib.js';

export async function GET(request: Request) {
  const admin = await currentAdmin(request);
  return admin ? json(admin) : fail('Non connecté', 401);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: unknown; password?: unknown };
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const rows = email ? await sql`SELECT email, name, pw_hash FROM admins WHERE email = ${email}` : [];
  const row = rows[0] as { email: string; name: string; pw_hash: string } | undefined;
  if (!row) dummyPasswordCheck();
  if (!row || !verifyPassword(password, row.pw_hash)) {
    // Un peu d'attente : décourage les essais de mots de passe à la chaîne.
    await new Promise((r) => setTimeout(r, 800));
    return fail('Email ou mot de passe incorrect.', 401);
  }
  return json({ email: row.email, name: row.name }, 200, { 'set-cookie': sessionCookie(row.email) });
}

export function DELETE() {
  return json({ ok: true }, 200, { 'set-cookie': clearCookie() });
}
