import React from 'react';
import { Clock, Cpu, Users, Vote, Palette, CheckCircle2 } from 'lucide-react';

export const WorkshopBanner: React.FC = () => {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-10">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              Programme de l'Atelier Découverte (1 Heure)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Comment va se dérouler notre séance en classe ?
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              4 temps forts de 15 minutes pour découvrir l'intelligence artificielle, débattre et voter pour le projet de notre AME.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-medium self-start md:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Julien se branche sur le matériel de projection de la classe</span>
          </div>
        </div>

        {/* 4 Steps Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="bg-slate-50 hover:bg-teal-50/50 transition-colors rounded-xl p-4 border border-slate-200/60 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                  00:00 - 00:15
                </span>
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-sm">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                1. Émerveillement & Démo IA
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Démos interactives en direct : l'IA reconnaît une feuille en photo, imagine un gardien du récif et crée un refrain musical avec Suno sur vos rimes !
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/50 text-[11px] text-teal-800 font-medium">
              Objectif : Démystifier l'IA & éveiller la curiosité
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 hover:bg-teal-50/50 transition-colors rounded-xl p-4 border border-slate-200/60 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                  00:15 - 00:30
                </span>
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-sm">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                2. Découverte des 6 Projets
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Présentation sur écran des 6 projets présélectionnés par Madame Pavillon, avec leurs mécanismes de jeu et leurs missions écologiques.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/50 text-[11px] text-teal-800 font-medium">
              Objectif : Comprendre les enjeux de chaque idée
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 hover:bg-teal-50/50 transition-colors rounded-xl p-4 border border-slate-200/60 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  00:30 - 00:45
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-sm">
                  <Vote className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                3. Grand Débat & Vote Officiel
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le Conseil des Enfants pour la Mer délibère ! Les élèves défendent leurs arguments et procèdent au vote démocratique pour élire le projet gagnant.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/50 text-[11px] text-rose-800 font-medium">
              Objectif : Exercer sa citoyenneté active (AME)
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-50 hover:bg-teal-50/50 transition-colors rounded-xl p-4 border border-slate-200/60 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                  00:45 - 01:00
                </span>
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-sm">
                  <Palette className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                4. Répartition des Missions
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lancement de la production : répartition par binômes d'élèves (rédacteurs d'énigmes, illustrateurs, reporters terrain, enregistrement des voix).
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/50 text-[11px] text-teal-800 font-medium">
              Objectif : 100% des élèves acteurs de la création
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
