// Questions écrites à la main du quiz.
//   GET              → questions actives (public, lu par le jeu, mis en cache 1 min sur le CDN)
//   GET ?tout=1      → toutes, y compris retirées (gestionnaire)
//   POST {question}  → crée (gestionnaire)
//   PUT  {question}  → modifie ; { id, active } seul pour retirer / remettre en jeu (gestionnaire)
//   DELETE ?id=…     → supprime définitivement (gestionnaire)
import { randomBytes } from 'node:crypto';
import { cleanQuestion, currentAdmin, fail, json, sql, toQuestion } from './_lib.js';

export async function GET(request: Request) {
  const all = new URL(request.url).searchParams.has('tout');
  if (all) {
    if (!(await currentAdmin(request))) return fail('Non connecté', 401);
    const rows = await sql`SELECT * FROM questions ORDER BY updated_at DESC, created_at DESC, id`;
    return json({ questions: rows.map(toQuestion) }, 200, { 'cache-control': 'no-store' });
  }
  const rows = await sql`SELECT * FROM questions WHERE active ORDER BY created_at, id`;
  const questions = rows.map((r) => {
    const { active: _a, updatedAt: _u, updatedBy: _b, ...q } = toQuestion(r);
    return q;
  });
  return json({ questions }, 200, { 'cache-control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400' });
}

async function body(request: Request) {
  return (await request.json().catch(() => null)) as Record<string, unknown> | null;
}

export async function POST(request: Request) {
  const admin = await currentAdmin(request);
  if (!admin) return fail('Non connecté', 401);
  const data = await body(request);
  if (!data) return fail('Requête illisible.');
  const q = cleanQuestion(data);
  if (typeof q === 'string') return fail(q);
  const id = `q-${randomBytes(5).toString('hex')}`;
  const rows = await sql`INSERT INTO questions (id, mechanic, subject_id, level, prompt, clues, answer, wrong, explanation, show_image, image, updated_by)
    VALUES (${id}, ${q.mechanic}, ${q.subjectId}, ${q.level}, ${q.prompt}, ${q.clues && JSON.stringify(q.clues)}::jsonb, ${q.answer},
            ${q.wrong && JSON.stringify(q.wrong)}::jsonb, ${q.explanation}, ${q.showImage}, ${q.image}, ${admin.name})
    RETURNING *`;
  return json({ question: toQuestion(rows[0]) }, 201);
}

export async function PUT(request: Request) {
  const admin = await currentAdmin(request);
  if (!admin) return fail('Non connecté', 401);
  const data = await body(request);
  const id = typeof data?.id === 'string' ? data.id : '';
  if (!data || !id) return fail('Question inconnue.');
  let rows;
  if (Object.keys(data).length === 2 && typeof data.active === 'boolean') {
    rows = await sql`UPDATE questions SET active = ${data.active}, updated_at = now(), updated_by = ${admin.name} WHERE id = ${id} RETURNING *`;
  } else {
    const q = cleanQuestion(data);
    if (typeof q === 'string') return fail(q);
    rows = await sql`UPDATE questions SET mechanic = ${q.mechanic}, subject_id = ${q.subjectId}, level = ${q.level}, prompt = ${q.prompt},
      clues = ${q.clues && JSON.stringify(q.clues)}::jsonb, answer = ${q.answer}, wrong = ${q.wrong && JSON.stringify(q.wrong)}::jsonb,
      explanation = ${q.explanation}, show_image = ${q.showImage}, image = ${q.image}, updated_at = now(), updated_by = ${admin.name}
      WHERE id = ${id} RETURNING *`;
  }
  return rows.length ? json({ question: toQuestion(rows[0]) }) : fail('Question introuvable.', 404);
}

export async function DELETE(request: Request) {
  if (!(await currentAdmin(request))) return fail('Non connecté', 401);
  const id = new URL(request.url).searchParams.get('id') ?? '';
  const rows = await sql`DELETE FROM questions WHERE id = ${id} RETURNING id`;
  return rows.length ? json({ ok: true }) : fail('Question introuvable.', 404);
}
