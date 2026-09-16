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
  Crown,
  Maximize2
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
  Sparkles: <Sparkles className="w-4 h-4 text-amber-500" />,
  Trophy: <Trophy className="w-4 h-4 text-amber-600" />,
  Gamepad2: <Gamepad2 className="w-4 h-4 text-purple-500" />,
  Activity: <Activity className="w-4 h-4 text-rose-500" />,
  BookOpen: <BookOpen className="w-4 h-4 text-blue-600" />,
  QrCode: <QrCode className="w-4 h-4 text-indigo-600" />
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
      className={`group relative bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 ${
        isLeading && votes > 0
          ? 'border-amber-400 ring-4 ring-amber-400/20 bg-amber-50/10'
          : 'border-slate-200 hover:border-teal-300'
      }`}
    >
      {/* Top Leading Banner */}
      {isLeading && votes > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold py-1.5 px-4 flex items-center justify-center gap-1.5 shadow-sm z-20">
          <Crown className="w-4 h-4 fill-current animate-bounce" />
          <span>En tête du vote de la classe ! ({votes} voix)</span>
        </div>
      )}

      {/* Main card content */}
      <div>
        {/* Top Image Preview */}
        <div 
          className="relative aspect-video w-full overflow-hidden bg-slate-100 cursor-pointer"
          onClick={() => onOpenModal(idea)}
        >
          <img 
            src={idea.imageUrl} 
            alt={idea.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Badges on top of image */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            <span className="w-8 h-8 rounded-xl bg-teal-950/80 backdrop-blur-md text-white font-black text-sm flex items-center justify-center shadow-lg border border-white/20">
              #{idea.number}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/20">
              {idea.category}
            </span>
          </div>

          <div className="absolute top-3 right-3 z-10">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 shadow-md font-bold">
              {idea.badge}
            </span>
          </div>

          {/* Click to expand hint */}
          <div className="absolute bottom-2.5 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md text-white text-[11px] px-2 py-1 rounded-md flex items-center gap-1">
            <Maximize2 className="w-3 h-3" />
            <span>Agrandir</span>
          </div>
        </div>

        {/* Card Body Details */}
        <div className="p-5 sm:p-6 cursor-pointer" onClick={() => onOpenModal(idea)}>
          {/* Title & Icon */}
          <div className="flex items-start gap-3 mb-2">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 shrink-0 mt-0.5">
              {ICON_MAP[idea.icon] || <Sparkles className="w-4 h-4 text-teal-600" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-teal-700 transition-colors">
                {idea.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {idea.subtitle}
              </p>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm text-slate-600 line-clamp-3 mb-4 mt-2 leading-relaxed">
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
                Voix de la classe
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
      </div>

      {/* Footer Info & Interactive Voting Button */}
      <div className="px-5 sm:px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Classroom Investment Badge */}
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${getInvestmentBadgeStyle(idea.classroomInvestment)}`}>
          <Calendar className="w-3 h-3 shrink-0" />
          <span>{idea.classroomInvestment}</span>
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
              className="px-2 py-1 hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:hover:bg-white transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 py-1 font-black text-slate-900 text-xs bg-slate-50 border-x border-slate-200 min-w-[30px] text-center">
              {votes}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddVote(idea.id);
              }}
              title="Ajouter une voix d'élève (+1)"
              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => onOpenModal(idea)}
            className="inline-flex items-center gap-1 font-bold text-teal-700 hover:text-teal-900 py-1 pl-1"
          >
            <span>Détails</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
