import React from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  UserCheck, 
  Cpu, 
  Calendar, 
  GraduationCap, 
  CheckCircle,
  Trophy,
  Gamepad2,
  Activity,
  QrCode,
  Vote,
  Plus
} from 'lucide-react';
import type { ProjectIdea } from '../data/ideas';

interface IdeaModalProps {
  idea: ProjectIdea | null;
  isOpen: boolean;
  onClose: () => void;
  votes: number;
  onAddVote: (id: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-6 h-6 text-amber-500" />,
  Trophy: <Trophy className="w-6 h-6 text-amber-600" />,
  Gamepad2: <Gamepad2 className="w-6 h-6 text-purple-500" />,
  Activity: <Activity className="w-6 h-6 text-rose-500" />,
  BookOpen: <BookOpen className="w-6 h-6 text-blue-600" />,
  QrCode: <QrCode className="w-6 h-6 text-indigo-600" />
};

export const IdeaModal: React.FC<IdeaModalProps> = ({
  idea,
  isOpen,
  onClose,
  votes,
  onAddVote
}) => {
  if (!isOpen || !idea) return null;

  const getInvestmentBadgeStyle = (inv: string) => {
    switch (inv) {
      case '1 séance':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case '2 à 3 séances':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'Fil rouge (4+ séances)':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="bg-gradient-to-r from-teal-900 to-teal-800 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-md bg-white text-teal-900 font-extrabold text-xs flex items-center justify-center">
              #{idea.number}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-teal-950/60 border border-teal-400/30 text-teal-200">
              {idea.category}
            </span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30">
              {idea.badge}
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shrink-0">
              {ICON_MAP[idea.icon] || <Sparkles className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {idea.title}
              </h2>
              <p className="text-teal-200 text-sm mt-1">
                {idea.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto text-slate-700">
          {/* Classroom Investment & Teacher Time Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-700" />
                Investissement en classe avec les élèves
              </span>
              <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${getInvestmentBadgeStyle(idea.classroomInvestment)}`}>
                {idea.classroomInvestment}
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {idea.classroomDetails}
            </p>
            <p className="text-xs text-slate-500 pt-1 border-t border-slate-200/60">
              ℹ️ <strong>Développement & hébergement Vercel</strong> : 100% géré par Julien en dehors des heures de cours.
            </p>
          </div>

          {/* Concept Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Le Concept & Le Scénario pour la classe
            </h4>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              {idea.concept}
            </p>
          </div>

          {/* Curriculum Link */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              Lien avec le Programme Scolaire (Cycle 3)
            </h4>
            <p className="text-xs sm:text-sm text-emerald-800 font-medium">
              {idea.curriculumLink}
            </p>
          </div>

          {/* Pedagogical Values */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-teal-600" />
              Bénéfices Pédagogiques & Compétences Clés
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {idea.pedagogicalValue.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Student Contribution */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-600" />
              Ce que fabriquent les élèves (Leur rôle actif)
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-amber-50/40 p-3.5 rounded-xl border border-amber-200/50">
              {idea.studentContribution}
            </p>
          </div>

          {/* Technical Implementation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-600" />
              Dans les coulisses techniques (Développement Antigravity & Vercel)
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              {idea.techImplementation}
            </p>
          </div>
        </div>

        {/* Modal Footer / Action CTA */}
        <div className="bg-slate-50 px-6 sm:px-8 py-4 border-t border-slate-200 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 px-4 py-2"
          >
            Fermer
          </button>

          <button
            onClick={() => onAddVote(idea.id)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-teal-700 hover:bg-teal-800 text-white shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <Vote className="w-4 h-4" />
            <span>Ajouter une voix pour ce projet ({votes} voix)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
