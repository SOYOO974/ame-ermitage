import React, { useState } from 'react';
import { Trophy, Vote, RotateCcw, Copy, Check, Sparkles, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ProjectIdea } from '../data/ideas';

interface ClassroomVotingSectionProps {
  ideas: ProjectIdea[];
  votes: Record<string, number>;
  onResetVotes: () => void;
}

export const ClassroomVotingSection: React.FC<ClassroomVotingSectionProps> = ({
  ideas,
  votes,
  onResetVotes
}) => {
  const [copied, setCopied] = useState(false);

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

  // Sort ideas by vote count descending
  const sortedIdeas = [...ideas].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0));
  const leadingIdea = sortedIdeas[0];
  const maxVotes = votes[leadingIdea?.id] || 0;
  const hasWinner = totalVotes > 0 && maxVotes > 0;

  const triggerWinnerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const resultsSummary = `🗳️ RÉSULTATS DU VOTE DU CONSEIL DE LA MER (CM2 Mme Pavillon)\n` +
    `Aire Marine Éducative de l'Ermitage • Total : ${totalVotes} voix exprimées\n\n` +
    sortedIdeas.map((idea, index) => {
      const v = votes[idea.id] || 0;
      const pct = totalVotes > 0 ? Math.round((v / totalVotes) * 100) : 0;
      const medal = index === 0 && v > 0 ? '🥇 ' : index === 1 && v > 0 ? '🥈 ' : index === 2 && v > 0 ? '🥉 ' : '• ';
      return `${medal}${idea.title} : ${v} voix (${pct}%)`;
    }).join('\n') +
    `\n\n🏆 Projet élu par la classe : ${hasWinner ? leadingIdea.title : 'En cours de délibération'}`;

  const handleCopyResults = () => {
    navigator.clipboard.writeText(resultsSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(resultsSummary);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <section className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-teal-500/30 my-12 relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative space-y-6">
        {/* Header of voting box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
              <Vote className="w-3.5 h-3.5" />
              Décompte des Voix en Direct • Conseil de la Mer
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <span>Résultats du Vote de la Classe</span>
              {hasWinner && (
                <button
                  onClick={triggerWinnerConfetti}
                  title="Fêter le projet gagnant !"
                  className="p-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 transition-transform active:scale-95"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </button>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Utilisez les boutons <strong>+</strong> et <strong>-</strong> sur chaque carte pour enregistrer les mains levées lors de l'atelier.
            </p>
          </div>

          {/* Total Votes Badge */}
          <div className="bg-white/10 border border-white/15 px-4 py-2.5 rounded-2xl flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right">
              <div className="text-2xl font-black text-white leading-none">{totalVotes}</div>
              <div className="text-[11px] text-teal-200 uppercase font-bold tracking-wider">Voix comptées</div>
            </div>
          </div>
        </div>

        {/* Winner Highlight Banner if votes exist */}
        {hasWinner ? (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-400/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shrink-0">
                <Trophy className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <span>Projet En Tête du Conseil</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-white">
                  {leadingIdea.title}
                </h4>
                <p className="text-xs text-slate-300">
                  {leadingIdea.subtitle} • <strong>{maxVotes} voix</strong> ({Math.round((maxVotes / totalVotes) * 100)}% des suffrages)
                </p>
              </div>
            </div>

            <button
              onClick={triggerWinnerConfetti}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 shrink-0 self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Célébrer la victoire !</span>
            </button>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-xs text-slate-400">
            Aucun vote n'a encore été enregistré. Cliquez sur les boutons <strong>+</strong> sur les cartes pour démarrer le scrutin en classe !
          </div>
        )}

        {/* Live Podium Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedIdeas.map((idea, index) => {
            const ideaVotes = votes[idea.id] || 0;
            const percentage = totalVotes > 0 ? Math.round((ideaVotes / totalVotes) * 100) : 0;
            const isWinner = index === 0 && ideaVotes > 0;

            return (
              <div 
                key={idea.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isWinner 
                    ? 'bg-amber-500/10 border-amber-400/50 text-white' 
                    : 'bg-white/5 border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold flex items-center gap-1.5 truncate">
                    <span className="text-slate-400">#{idea.number}</span>
                    <span className="truncate">{idea.title}</span>
                  </span>
                  <span className="font-extrabold text-teal-300 shrink-0 ml-2">
                    {ideaVotes} vote{ideaVotes > 1 ? 's' : ''} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isWinner ? 'bg-amber-400' : 'bg-teal-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls for the Teacher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs">
          <button
            onClick={onResetVotes}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Remettre les votes à zéro</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyResults}
              disabled={totalVotes === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15 font-semibold disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Procès-verbal copié !' : 'Copier les résultats'}</span>
            </button>

            <button
              onClick={handleWhatsApp}
              disabled={totalVotes === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md active:scale-95 disabled:opacity-40"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>Partager sur WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
