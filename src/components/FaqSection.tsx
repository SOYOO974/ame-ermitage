import React from 'react';
import { HelpCircle, Coins, Smartphone, Lock, RefreshCw } from 'lucide-react';

export const FaqSection: React.FC = () => {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
      <div className="border-t border-slate-200 pt-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            Cadrage & FAQ
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Questions Pratiques & Cadrage Enseignante
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Toutes les réponses pour aborder le projet en toute sérénité sur le plan technique, financier et pédagogique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Question 1: Budget 450 € */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Que fait-on de l'enveloppe de 450 € ?
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Mon accompagnement technique et la programmation de l'application sont assurés <strong>bénévolement</strong> dans le cadre de la classe d'Antoine. L'hébergement de l'application sur la plateforme Vercel est également <strong>100% gratuit à vie</strong>.
            </p>
            <p className="text-xs text-amber-800 bg-amber-50/70 p-3 rounded-xl border border-amber-200/50">
              💡 <strong>Idée d'utilisation de l'enveloppe</strong> : Ce budget pourra servir directement pour les enfants : impression de panneaux étanches sur la plage, confection de badges de "Gardiens de l'AME", achat de loupes botaniques ou financement de matériel pour leurs sorties.
            </p>
          </div>

          {/* Question 2: Smartphones / Matériel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Les élèves ont-ils besoin de téléphones ?
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>Pas du tout.</strong> L'application sera conçue comme une « Progressive Web App » (application web moderne). Elle fonctionne directement sur n'importe quel écran :
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Sur le <strong>vidéoprojecteur / TBI</strong> de la classe pour les jeux et quiz collectifs.</li>
              <li>Sur les <strong>tablettes de l'école</strong> si vous en disposez.</li>
              <li>À la maison sur l'ordinateur ou le smartphone des parents via un simple lien web.</li>
            </ul>
          </div>

          {/* Question 3: RGPD & Vie privée */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Respect de la vie privée des enfants (RGPD)
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              La conformité avec les règles scolaires et le RGPD est totale :
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Aucun compte nominatif ni adresse e-mail n'est exigé pour jouer.</li>
              <li>Aucune publicité ni pistage commercial.</li>
              <li>Pour les voix ou dessins enregistrés, seuls les prénoms des enfants sont mentionnés (avec autorisation parentale usuelle de l'école).</li>
            </ul>
          </div>

          {/* Question 4: Pérennité & Années suivantes */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                L'application servira-t-elle l'année prochaine ?
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              C'est tout l'intérêt de la démarche AME : <strong>la passation entre générations d'écoliers</strong>. L'application restera en ligne et pourra être enrichie d'année en année par les futures promotions de CM2 (nouvelles plantes répertoriées, nouvelles questions de quiz, nouveaux enregistrements audio).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
