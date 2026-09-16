import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  UserCheck, 
  Cpu, 
  Calendar, 
  GraduationCap, 
  CheckCircle, 
  Vote, 
  Plus, 
  Maximize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { ProjectIdea } from '../data/ideas';

interface IdeaModalProps {
  idea: ProjectIdea | null;
  isOpen: boolean;
  onClose: () => void;
  votes: number;
  onAddVote: (id: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalIdeas?: number;
}

export const IdeaModal: React.FC<IdeaModalProps> = ({
  idea,
  isOpen,
  onClose,
  votes,
  onAddVote,
  onPrev,
  onNext,
  hasPrev = true,
  hasNext = true,
  currentIndex = 0,
  totalIdeas = 6
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  // Keyboard navigation support (ArrowLeft / ArrowRight / Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) {
        onPrev();
      } else if (e.key === 'ArrowRight' && onNext && hasNext) {
        onNext();
      } else if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onPrev, onNext, hasPrev, hasNext, isZoomed, onClose]);

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      {/* Lightbox full-screen view when image is clicked */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <button 
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold flex items-center gap-2"
            onClick={() => setIsZoomed(false)}
          >
            <X className="w-5 h-5" />
            <span>Fermer le plein écran</span>
          </button>
          <img 
            src={idea.imageUrl} 
            alt={idea.title} 
            className="max-h-[88vh] max-w-[95vw] object-contain rounded-xl shadow-2xl" 
          />
          <p className="text-white/80 text-sm mt-3 font-medium text-center">
            #{idea.number} {idea.title} • {idea.subtitle}
          </p>
        </div>
      )}

      {/* Main Modal Container with Relative Navigation */}
      <div className="relative w-full max-w-3xl flex items-center justify-center">
        {/* Floating Side Arrow Left (Desktop) */}
        {hasPrev && onPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            title="Projet précédent (Touche flèche gauche)"
            className="absolute -left-4 sm:-left-14 z-30 p-3 rounded-full bg-white/95 hover:bg-white text-slate-800 hover:text-teal-700 shadow-2xl border border-slate-200/90 transition-all hover:scale-110 active:scale-95 hidden sm:flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Floating Side Arrow Right (Desktop) */}
        {hasNext && onNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            title="Projet suivant (Touche flèche droite)"
            className="absolute -right-4 sm:-right-14 z-30 p-3 rounded-full bg-white/95 hover:bg-white text-slate-800 hover:text-teal-700 shadow-2xl border border-slate-200/90 transition-all hover:scale-110 active:scale-95 hidden sm:flex items-center justify-center"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Modal Card Content */}
        <div 
          className="relative bg-white w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar with Badges, Quick Navigation & Close Button */}
          <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3 border-b border-slate-800 shrink-0">
            {/* Left: Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-teal-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-sm">
                #{idea.number}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-teal-950 border border-teal-500/40 text-teal-300 hidden sm:inline">
                {idea.category}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 shadow-sm">
                {idea.badge}
              </span>
            </div>

            {/* Center: In-Header Navigation Arrows (Visible everywhere, mobile friendly) */}
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-xl border border-white/15 text-xs font-semibold">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev && onPrev();
                }}
                disabled={!hasPrev || !onPrev}
                title="Projet précédent (←)"
                className="p-1 rounded-lg hover:bg-white/20 text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-teal-200 px-1 font-bold">
                {currentIndex + 1} / {totalIdeas}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext && onNext();
                }}
                disabled={!hasNext || !onNext}
                title="Projet suivant (→)"
                className="p-1 rounded-lg hover:bg-white/20 text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Fermer (Échap)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Modal Body */}
          <div className="p-5 sm:p-8 space-y-6 overflow-y-auto text-slate-700 flex-grow">
            {/* 100% UNOBSCURED IMAGE CONTAINER WITH NAVIGATION CONTROLS */}
            <div className="relative group w-full aspect-video rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-100">
              <img 
                src={idea.imageUrl} 
                alt={idea.title} 
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 cursor-zoom-in"
                onClick={() => setIsZoomed(true)}
              />

              {/* In-Image Navigation Arrow Left */}
              {hasPrev && onPrev && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrev();
                  }}
                  title="Projet précédent"
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md shadow-lg border border-white/20 transition-transform hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* In-Image Navigation Arrow Right */}
              {hasNext && onNext && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                  title="Projet suivant"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md shadow-lg border border-white/20 transition-transform hover:scale-110 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Expand Hint */}
              <button
                onClick={() => setIsZoomed(true)}
                className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-xl backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-opacity opacity-90 group-hover:opacity-100"
              >
                <Maximize2 className="w-3.5 h-3.5 text-teal-300" />
                <span>Plein écran</span>
              </button>
            </div>

            {/* Title & Subtitle cleanly below the image */}
            <div className="space-y-1.5 border-b border-slate-100 pb-5">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {idea.title}
              </h2>
              <p className="text-teal-700 text-sm sm:text-base font-semibold">
                {idea.subtitle}
              </p>
            </div>

            {/* Classroom Investment & Teacher Time Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-2">
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
                ℹ️ <strong>Développement technique & hébergement Vercel</strong> : 100% assuré par Julien en dehors des cours.
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

          {/* Modal Sticky Footer / Action CTA with Bottom Prev/Next */}
          <div className="bg-slate-50 px-5 sm:px-8 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Prev / Next controls in footer */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev && onPrev();
                }}
                disabled={!hasPrev || !onPrev}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-teal-800 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Précédent</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext && onNext();
                }}
                disabled={!hasNext || !onNext}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-teal-800 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm disabled:opacity-40"
              >
                <span>Suivant</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add vote CTA */}
            <button
              onClick={() => onAddVote(idea.id)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-teal-700 hover:bg-teal-600 text-white shadow-md active:scale-95 transition-all ml-auto"
            >
              <Plus className="w-4 h-4" />
              <Vote className="w-4 h-4" />
              <span>Ajouter une voix ({votes} vote{votes > 1 ? 's' : ''})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
