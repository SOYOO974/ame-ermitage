import { useEffect, useState } from 'react';
import { fetchPublicStats, type PublicStats } from './track';

const fmt = (n: number) => n.toLocaleString('fr-FR');

/** Chiffres de toute la communauté des Gardiens, en pied de page. Rien ne s'affiche si le serveur ne répond pas. */
export function PublicStatsStrip() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    let alive = true;
    fetchPublicStats().then((s) => alive && setStats(s));
    return () => {
      alive = false;
    };
  }, []);

  if (!stats || stats.joueurs < 1) return null;
  const hours = Math.floor(stats.secondes / 3600);
  const items: [number, string][] = [
    [stats.joueurs, stats.joueurs > 1 ? 'Gardiens du lagon' : 'Gardien du lagon'],
    [stats.questions_apprises, 'questions apprises'],
    [stats.bonnes_reponses, 'bonnes réponses'],
    [stats.parties, 'parties de mini-jeux'],
    [stats.cartes, 'cartes ouvertes'],
  ];
  if (hours >= 1) items.push([hours, hours > 1 ? 'heures à apprendre' : 'heure à apprendre']);

  return (
    <section aria-label="Les Gardiens en chiffres" className="mx-auto mt-6 max-w-4xl border-y border-white/10 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">Tous les Gardiens ensemble</p>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map(([value, label]) => (
          <div key={label} className="flex flex-col items-center">
            <dt className="order-2 text-xs leading-tight text-white/60">{label}</dt>
            <dd className="order-1 font-display text-2xl font-semibold leading-none text-soleil-300 tabular-nums">{fmt(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
