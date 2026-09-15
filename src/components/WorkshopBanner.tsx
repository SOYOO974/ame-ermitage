import React from 'react';
import { Clock, Cpu, Users, Vote, Palette, CheckCircle2 } from 'lucide-react';

export const WorkshopBanner: React.FC = () => {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-12">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              Méthodologie d'intervention
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Déroulé du 1er Atelier en Classe (1 Heure)
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Un moment ludique et pédagogique pour stimuler la curiosité des élèves, démystifier l'IA et voter pour le projet.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl text-xs font-medium self-start md:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Matériel fourni par Julien (vidéoprojecteur & démos IA)</span>
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
                Démonstrations en direct : l'IA reconnaît une feuille d'arbre en photo, génère un avatar de gardien du corail et compose un refrain avec Suno.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/50 text-[11px] text-teal-800 font-medium">
              Objectif : Démystifier l'IA & susciter l'enthousiasme
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
                2. Présentation de la Sélection
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Présentation simplifiée et imagée des 2 ou 3 pistes retenues par Madame Pavillon pour la classe, avec de premières ébauches visuelles.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/50 text-[11px] text-teal-800 font-medium">
              Objectif : Donner envie sans disperser les idées
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 hover:bg-teal-50/50 transition-colors rounded-xl p-4 border border-slate-200/60 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                  00:30 - 00:45
                </span>
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-sm">
                  <Vote className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                3. Le « Conseil de la Mer » & Vote
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Débat d'idées citoyen : les élèves expriment leurs arguments pour la protection du lagon et votent démocratiquement pour le projet final.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/50 text-[11px] text-teal-800 font-medium">
              Objectif : Vivre la démocratie participative AME
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
                4. Répartition des Rôles Créatifs
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Distribution des missions par équipes : les rédacteurs d'énigmes, les illustrateurs, les reporters photo et les voix des capsules audio.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/50 text-[11px] text-teal-800 font-medium">
              Objectif : Impliquer 100% des élèves dans l'action
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
