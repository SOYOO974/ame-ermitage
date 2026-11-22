// Statistiques anonymes du jeu « Les Gardiens du Lagon » (fonction Vercel).
//   POST /api/stats                 → enregistre un lot d'événements envoyés par le jeu
//   GET  /api/stats                 → chiffres publics (pied de page), mis en cache 5 min
//   GET  /api/stats?vue=admin       → tableau de bord complet, réservé aux gestionnaires connectés au back-office
//                                     (cookie ame_admin vérifié par currentAdmin d'api/_lib.ts)
//
// Aucune donnée personnelle : chaque appareil tire un identifiant au hasard (pas de nom, pas d'adresse IP stockée).
// Base : Postgres Neon (variable DATABASE_URL posée par l'intégration Vercel). En développement local sans
// DATABASE_URL, vite.config.ts fournit une base PGlite en mémoire via globalThis.__AME_DEV_DB
// (et globalThis.__AME_DEV_ADMIN ouvre la vue admin, le serveur de dev ne servant pas la connexion).

import { neon } from '@neondatabase/serverless';

type Row = Record<string, unknown>;
type Query = (text: string, params?: unknown[]) => Promise<Row[]>;

const TZ = 'Indian/Reunion';
const KINDS = new Set(['visite', 'reponse', 'partie', 'session', 'carte']);
const GAMES = new Set(['quiz', 'tortue', 'course', 'ravine']);
const MAX_EVENTS = 50;

let ready: Promise<Query> | null = null;

function db(): Promise<Query> {
  if (!ready) {
    ready = (async () => {
      const dev = (globalThis as { __AME_DEV_DB?: Query }).__AME_DEV_DB;
      let q: Query;
      if (dev) q = dev;
      else {
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error('DATABASE_URL manquante');
        const sql = neon(url);
        q = (text, params = []) => sql.query(text, params) as Promise<Row[]>;
      }
      await q(`create table if not exists play_events (
        id bigserial primary key,
        player text not null,
        kind text not null,
        game text,
        item text,
        detail text,
        correct boolean,
        seconds integer,
        score integer,
        count integer,
        created_at timestamptz not null default now()
      )`);
      await q('create index if not exists play_events_kind_idx on play_events (kind, created_at)');
      return q;
    })();
    ready.catch(() => (ready = null));
  }
  return ready;
}

const json = (body: unknown, status = 200, cache = 'no-store') =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache } });

const text = (v: unknown, max: number) => (typeof v === 'string' && v.length > 0 ? v.slice(0, max) : null);
const int = (v: unknown, min: number, max: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : null);

// ---------------------------------------------------------------- Enregistrement

export async function POST(request: Request): Promise<Response> {
  let body: { player?: unknown; events?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: 'JSON invalide' }, 400);
  }
  const player = typeof body.player === 'string' && /^[a-z0-9-]{8,40}$/i.test(body.player) ? body.player : null;
  if (!player || !Array.isArray(body.events)) return json({ error: 'Lot invalide' }, 400);

  const rows: unknown[][] = [];
  for (const raw of body.events.slice(0, MAX_EVENTS)) {
    if (!raw || typeof raw !== 'object') continue;
    const e = raw as Record<string, unknown>;
    if (typeof e.kind !== 'string' || !KINDS.has(e.kind)) continue;
    const game = typeof e.game === 'string' && GAMES.has(e.game) ? e.game : null;
    rows.push([
      player,
      e.kind,
      game,
      text(e.item, 60),
      text(e.detail, 80),
      typeof e.correct === 'boolean' ? e.correct : null,
      int(e.seconds, 0, 3600),
      int(e.score, 0, 3),
      int(e.count, 0, 999),
    ]);
  }
  if (!rows.length) return json({ ok: true, saved: 0 });

  let q: Query;
  try {
    q = await db();
  } catch (error) {
    console.error(error);
    return json({ error: 'Base indisponible' }, 503);
  }
  const values = rows.map((_, i) => `(${Array.from({ length: 9 }, (_, j) => `$${i * 9 + j + 1}`).join(',')})`).join(',');
  await q(`insert into play_events (player, kind, game, item, detail, correct, seconds, score, count) values ${values}`, rows.flat());
  return json({ ok: true, saved: rows.length });
}

// ---------------------------------------------------------------- Lecture

/** Temps de quiz compté par réponse : au-delà de 5 min, l'enfant était parti. */
const ANSWER_CAP = 300;
const localDay = `(created_at at time zone '${TZ}')::date`;
const today = `(now() at time zone '${TZ}')::date`;

async function publicStats(q: Query) {
  const [row] = await q(`select
    count(distinct player)::int as joueurs,
    count(*) filter (where kind = 'reponse' and correct)::int as bonnes_reponses,
    count(distinct case when kind = 'reponse' and correct then player || ':' || item end)::int as questions_apprises,
    count(*) filter (where kind = 'partie')::int as parties,
    count(*) filter (where kind = 'carte')::int as cartes,
    coalesce(sum(case when kind = 'reponse' then least(seconds, ${ANSWER_CAP}) when kind = 'session' then seconds end), 0)::int as secondes
  from play_events`);
  return row;
}

async function authorized(request: Request): Promise<boolean> {
  if ((globalThis as { __AME_DEV_ADMIN?: boolean }).__AME_DEV_ADMIN) return true;
  // Import à la demande : _lib ouvre sa connexion Neon dès son chargement.
  const { currentAdmin } = await import('./_lib.js');
  return (await currentAdmin(request)) !== null;
}

async function adminStats(q: Query) {
  const [overview] = await q(`select
    count(distinct player)::int as joueurs,
    count(distinct player) filter (where ${localDay} = ${today})::int as aujourdhui,
    count(distinct player) filter (where ${localDay} > ${today} - 7)::int as sept_jours,
    count(distinct player) filter (where ${localDay} > ${today} - 30)::int as trente_jours,
    count(*) filter (where kind = 'visite')::int as visites
  from play_events`);

  const daily = await q(`with first_seen as (select player, min(${localDay}) as day from play_events group by player)
    select d.day::date::text as jour,
      (select count(distinct player) from play_events where ${localDay} = d.day::date)::int as joueurs,
      (select count(*) from first_seen where day = d.day::date)::int as nouveaux,
      (select count(*) from play_events where kind = 'reponse' and ${localDay} = d.day::date)::int as reponses,
      (select count(*) from play_events where kind = 'partie' and ${localDay} = d.day::date)::int as parties
    from generate_series(${today} - 13, ${today}, interval '1 day') as d(day)
    order by d.day`);

  const games = await q(`select g.game,
      coalesce(s.sessions, 0)::int as sessions,
      coalesce(s.joueurs, 0)::int as joueurs,
      coalesce(s.duree_moyenne, 0)::int as duree_moyenne,
      coalesce(s.abandons, 0)::int as abandons,
      coalesce(p.parties, 0)::int as parties,
      coalesce(p.duree_partie, 0)::int as duree_partie,
      p.etoiles_moyennes::float as etoiles_moyennes,
      coalesce(p.trois_etoiles, 0)::int as trois_etoiles
    from (values ('tortue'), ('course'), ('ravine')) as g(game)
    left join (select game, count(*) as sessions, count(distinct player) as joueurs, avg(seconds) as duree_moyenne,
                 count(*) filter (where coalesce(count, 0) = 0) as abandons
               from play_events where kind = 'session' group by game) s on s.game = g.game
    left join (select game, count(*) as parties, avg(seconds) as duree_partie, round(avg(score)::numeric, 2) as etoiles_moyennes,
                 count(*) filter (where score = 3) as trois_etoiles
               from play_events where kind = 'partie' group by game) p on p.game = g.game`);

  const [quiz] = await q(`select count(*)::int as reponses, count(distinct player)::int as joueurs,
      coalesce(round(100.0 * count(*) filter (where correct) / nullif(count(*), 0)), 0)::int as reussite,
      coalesce(avg(least(seconds, ${ANSWER_CAP})), 0)::int as secondes_par_question,
      count(distinct case when correct then player || ':' || item end)::int as questions_apprises
    from play_events where kind = 'reponse'`);

  const [time] = await q(`with per_day as (
      select player, ${localDay} as day,
        sum(case when kind = 'reponse' then least(seconds, ${ANSWER_CAP}) else seconds end) as s
      from play_events where kind in ('reponse', 'session') group by player, ${localDay})
    select count(*)::int as journees,
      coalesce(avg(s), 0)::int as moyenne,
      coalesce(percentile_cont(0.5) within group (order by s), 0)::int as mediane,
      count(*) filter (where s >= 1740)::int as limite_atteinte
    from per_day`);

  const questionRates = (order: 'asc' | 'desc') =>
    q(`select item, max(detail) as sujet, count(*)::int as reponses,
        round(100.0 * count(*) filter (where correct) / count(*))::int as reussite,
        avg(least(seconds, ${ANSWER_CAP}))::int as secondes
      from play_events where kind = 'reponse' and item is not null
      group by item having count(*) >= 3
      order by reussite ${order}, reponses desc limit 10`);
  const hardest = await questionRates('asc');
  const easiest = await questionRates('desc');

  const cards = await q(`with per_player as (
      select p.player, coalesce(max(e.count), 0) as cartes
      from (select distinct player from play_events) p
      left join play_events e on e.player = p.player and e.kind = 'carte'
      group by p.player)
    select cartes::int, count(*)::int as joueurs from per_player group by cartes order by cartes`);

  const hours = await q(`select extract(hour from created_at at time zone '${TZ}')::int as heure, count(distinct player)::int as joueurs, count(*)::int as evenements
    from play_events where kind in ('reponse', 'partie') group by 1 order by 1`);

  const devices = await q(`select coalesce(detail, 'inconnu') as appareil, count(distinct player)::int as joueurs
    from play_events where kind = 'visite' group by 1 order by 2 desc`);

  return { overview, daily, games, quiz, time, hardest, easiest, cards, hours, devices, public: await publicStats(q) };
}

export async function GET(request: Request): Promise<Response> {
  const admin = new URL(request.url).searchParams.get('vue') === 'admin';
  try {
    if (admin && !(await authorized(request))) return json({ error: 'Connexion gestionnaire requise' }, 401);
    const q = await db();
    if (admin) return json(await adminStats(q));
    return json(await publicStats(q), 200, 'public, s-maxage=300, stale-while-revalidate=3600');
  } catch (error) {
    console.error(error);
    return json({ error: 'Statistiques indisponibles' }, 503);
  }
}
