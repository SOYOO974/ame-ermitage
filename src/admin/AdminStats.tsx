import { useEffect, useState, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

// Back-office : statistiques d'usage du jeu, réservées aux gestionnaires (mot de passe vérifié par le serveur).

interface AdminData {
  overview: { joueurs: number; aujourdhui: number; sept_jours: number; trente_jours: number; visites: number };
  daily: { jour: string; joueurs: number; nouveaux: number; reponses: number; parties: number }[];
  games: { game: string; sessions: number; joueurs: number; duree_moyenne: number; abandons: number; parties: number; duree_partie: number; etoiles_moyennes: number | null; trois_etoiles: number }[];
  quiz: { reponses: number; joueurs: number; reussite: number; secondes_par_question: number; questions_apprises: number };
  time: { journees: number; moyenne: number; mediane: number; limite_atteinte: number };
  hardest: { item: string; sujet: string | null; reponses: number; reussite: number; secondes: number }[];
  easiest: { item: string; sujet: string | null; reponses: number; reussite: number; secondes: number }[];
  cards: { cartes: number; joueurs: number }[];
  hours: { heure: number; joueurs: number; evenements: number }[];
  devices: { appareil: string; joueurs: number }[];
}

const GAME_TITLE: Record<string, string> = {
  tortue: 'La Traversée de la Tortue',
  course: 'La Grande Course du Lagon',
  ravine: 'La Crue de la Ravine',
};
const MECHANIC: Record<string, string> = { qsj: 'Qui suis-je ?', vis: 'Défi visuel', diag: 'Diagnostic' };

const n = (v: number) => v.toLocaleString('fr-FR');
const pct = (a: number, b: number) => (b > 0 ? Math.round((100 * a) / b) : 0);
function duration(s: number): string {
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m} min ${String(r).padStart(2, '0')}` : `${m} min`;
}
const dayLabel = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
const mechanicOf = (id: string) => MECHANIC[id.split('-')[0]] ?? id.split('-')[0];

function Card({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ocean-900/10 sm:p-6">
      <h2 className="font-display text-xl font-semibold text-ocean-900">{title}</h2>
      {note && <p className="mt-1 text-sm text-ocean-700/80">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Kpi({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-ocean-900/10">
      <div className="font-display text-3xl font-semibold leading-none text-ocean-900 tabular-nums">{value}</div>
      <div className="mt-1.5 text-sm text-ocean-700">{label}</div>
    </div>
  );
}

function Bars({ data, max }: { data: { label: string; value: number; title?: string }[]; max?: number }) {
  const top = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-40 items-end gap-1">
      {data.map((d, i) => (
        <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={d.title ?? `${d.label} : ${d.value}`}>
          <span className="text-[11px] font-semibold text-ocean-800 tabular-nums">{d.value || ''}</span>
          <div className="w-full rounded-t bg-turq-500" style={{ height: `${(d.value / top) * 100}%`, minHeight: d.value ? 3 : 0 }} />
          <span className="w-full truncate text-center text-[10px] text-ocean-700/80">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function Table({ head, rows, wide = false }: { head: string[]; rows: ReactNode[][]; wide?: boolean }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <table className={`w-full text-left text-sm ${wide ? 'min-w-[720px]' : ''}`}>
        <thead>
          <tr className="border-b border-ocean-900/15 text-xs uppercase tracking-[0.08em] text-ocean-700/80">
            {head.map((h, i) => (
              <th key={h} className={`py-2 pr-3 font-semibold ${i ? 'text-right' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-ocean-900/5 last:border-0">
              {r.map((c, j) => (
                <td key={j} className={`py-2 pr-3 ${j ? 'whitespace-nowrap text-right tabular-nums' : 'font-semibold text-ocean-900'}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Points d'attention calculés à partir des chiffres : ce qu'il faudrait regarder ou améliorer. */
function alerts(d: AdminData): string[] {
  const out: string[] = [];
  for (const g of d.games) {
    if (g.sessions >= 5 && pct(g.abandons, g.sessions) >= 40)
      out.push(`${GAME_TITLE[g.game]} : ${pct(g.abandons, g.sessions)} % des ouvertures se ferment sans finir une partie (jeu trop dur, trop long ou mal expliqué ?).`);
    if (g.parties >= 5 && (g.etoiles_moyennes ?? 0) < 1)
      out.push(`${GAME_TITLE[g.game]} : ${String(g.etoiles_moyennes ?? 0).replace('.', ',')} étoile en moyenne, le jeu semble trop difficile.`);
    if (g.parties >= 10 && pct(g.trois_etoiles, g.parties) >= 70)
      out.push(`${GAME_TITLE[g.game]} : ${pct(g.trois_etoiles, g.parties)} % des parties à 3 étoiles, le jeu est peut-être trop facile.`);
  }
  if (d.quiz.reponses >= 30 && d.quiz.reussite < 50) out.push(`Quiz : seulement ${d.quiz.reussite} % de bonnes réponses, les questions sont peut-être trop dures.`);
  for (const q of d.hardest.filter((q) => q.reponses >= 5 && q.reussite < 30).slice(0, 3))
    out.push(`Question « ${q.sujet ?? q.item} » (${mechanicOf(q.item)}) : ${q.reussite} % de réussite sur ${q.reponses} réponses, à reformuler ou vérifier.`);
  if (d.time.journees >= 10 && pct(d.time.limite_atteinte, d.time.journees) >= 50)
    out.push(`${pct(d.time.limite_atteinte, d.time.journees)} % des journées de jeu atteignent la limite de 30 minutes.`);
  return out;
}

function Dashboard({ data, onRefresh, loading }: { data: AdminData; onRefresh: () => void; loading: boolean }) {
  const o = data.overview;
  const notes = alerts(data);
  const totalPlayers = Math.max(1, o.joueurs);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ocean-700/80">Back-office · Statistiques</p>
          <h1 className="font-display text-3xl font-semibold text-ocean-900">Les Gardiens du Lagon</h1>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-ocean-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ocean-900 disabled:opacity-60">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.8} />
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi value={n(o.joueurs)} label="joueurs au total" />
        <Kpi value={n(o.aujourdhui)} label="joueurs aujourd'hui" />
        <Kpi value={n(o.sept_jours)} label="sur 7 jours" />
        <Kpi value={n(o.trente_jours)} label="sur 30 jours" />
        <Kpi value={n(o.visites)} label="visites" />
      </div>

      {notes.length > 0 && (
        <Card title="À surveiller" note="Repéré automatiquement à partir des chiffres ci-dessous.">
          <ul className="flex flex-col gap-2 text-ocean-900">
            {notes.map((t) => (
              <li key={t} className="border-l-2 border-corail-500 pl-3 leading-snug">{t}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Activité des 14 derniers jours" note="Joueurs différents par jour (heure de La Réunion).">
        <Bars data={data.daily.map((d) => ({ label: dayLabel(d.jour), value: d.joueurs, title: `${dayLabel(d.jour)} : ${d.joueurs} joueurs, dont ${d.nouveaux} nouveaux, ${d.reponses} réponses, ${d.parties} parties` }))} />
        <div className="mt-4">
          <Table
            head={['Jour', 'Joueurs', 'Nouveaux', 'Réponses', 'Parties']}
            rows={[...data.daily].reverse().filter((d) => d.joueurs > 0).map((d) => [dayLabel(d.jour), n(d.joueurs), n(d.nouveaux), n(d.reponses), n(d.parties)])}
          />
        </div>
      </Card>

      <Card title="Jeux les plus joués" note="Durée moyenne d'une ouverture du jeu ; « sans finir » = fermé avant la fin de la première partie.">
        <Table
          wide
          head={['Jeu', 'Joueurs', 'Ouvertures', 'Durée moyenne', 'Sans finir', 'Parties', 'Durée partie', 'Étoiles moy.', '3 étoiles']}
          rows={[
            ['Quiz', n(data.quiz.joueurs), '—', `${duration(data.quiz.secondes_par_question)} / question`, '—', `${n(data.quiz.reponses)} réponses`, '—', '—', '—'],
            ...[...data.games]
              .sort((a, b) => b.joueurs - a.joueurs)
              .map((g) => [
                GAME_TITLE[g.game] ?? g.game,
                n(g.joueurs),
                n(g.sessions),
                g.sessions ? duration(g.duree_moyenne) : '—',
                g.sessions ? `${pct(g.abandons, g.sessions)} %` : '—',
                n(g.parties),
                g.parties ? duration(g.duree_partie) : '—',
                g.etoiles_moyennes == null ? '—' : String(g.etoiles_moyennes).replace('.', ','),
                g.parties ? `${pct(g.trois_etoiles, g.parties)} %` : '—',
              ]),
          ]}
        />
        <p className="mt-3 text-sm text-ocean-700">
          {pct(data.quiz.joueurs, totalPlayers)} % des joueurs ont répondu au quiz ;{' '}
          {data.games.map((g) => `${pct(g.joueurs, totalPlayers)} % ont ouvert ${GAME_TITLE[g.game]}`).join(', ')}.
        </p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Quiz" note="Une question « apprise » = réussie au moins une fois par un joueur.">
          <div className="grid grid-cols-2 gap-3">
            <Kpi value={`${data.quiz.reussite} %`} label="de bonnes réponses" />
            <Kpi value={n(data.quiz.questions_apprises)} label="questions apprises" />
            <Kpi value={n(data.quiz.reponses)} label="réponses données" />
            <Kpi value={duration(data.quiz.secondes_par_question)} label="par question en moyenne" />
          </div>
        </Card>
        <Card title="Temps de jeu par jour" note="Par joueur et par jour : quiz + mini-jeux (limite 30 min).">
          <div className="grid grid-cols-2 gap-3">
            <Kpi value={duration(data.time.moyenne)} label="en moyenne" />
            <Kpi value={duration(data.time.mediane)} label="médiane" />
            <Kpi value={`${pct(data.time.limite_atteinte, data.time.journees)} %`} label="des journées vont jusqu'à la limite" />
            <Kpi value={n(data.time.journees)} label="journées de jeu" />
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Questions les plus ratées" note="Au moins 3 réponses. À reformuler si la réussite reste très basse.">
          <Table head={['Sujet', 'Type', 'Réponses', 'Réussite']} rows={data.hardest.map((q) => [q.sujet ?? q.item, mechanicOf(q.item), n(q.reponses), `${q.reussite} %`])} />
          {!data.hardest.length && <p className="text-sm text-ocean-700">Pas encore assez de réponses.</p>}
        </Card>
        <Card title="Questions les mieux réussies">
          <Table head={['Sujet', 'Type', 'Réponses', 'Réussite']} rows={data.easiest.map((q) => [q.sujet ?? q.item, mechanicOf(q.item), n(q.reponses), `${q.reussite} %`])} />
          {!data.easiest.length && <p className="text-sm text-ocean-700">Pas encore assez de réponses.</p>}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Progression dans la collection" note="Nombre de joueurs selon le nombre de cartes gagnées.">
          <Bars data={data.cards.map((c) => ({ label: String(c.cartes), value: c.joueurs, title: `${c.joueurs} joueurs avec ${c.cartes} carte(s)` }))} />
        </Card>
        <Card title="Heures de jeu" note="Joueurs actifs selon l'heure (classe ou maison ?).">
          <Bars
            data={Array.from({ length: 24 }, (_, h) => {
              const row = data.hours.find((x) => x.heure === h);
              return { label: h % 3 === 0 ? `${h}h` : '', value: row?.joueurs ?? 0, title: `${h}h : ${row?.joueurs ?? 0} joueurs` };
            })}
          />
        </Card>
      </div>

      <Card title="Appareils" note="Type d'écran à la visite : utile pour régler les commandes tactiles.">
        <div className="flex flex-wrap gap-3">
          {data.devices.map((d) => (
            <Kpi key={d.appareil} value={`${pct(d.joueurs, totalPlayers)} %`} label={d.appareil === 'telephone' ? 'téléphone' : d.appareil} />
          ))}
        </div>
      </Card>

      <p className="text-center text-xs text-ocean-700/70">Statistiques anonymes : un identifiant tiré au hasard par appareil, aucun nom ni adresse.</p>
    </div>
  );
}

/**
 * Onglet « Statistiques » du back-office (src/admin/Admin.tsx). L'accès passe par la connexion gestionnaire :
 * le cookie ame_admin part tout seul avec la requête, /api/stats le vérifie.
 * `embedded` : affiché dans l'onglet (sans fond pleine page).
 */
export default function AdminStats({ embedded = false }: { embedded?: boolean }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stats?vue=admin', { credentials: 'same-origin' });
      if (res.status === 401) {
        setError('Connecte-toi au back-office pour voir les statistiques.');
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      setData((await res.json()) as AdminData);
    } catch {
      setError('Statistiques indisponibles pour le moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className={embedded ? 'text-ocean-900' : 'min-h-screen bg-sable text-ocean-900'}>
      {data ? (
        <Dashboard data={data} loading={loading} onRefresh={load} />
      ) : (
        <p className="px-4 py-10 text-center text-ocean-700">{error ?? 'Chargement des statistiques…'}</p>
      )}
    </div>
  );
}
