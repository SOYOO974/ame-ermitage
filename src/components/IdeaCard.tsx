import React from 'react';
import { 
  Sparkles, 
  Trophy, 
  Gamepad2, 
  ScanLine, 
  MapPin, 
  Activity, 
  BookOpen, 
  QrCode, 
  Music, 
  Languages, 
  Heart, 
  Check, 
  ArrowRight,
  Clock
} from 'lucide-react';
import type { ProjectIdea } from '../data/ideas';

interface IdeaCardProps {
  idea: ProjectIdea;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onOpenModal: (idea: ProjectIdea) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-5 h-5 text-amber-500" />,
  Trophy: <Trophy className="w-5 h-5 text-amber-600" />,
  Gamepad2: <Gamepad2 className="w-5 h-5 text-purple-500" />,
  ScanLine: <ScanLine className="w-5 h-5 text-teal-600" />,
  MapPin: <MapPin className="w-5 h-5 text-emerald-600" />,
  Activity: <Activity className="w-5 h-5 text-rose-500" />,
  BookOpen: <BookOpen className="w-5 h-5 text-blue-600" />,
  QrCode: <QrCode className="w-5 h-5 text-indigo-600" />,
  Music: <Music className="w-5 h-5 text-fuchsia-500" />,
  Languages: <Languages className="w-5 h-5 text-emerald-600" />
};

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  isSelected,
  onToggleSelect,
  onOpenModal
}) => {
  return (
    <div 
      className={`group relative bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl ${
        isSelected 
          ? 'border-teal-500 ring-2 ring-teal-500/30 bg-teal-50/10' 
          : 'border-slate-200 hover:border-teal-300'
      }`}
    >
      {/* Selection floating badge */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(idea.id);
        }}
        title={isSelected ? "Retirer de ma sélection" : "Ajouter à ma sélection pour le vote"}
        className={`absolute top-4 right-4 z-10 p-2.5 rounded-full transition-transform active:scale-90 flex items-center justify-center shadow-md ${
          isSelected 
            ? 'bg-rose-500 text-white hover:bg-rose-600 ring-4 ring-rose-100' 
            : 'bg-white/90 backdrop-blur-sm text-slate-400 hover:text-rose-500 hover:bg-white border border-slate-200'
        }`}
      >
        <Heart className={`w-4 h-4 ${isSelected ? 'fill-current' : ''}`} />
      </button>

      {/* Main card content */}
      <div className="p-6 cursor-pointer" onClick={() => onOpenModal(idea)}>
        {/* Category & Badge */}
        <div className="flex flex-wrap items-center gap-2 pr-12 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
            {idea.category}
          </span>
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
        <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
          {idea.highlightPoints.map((point, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="line-clamp-1">{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info & Modal CTA */}
      <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{idea.duration}</span>
        </div>

        <button
          onClick={() => onOpenModal(idea)}
          className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-900 group-hover:translate-x-0.5 transition-transform"
        >
          <span>Voir détails</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
