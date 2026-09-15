import React from 'react';
import { Waves, Sparkles, MapPin, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="relative bg-gradient-to-b from-teal-900 via-teal-800 to-teal-700 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-xl">
      {/* Subtle ocean decorative backdrop */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-teal-300 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-400 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center space-y-6">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-200">
            <Waves className="w-4 h-4 text-teal-300" />
            Aire Marine Éducative (AME) • Cycle 3 (CM2)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-200">
            <MapPin className="w-4 h-4 text-emerald-300" />
            Lagon de l'Ermitage • Face à Chez Go by Le Cap Méchant
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            École de l'Ermitage-les-Bains
          </span>
        </div>

        {/* Main Titles */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Projet Numérique & Éco-Citoyen
          </h1>
          <p className="text-lg sm:text-2xl font-light text-teal-100 max-w-3xl mx-auto">
            Sélection d'idées d'applications interactives pour valoriser et protéger la flore et la faune de notre aire marine.
          </p>
        </div>

        {/* Partnership & Context Callout */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 max-w-2xl mx-auto text-left shadow-lg">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-300/30 text-teal-200 shrink-0 mt-0.5">
              <HeartHandshake className="w-6 h-6 text-teal-200" />
            </div>
            <div className="text-sm sm:text-base text-teal-50 leading-relaxed">
              <p className="font-semibold text-white mb-1">
                Espace de concertation dédié à Madame Pavillon
              </p>
              <p className="text-teal-100 text-xs sm:text-sm">
                Proposé bénévolement par <strong>Julien Vanwinsberghe</strong> (parent d’Antoine, professionnel du numérique). 
                L'objectif est de co-construire une application utile et valorisante, puis de faire voter les élèves lors du premier atelier.
              </p>
            </div>
          </div>
        </div>

        {/* Tech Reassurance Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-teal-200 pt-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Hébergement Vercel 100% gratuit à vie
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Zéro collecte de données personnelles (Conforme RGPD)
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Fonctionne sur tablette, smartphone et TBI
          </span>
        </div>
      </div>
    </header>
  );
};
