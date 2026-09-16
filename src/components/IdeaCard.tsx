import React from 'react';
import { 
  Sparkles, 
  Trophy, 
  Gamepad2, 
  Activity, 
  BookOpen, 
  QrCode, 
  Check, 
  ArrowRight,
  Calendar,
  Vote,
  Plus,
  Minus,
  Crown
} from 'lucide-react';
import type { ProjectIdea } from '../data/ideas';

interface IdeaCardProps {
  idea: ProjectIdea;
  votes: number;
  totalVotes: number;
  isLeading: boolean;
  onAddVote: (id: string) => void;
  onRemoveVote: (id: string) => void;
  onOpenModal: (idea: ProjectIdea) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-5 h-5 text-amber-500" />,
  Trophy: <Trophy className="w-5 h-5 text-amber-600" />,
  Gamepad2: <Gamepad2 className="w-5 h-5 text-purple-500" />,
  Activity: <Activity className="w-5 h-5 text-rose-500" />,
  BookOpen: <BookOpen className="w-5 h-5 text-blue-600" />,
  QrCode: <QrCode className="w-5 h-5 text-indigo-600" />
};

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  votes,
  totalVotes,
  isLeading,
  onAddVote,
  onRemoveVote,
  onOpenModal
}) => {
  const votePercentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

  const getInvestmentBadgeStyle = (inv: string) => {
    switch (inv) {
      case '1 séance':
        return 'bg-amber-50 text-amber-800 border-amber-200/80 font-semibold';
      case '2 à 3 séances':
        return 'bg-teal-50 text-teal-800 border-teal-200/80 font-semibold';
      case 'Fil rouge (4+ séances)':
        return 'bg-purple-50 text-purple-800 border-purple-200/80 font-semibold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div 
      className={`group relative bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl ${
        isLeading && votes > 0
          ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-50/10'
          : 'border-slate-200 hover:border-teal-300'
      }`}
    >
      {/* Top Banner if Leading */}
      {isLeading && votes > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-bold py-1 px-3 flex items-center justify-center gap-1.5 shadow-sm">
          <Crown className="w-3.5 h-3.5 fill-current" />
          <span>En tête des votes de la classe ! ({votes} voix)</span>
        </div>
      )}

      {/* Main card content */}
      <div className="p-6 cursor-pointer" onClick={() => onOpenModal(idea)}>
        {/* Top Badges & Project Number */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-teal-900 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
              #{idea.number}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {idea.category}
            </span>
          </div>

          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
            {idea.badge}
          </span>
        </div>

        {/* Title and Icon */}
        <div className="flex items-start gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0 group-hover:scale-105 transition-transform">
            {ICON_MAP[idea.icon] || <Sparkles className="w-5 h-5 text-teal-600" />}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-teal-700 transition-colors">
              {idea.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {idea.subtitle}
            </p>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-slate-600 line-clamp-3 mb-4 mt-3 leading-relaxed">
          {idea.summary}
        </p>

        {/* Highlights Pill list */}
        <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600 mb-4">
          {idea.highlightPoints.map((point, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="line-clamp-1">{point}</span>
            </div>
          ))}
        </div>

        {/* Live Vote Progress Bar */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1 text-slate-600">
              <Vote className="w-3.5 h-3.5 text-teal-600" />
              Voix exprimées
            </span>
            <span className="text-teal-900 font-bold">
              {votes} vote{votes > 1 ? 's' : ''} {totalVotes > 0 ? `(${votePercentage}%)` : ''}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                isLeading && votes > 0 ? 'bg-amber-500' : 'bg-teal-600'
              }`}
              style={{ width: `${votePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Info & Interactive Voting Button */}
      <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Classroom Investment Badge */}
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${getInvestmentBadgeStyle(idea.classroomInvestment)}`}>
          <Calendar className="w-3 h-3 shrink-0" />
          <span>{idea.classroomInvestment} en classe</span>
        </span>

        {/* Voting & Modal Controls */}
        <div className="flex items-center gap-2">
          {/* Vote Controls for Hand-raising in class */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveVote(idea.id);
              }}
              disabled={votes <= 0}
              title="Retirer une voix"
              className="px-2 py-1 hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:hover:bg-white"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2.5 py-1 font-extrabold text-slate-900 text-xs bg-slate-50 border-x border-slate-200 min-w-[28px] text-center">
              {votes}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddVote(idea.id);
              }}
              title="Ajouter une voix d'élève (+1)"
              className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold"
            >
              <Plus className="w-3 h-3 text-teal-700" />
            </button>
          </div>

          <button
            onClick={() => onOpenModal(idea)}
            className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-900 py-1"
          >
            <span>Détails</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
