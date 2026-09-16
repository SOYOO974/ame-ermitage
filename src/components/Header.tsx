import React from 'react';
import { Waves, Sparkles, MapPin, ShieldCheck, Vote, School } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="relative bg-gradient-to-b from-teal-900 via-teal-800 to-teal-700 text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-xl">
      {/* Subtle ocean decorative backdrop */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-teal-300 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-400 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center space-y-5">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-200">
            <Waves className="w-4 h-4 text-teal-300" />
            Aire Marine Éducative (AME) • Cycle 3
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-200">
            <MapPin className="w-4 h-4 text-emerald-300" />
            Lagon de l'Ermitage • Face à Chez Go by Le Cap Méchant
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-200">
            <School className="w-4 h-4 text-amber-300" />
            CM2 Madame Pavillon • École de l'Ermitage
          </span>
        </div>

        {/* Main Titles */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs sm:text-sm font-bold animate-pulse">
            <Vote className="w-4 h-4 text-rose-300" />
            Le Conseil des Enfants pour la Mer : Vote Officiel de la Classe
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Les 6 Projets en Compétition
          </h1>
          <p className="text-base sm:text-xl font-light text-teal-100 max-w-3xl mx-auto leading-relaxed">
            Découvrez les 6 idées sélectionnées par Madame Pavillon, explorez leurs super-pouvoirs pour protéger notre lagon, et votez pour le projet de notre classe !
          </p>
        </div>

        {/* Reassurance & Teamwork Callout */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-teal-200 pt-2">
          <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Atelier animé par Julien Vanwinsberghe (Parent d'élève)
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            Hébergement Vercel 100% gratuit & sans publicité
          </span>
        </div>
      </div>
    </header>
  );
};
