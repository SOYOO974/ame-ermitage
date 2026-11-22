// Base Neon du back-office. Les variables viennent de .env.local (npx vercel env pull .env.local).
//   node --env-file=.env.local scripts/db.mjs migrate               crée les tables ; importe questions.seed.json si la table est vide
//   node --env-file=.env.local scripts/db.mjs admin <email> "<Nom>"  crée un compte gestionnaire (ou lui redonne un mot de passe provisoire, à changer à la connexion)
//   node --env-file=.env.local scripts/db.mjs admin-remove <email>   supprime un compte gestionnaire
//   node --env-file=.env.local scripts/db.mjs export                réécrit la copie de secours src/quiz/questions.seed.json
import { neon } from '@neondatabase/serverless';
import { randomBytes, scryptSync } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL manquant : lancer avec node --env-file=.env.local scripts/db.mjs …');
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
const SEED = new URL('../src/quiz/questions.seed.json', import.meta.url);
const [command, ...args] = process.argv.slice(2);

const hashPassword = (password) => {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('base64url')}$${scryptSync(password, salt, 32).toString('base64url')}`;
};

if (command === 'migrate') {
  await sql`CREATE TABLE IF NOT EXISTS admins (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    pw_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS must_change BOOLEAN NOT NULL DEFAULT false`;
  await sql`CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    mechanic TEXT NOT NULL CHECK (mechanic IN ('diagnostic', 'qui-suis-je')),
    subject_id TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('decouverte', 'explorateur', 'expert')),
    prompt TEXT NOT NULL DEFAULT '',
    clues JSONB,
    answer TEXT,
    wrong JSONB,
    explanation TEXT NOT NULL DEFAULT '',
    show_image BOOLEAN NOT NULL DEFAULT true,
    image TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by TEXT
  )`;
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM questions`;
  if (n === 0) {
    const seed = JSON.parse(readFileSync(SEED, 'utf8'));
    for (const q of seed) {
      await sql`INSERT INTO questions (id, mechanic, subject_id, level, prompt, clues, answer, wrong, explanation, show_image, image, updated_by)
        VALUES (${q.id}, ${q.mechanic}, ${q.subjectId}, ${q.level}, ${q.prompt}, ${q.clues ? JSON.stringify(q.clues) : null}::jsonb,
                ${q.answer}, ${q.wrong ? JSON.stringify(q.wrong) : null}::jsonb, ${q.explanation}, ${q.showImage}, ${q.image}, 'import')`;
    }
    console.log(`${seed.length} questions importées depuis questions.seed.json`);
  } else {
    console.log(`Tables à jour, ${n} questions déjà en base (pas d'import)`);
  }
} else if (command === 'admin') {
  const [email, name] = args;
  if (!email || !name) throw new Error('Usage : admin <email> "<Nom>"');
  const password = randomBytes(9).toString('base64url');
  // Mot de passe provisoire : le back-office oblige à le changer à la première connexion.
  await sql`INSERT INTO admins (email, name, pw_hash, must_change) VALUES (${email.toLowerCase()}, ${name}, ${hashPassword(password)}, true)
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, pw_hash = EXCLUDED.pw_hash, must_change = true`;
  console.log(`Compte prêt : ${email.toLowerCase()}\nMot de passe provisoire : ${password} (à changer à la première connexion)\nConnexion : https://gardiensdulagon.re/admin`);
} else if (command === 'admin-remove') {
  const rows = await sql`DELETE FROM admins WHERE email = ${String(args[0] ?? '').toLowerCase()} RETURNING email`;
  console.log(rows.length ? `Compte supprimé : ${rows[0].email}` : 'Aucun compte à ce nom');
} else if (command === 'export') {
  const rows = await sql`SELECT * FROM questions WHERE active ORDER BY created_at, id`;
  const out = rows.map((r) => ({
    id: r.id, mechanic: r.mechanic, subjectId: r.subject_id, level: r.level, prompt: r.prompt, clues: r.clues,
    answer: r.answer, wrong: r.wrong, explanation: r.explanation, showImage: r.show_image, image: r.image,
  }));
  writeFileSync(SEED, JSON.stringify(out, null, 2) + '\n');
  console.log(`${out.length} questions écrites dans src/quiz/questions.seed.json`);
} else {
  console.log('Commandes : migrate | admin <email> "<Nom>" | admin-remove <email> | export');
}
