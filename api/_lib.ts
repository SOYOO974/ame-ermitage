// Outils partagés des fonctions /api (le « _ » empêche Vercel d'en faire une route).
import { neon } from '@neondatabase/serverless';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const sql = neon(process.env.DATABASE_URL!);

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...headers } });

export const fail = (message: string, status = 400) => json({ error: message }, status);

// --- Comptes gestionnaires ----------------------------------------------------
// Session sans table : un jeton signé (email + date d'expiration) dans un cookie HttpOnly.
const COOKIE = 'ame_admin';
const SESSION_DAYS = 30;

const sign = (payload: string) => createHmac('sha256', process.env.AUTH_SECRET!).update(payload).digest('base64url');

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  const actual = scryptSync(password, Buffer.from(salt, 'base64url'), expected.length);
  return timingSafeEqual(actual, expected);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('base64url')}$${scryptSync(password, salt, 32).toString('base64url')}`;
}

/** Longueur minimale d'un mot de passe choisi par un gestionnaire. */
export const MIN_PASSWORD_LENGTH = 10;

/** Calcul factice pour qu'un email inconnu réponde aussi lentement qu'un mauvais mot de passe. */
export const dummyPasswordCheck = () => scryptSync('x', randomBytes(16), 32);

export function sessionCookie(email: string): string {
  const payload = `${Buffer.from(email).toString('base64url')}.${Date.now() + SESSION_DAYS * 86_400_000}`;
  const secure = process.env.VERCEL_ENV ? '; Secure' : '';
  return `${COOKIE}=${payload}.${sign(payload)}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DAYS * 86_400}${secure}`;
}

export const clearCookie = () => `${COOKIE}=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0`;

export interface Admin {
  email: string;
  name: string;
  /** Mot de passe provisoire (donné par scripts/db.mjs admin) : à changer avant d'accéder au back-office. */
  mustChange: boolean;
}

/**
 * Compte de la session ouverte, même s'il doit encore changer son mot de passe provisoire (sert à /api/session).
 * Le compte est relu en base : le supprimer coupe aussi sa session.
 */
export async function sessionAccount(request: Request): Promise<Admin | null> {
  const cookie = request.headers.get('cookie') ?? '';
  const token = cookie.split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!token) return null;
  const [user, expires, signature] = token.split('.');
  if (!user || !expires || !signature) return null;
  const expected = Buffer.from(sign(`${user}.${expires}`));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected) || Number(expires) < Date.now()) return null;
  const rows = await sql`SELECT email, name, must_change FROM admins WHERE email = ${Buffer.from(user, 'base64url').toString()}`;
  const row = rows[0] as { email: string; name: string; must_change: boolean } | undefined;
  return row ? { email: row.email, name: row.name, mustChange: row.must_change } : null;
}

/** Gestionnaire connecté et autorisé, ou null : un mot de passe provisoire pas encore changé ne donne accès à rien. */
export async function currentAdmin(request: Request): Promise<Admin | null> {
  const account = await sessionAccount(request);
  return account && !account.mustChange ? account : null;
}

// --- Questions ----------------------------------------------------------------
export interface QuestionInput {
  id?: string;
  mechanic: 'diagnostic' | 'qui-suis-je';
  subjectId: string;
  level: 'decouverte' | 'explorateur' | 'expert';
  prompt: string;
  clues: string[] | null;
  answer: string | null;
  wrong: string[] | null;
  explanation: string;
  showImage: boolean;
  image: string | null;
  active?: boolean;
}

export const toQuestion = (r: Record<string, unknown>) => ({
  id: r.id,
  mechanic: r.mechanic,
  subjectId: r.subject_id,
  level: r.level,
  prompt: r.prompt,
  clues: r.clues,
  answer: r.answer,
  wrong: r.wrong,
  explanation: r.explanation,
  showImage: r.show_image,
  image: r.image,
  active: r.active,
  updatedAt: r.updated_at,
  updatedBy: r.updated_by,
});

const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const texts = (v: unknown) => (Array.isArray(v) ? v.map(text).filter(Boolean) : []);

/** Contrôle et nettoie une question envoyée par le back-office. Renvoie un message d'erreur en clair sinon. */
export function cleanQuestion(body: Record<string, unknown>): QuestionInput | string {
  const mechanic = body.mechanic;
  if (mechanic !== 'diagnostic' && mechanic !== 'qui-suis-je') return 'Type de question inconnu.';
  const level = body.level;
  if (level !== 'decouverte' && level !== 'explorateur' && level !== 'expert') return 'Niveau inconnu.';
  const subjectId = text(body.subjectId);
  if (!subjectId) return 'Choisir le sujet de la question.';
  const image = text(body.image) || null;
  if (image && !/^(https:\/\/|\/images\/)/.test(image)) return 'Adresse de photo invalide.';
  const base = { mechanic: mechanic as QuestionInput['mechanic'], level: level as QuestionInput['level'], subjectId, image, showImage: body.showImage !== false, explanation: text(body.explanation) };

  if (mechanic === 'qui-suis-je') {
    const clues = texts(body.clues);
    if (clues.length !== 3) return 'Un « Qui suis-je ? » demande exactement 3 indices.';
    return { ...base, prompt: '', clues, answer: null, wrong: null };
  }
  const prompt = text(body.prompt);
  if (!prompt) return 'Écrire la question.';
  const answer = text(body.answer);
  if (!answer) return 'Indiquer la bonne réponse.';
  const wrong = body.wrong === null ? null : texts(body.wrong);
  if (wrong === null) {
    if (answer !== 'Bon signe' && answer !== 'Mauvais signe') return 'Choisir « Bon signe » ou « Mauvais signe ».';
  } else {
    if (wrong.length !== 3) return 'Écrire 3 mauvaises réponses.';
    const all = [answer, ...wrong].map((s) => s.toLowerCase());
    if (new Set(all).size !== all.length) return 'Deux réponses sont identiques.';
  }
  if (!base.explanation) return "Écrire l'explication affichée après la réponse.";
  return { ...base, prompt, clues: null, answer, wrong };
}
