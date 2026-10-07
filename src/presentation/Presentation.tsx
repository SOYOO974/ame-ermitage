import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronLeft, ChevronRight, Maximize, Minimize, Minus, Plus, RotateCcw,
  Search, Palette, Music, ShieldCheck, Lock, Crown, HandHelping,
  Footprints, Cigarette, Sun, Trash2, Waves, Smile, Clock, Users,
  Brush, PenLine, Mic, Camera, Trophy
} from 'lucide-react';
import { PROJECT_IDEAS } from '../data/ideas';
import type { ProjectIdea } from '../data/ideas';

const STAGE_W = 1600;
const STAGE_H = 900;
// Même clé que la page principale : les votes saisis ici apparaissent aussi sur "/".
const VOTES_KEY = 'ame_classroom_votes';

type Votes = Record<string, number>;

const readVotes = (): Votes => {
  try {
    return JSON.parse(localStorage.getItem(VOTES_KEY) || '{}');
  } catch {
    return {};
  }
};

// Empêche les boutons de garder le focus, sinon Espace / Entrée les re-déclencheraient
// au lieu de passer à la diapo suivante.
const noFocus = (e: React.MouseEvent) => e.preventDefault();

/* ------------------------------------------------------------------ */
/* Briques visuelles                                                   */
/* ------------------------------------------------------------------ */

const Kicker: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({ children, dark }) => (
  <div className={`self-start inline-flex items-center gap-3 px-5 py-2 rounded-full text-[22px] font-bold uppercase tracking-[0.12em] ${
    dark ? 'bg-white/10 text-teal-200 border border-white/15' : 'bg-teal-100 text-teal-800'
  }`}>
    {children}
  </div>
);

const SlideTitle: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({ children, dark }) => (
  <h2 className={`text-[68px] leading-[1.05] font-extrabold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
    {children}
  </h2>
);

const LightSlide: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full h-full bg-[#fdfbf7] px-[110px] py-[80px] flex flex-col">{children}</div>
);

const DarkSlide: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`w-full h-full bg-gradient-to-br from-slate-900 via-teal-950 to-cyan-950 text-white px-[110px] py-[80px] flex flex-col relative overflow-hidden ${className}`}>
    <WaveDecor />
    <div className="relative flex flex-col h-full">{children}</div>
  </div>
);

const WaveDecor: React.FC = () => (
  <svg className="absolute bottom-0 left-0 w-full pointer-events-none" viewBox="0 0 1600 220" preserveAspectRatio="none" aria-hidden>
    <path d="M0 120 C 260 60 520 180 800 120 S 1340 60 1600 120 V220 H0 Z" fill="rgba(45,212,191,0.10)" />
    <path d="M0 160 C 300 110 560 210 860 160 S 1380 110 1600 160 V220 H0 Z" fill="rgba(45,212,191,0.14)" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Diapositives                                                        */
/* ------------------------------------------------------------------ */

const TitleSlide: React.FC = () => (
  <DarkSlide className="justify-center">
    <div className="flex flex-col h-full justify-center">
      <div className="text-[120px] leading-none mb-6">🌊🐠🌿</div>
      <Kicker dark>Aire Marine Éducative de l'Ermitage</Kicker>
      <h1 className="text-[118px] leading-[1] font-extrabold tracking-tight mt-8">
        Les Gardiens<br />du Lagon
      </h1>
      <p className="text-[40px] text-teal-100/90 mt-8 max-w-[1150px] leading-snug">
        L'intelligence artificielle au service de notre plage… et c'est vous qui choisissez le projet !
      </p>
      <p className="text-[26px] text-teal-200/70 mt-auto">
        Classe de CM2 de Madame Pavillon · École de l'Ermitage-les-Bains · avec Julien, le papa d'Antoine
      </p>
    </div>
  </DarkSlide>
);

const AgendaSlide: React.FC = () => {
  const steps = [
    { emoji: '🤖', title: "C'est quoi, l'intelligence artificielle ?", time: '15 min' },
    { emoji: '🗂️', title: 'Découvrir les 5 projets', time: '20 min' },
    { emoji: '🗳️', title: 'Le Conseil des enfants pour la mer : on débat et on vote', time: '15 min' },
    { emoji: '🚀', title: 'On se répartit les rôles', time: '10 min' },
  ];
  return (
    <LightSlide>
      <Kicker>Au programme</Kicker>
      <div className="mt-6"><SlideTitle>Ce qu'on va faire aujourd'hui</SlideTitle></div>
      <div className="grid grid-cols-2 gap-8 mt-12 flex-1">
        {steps.map((s, i) => (
          <div key={s.title} className="bg-white rounded-[32px] border-2 border-slate-200 p-9 flex items-center gap-8 shadow-sm">
            <div className="shrink-0 w-[96px] h-[96px] rounded-3xl bg-teal-600 text-white text-[52px] font-extrabold flex items-center justify-center">
              {i + 1}
            </div>
            <div>
              <div className="text-[36px] font-bold text-slate-900 leading-tight"><span className="mr-3">{s.emoji}</span>{s.title}</div>
              <div className="text-[26px] font-semibold text-teal-700 mt-3">{s.time}</div>
            </div>
          </div>
        ))}
      </div>
    </LightSlide>
  );
};

const WhatIsAiSlide: React.FC = () => (
  <LightSlide>
    <Kicker>Partie 1 · L'intelligence artificielle</Kicker>
    <div className="mt-6"><SlideTitle>C'est quoi, une IA ?</SlideTitle></div>
    <div className="mt-10 bg-teal-700 text-white rounded-[32px] px-12 py-10 text-[44px] font-bold leading-snug">
      Un programme d'ordinateur qui a appris en regardant des millions d'exemples.
    </div>
    <div className="grid grid-cols-2 gap-10 mt-10 flex-1">
      <div className="bg-rose-50 border-2 border-rose-200 rounded-[32px] p-10">
        <div className="text-[34px] font-extrabold text-rose-700 mb-6">❌ Ce n'est PAS…</div>
        <ul className="space-y-5 text-[32px] text-slate-800 font-medium">
          <li>🤖 un robot qui pense tout seul</li>
          <li>🧠 un cerveau magique</li>
          <li>📚 quelqu'un qui sait tout</li>
        </ul>
      </div>
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-[32px] p-10">
        <div className="text-[34px] font-extrabold text-emerald-700 mb-6">✅ C'est…</div>
        <ul className="space-y-5 text-[32px] text-slate-800 font-medium">
          <li>🔎 un champion pour repérer des ressemblances</li>
          <li>💡 un assistant qui propose des idées</li>
          <li>⚠️ un outil qui peut se tromper</li>
        </ul>
      </div>
    </div>
  </LightSlide>
);

const HowItLearnsSlide: React.FC = () => {
  const steps = [
    { emoji: '🖼️', title: 'On lui montre des exemples', text: '10 000 photos avec l\'étiquette « poisson-clown »' },
    { emoji: '🔍', title: 'Elle repère les points communs', text: 'Orange, 3 bandes blanches, vit dans une anémone' },
    { emoji: '🎯', title: 'Elle devine sur une photo nouvelle', text: '« Je pense que c\'est un poisson-clown… à 97 % »' },
  ];
  return (
    <LightSlide>
      <Kicker>Partie 1 · L'intelligence artificielle</Kicker>
      <div className="mt-6"><SlideTitle>Comment une IA apprend-elle ?</SlideTitle></div>
      <div className="flex items-stretch gap-6 mt-14">
        {steps.map((s, i) => (
          <React.Fragment key={s.title}>
            <div className="flex-1 bg-white border-2 border-slate-200 rounded-[32px] p-10 shadow-sm">
              <div className="text-[80px] leading-none">{s.emoji}</div>
              <div className="text-[22px] font-bold uppercase tracking-widest text-teal-700 mt-6">Étape {i + 1}</div>
              <div className="text-[36px] font-extrabold text-slate-900 mt-2 leading-tight">{s.title}</div>
              <div className="text-[28px] text-slate-600 mt-4 leading-snug">{s.text}</div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex items-center text-teal-500"><ChevronRight className="w-16 h-16" strokeWidth={3} /></div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-auto bg-amber-100 border-2 border-amber-300 rounded-[28px] px-10 py-7 text-[32px] font-semibold text-amber-900">
        🌿 Comme vous quand vous apprenez à reconnaître les plantes de la plage !
      </div>
    </LightSlide>
  );
};

const DemosSlide: React.FC = () => {
  const demos = [
    { Icon: Search, color: 'bg-sky-500', title: 'Reconnaître', text: 'On prend en photo une plante du lagon : l\'IA devine son nom.' },
    { Icon: Palette, color: 'bg-fuchsia-500', title: 'Dessiner', text: 'On invente ensemble le super-héros protecteur du récif.' },
    { Icon: Music, color: 'bg-amber-500', title: 'Composer', text: 'Vos rimes deviennent un refrain en quelques secondes.' },
  ];
  return (
    <DarkSlide>
      <Kicker dark>Partie 1 · En direct</Kicker>
      <div className="mt-6"><SlideTitle dark>Ce que l'IA sait faire</SlideTitle></div>
      <div className="grid grid-cols-3 gap-8 mt-14">
        {demos.map(({ Icon, color, title, text }) => (
          <div key={title} className="bg-white/[0.07] border border-white/15 rounded-[32px] p-10 backdrop-blur">
            <div className={`w-[110px] h-[110px] rounded-3xl ${color} flex items-center justify-center`}>
              <Icon className="w-14 h-14 text-white" strokeWidth={2.4} />
            </div>
            <div className="text-[46px] font-extrabold mt-8">{title}</div>
            <div className="text-[30px] text-teal-50/85 mt-4 leading-snug">{text}</div>
            <div className="inline-flex mt-8 px-4 py-1.5 rounded-full bg-rose-500 text-[20px] font-bold uppercase tracking-widest">
              ● Démo en direct
            </div>
          </div>
        ))}
      </div>
    </DarkSlide>
  );
};

const TrueFalseSlide: React.FC = () => {
  const items = [
    { q: 'L\'IA réfléchit et ressent des émotions comme nous.', answer: false, why: 'Elle calcule. Elle ne ressent rien.' },
    { q: 'L\'IA peut se tromper.', answer: true, why: 'Oui ! Il faut toujours vérifier.' },
    { q: 'L\'IA connaît déjà toutes les plantes de notre plage.', answer: false, why: 'Les vraies observations, c\'est vous qui les ferez sur le terrain.' },
    { q: 'Une IA m\'aide à fabriquer votre application.', answer: true, why: 'Mais les idées, les dessins et les voix… ce sera vous !' },
  ];
  const [revealed, setRevealed] = useState<boolean[]>(items.map(() => false));
  return (
    <LightSlide>
      <Kicker>Partie 1 · Jeu</Kicker>
      <div className="mt-6 flex items-end justify-between">
        <SlideTitle>Vrai ou faux ?</SlideTitle>
        <div className="text-[24px] text-slate-500 font-medium pb-3">Cliquez sur une carte pour la réponse</div>
      </div>
      <div className="grid grid-cols-2 gap-8 mt-12 flex-1">
        {items.map((item, i) => {
          const open = revealed[i];
          return (
            <button
              key={item.q}
              onMouseDown={noFocus}
              onClick={() => setRevealed(r => r.map((v, j) => (j === i ? !v : v)))}
              className={`text-left rounded-[32px] p-10 border-[3px] transition-all duration-300 ${
                !open ? 'bg-white border-slate-200 hover:border-teal-400'
                  : item.answer ? 'bg-emerald-50 border-emerald-400' : 'bg-rose-50 border-rose-400'
              }`}
            >
              <div className="text-[36px] font-bold text-slate-900 leading-snug">« {item.q} »</div>
              {open ? (
                <div className="mt-6 flex items-center gap-5">
                  <span className={`px-6 py-2 rounded-2xl text-[32px] font-extrabold text-white ${item.answer ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                    {item.answer ? 'VRAI' : 'FAUX'}
                  </span>
                  <span className="text-[28px] text-slate-700 font-medium leading-snug">{item.why}</span>
                </div>
              ) : (
                <div className="mt-6 text-[28px] text-slate-400 font-semibold">✋ Levez la main : vrai ou faux ?</div>
              )}
            </button>
          );
        })}
      </div>
    </LightSlide>
  );
};

const GoldenRulesSlide: React.FC = () => {
  const rules = [
    { Icon: ShieldCheck, title: 'Je vérifie', text: 'L\'IA peut inventer des choses fausses.' },
    { Icon: Lock, title: 'Je protège mes infos', text: 'Jamais mon nom, mon adresse ou ma photo.' },
    { Icon: Crown, title: 'C\'est moi le chef', text: 'L\'IA propose, c\'est moi qui décide.' },
    { Icon: HandHelping, title: 'Je demande à un adulte', text: 'En cas de doute, je ne reste pas seul.' },
  ];
  return (
    <LightSlide>
      <Kicker>Partie 1 · À retenir</Kicker>
      <div className="mt-6"><SlideTitle>Les 4 règles d'or de l'IA</SlideTitle></div>
      <div className="grid grid-cols-4 gap-7 mt-14 flex-1">
        {rules.map(({ Icon, title, text }, i) => (
          <div key={title} className="bg-white border-2 border-slate-200 rounded-[32px] p-9 flex flex-col shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-[96px] h-[96px] rounded-3xl bg-teal-600 flex items-center justify-center">
                <Icon className="w-12 h-12 text-white" strokeWidth={2.4} />
              </div>
              <span className="text-[72px] font-extrabold text-slate-200">{i + 1}</span>
            </div>
            <div className="text-[38px] font-extrabold text-slate-900 mt-8 leading-tight">{title}</div>
            <div className="text-[28px] text-slate-600 mt-4 leading-snug">{text}</div>
          </div>
        ))}
      </div>
    </LightSlide>
  );
};

const LagoonSlide: React.FC = () => {
  const threats = [
    { Icon: Footprints, text: 'On marche sur les coraux à marée basse' },
    { Icon: Cigarette, text: 'Des mégots cachés dans le sable sous les filaos' },
    { Icon: Sun, text: 'Certaines crèmes solaires abîment les coraux' },
    { Icon: Trash2, text: 'Des déchets de pique-nique et des ravines' },
  ];
  return (
    <DarkSlide>
      <Kicker dark>Partie 2 · Notre mission</Kicker>
      <div className="mt-6"><SlideTitle dark>Notre lagon a besoin de gardiens</SlideTitle></div>
      <div className="grid grid-cols-2 gap-7 mt-12">
        {threats.map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-7 bg-white/[0.07] border border-white/15 rounded-[28px] px-9 py-8">
            <div className="shrink-0 w-[88px] h-[88px] rounded-2xl bg-rose-500/90 flex items-center justify-center">
              <Icon className="w-11 h-11 text-white" strokeWidth={2.4} />
            </div>
            <div className="text-[32px] font-semibold leading-snug">{text}</div>
          </div>
        ))}
      </div>
      <div className="mt-auto text-[48px] font-extrabold text-teal-200 leading-tight">
        Et si on fabriquait un outil numérique pour le protéger ? 💪
      </div>
    </DarkSlide>
  );
};

const OverviewSlide: React.FC = () => (
  <LightSlide>
    <Kicker>Partie 2 · Les projets</Kicker>
    <div className="mt-6"><SlideTitle>5 projets… 1 seul gagnant !</SlideTitle></div>
    <div className="grid grid-cols-5 gap-6 mt-12 flex-1">
      {PROJECT_IDEAS.map(idea => (
        <div key={idea.id} className="bg-white rounded-[28px] border-2 border-slate-200 overflow-hidden shadow-sm">
          <div className="relative">
            <img src={idea.imageUrl} alt="" className="w-full h-[380px] object-cover" />
            <div className="absolute top-4 left-4 w-[64px] h-[64px] rounded-2xl bg-teal-600 text-white text-[36px] font-extrabold flex items-center justify-center shadow-lg">
              {idea.number}
            </div>
          </div>
          <div className="p-6 text-[30px] font-extrabold text-slate-900 leading-tight">{idea.title}</div>
        </div>
      ))}
    </div>
  </LightSlide>
);

const investmentLabel = (idea: ProjectIdea) =>
  idea.classroomInvestment === '1 séance' ? '⚡ 1 séance'
    : idea.classroomInvestment === '2 à 3 séances' ? '🌱 2 à 3 séances'
      : '🏆 Toute l\'année';

const ProjectSlide: React.FC<{ idea: ProjectIdea }> = ({ idea }) => (
  <div className="w-full h-full bg-[#fdfbf7] flex">
    <div className="relative w-[720px] h-full shrink-0">
      <img src={idea.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#fdfbf7]/10" />
      <div className="absolute top-[70px] left-[70px] w-[130px] h-[130px] rounded-[32px] bg-teal-600 text-white text-[84px] font-extrabold flex items-center justify-center shadow-2xl">
        {idea.number}
      </div>
    </div>
    <div className="flex-1 px-[80px] py-[70px] flex flex-col">
      <Kicker>Projet {idea.number} sur 5</Kicker>
      <h2 className="text-[60px] leading-[1.05] font-extrabold tracking-tight text-slate-900 mt-6">{idea.title}</h2>
      <p className="text-[30px] text-slate-700 mt-6 leading-snug">{idea.summary}</p>
      <div className="mt-8 bg-teal-50 border-2 border-teal-200 rounded-[28px] p-7">
        <div className="text-[22px] font-bold uppercase tracking-widest text-teal-700">Ce que vous ferez</div>
        <div className="text-[27px] text-slate-800 mt-2 leading-snug">{idea.studentContribution}</div>
      </div>
      <div className="mt-auto flex flex-wrap gap-3">
        <span className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-[24px] font-bold">{investmentLabel(idea)}</span>
        {idea.highlightPoints.slice(0, 2).map(h => (
          <span key={h} className="px-5 py-2.5 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 text-[22px] font-semibold">{h}</span>
        ))}
      </div>
    </div>
  </div>
);

const CriteriaSlide: React.FC = () => {
  const criteria = [
    { Icon: Waves, color: 'bg-sky-500', title: 'Utile ?', text: 'Est-ce que ça aide vraiment le lagon ?' },
    { Icon: Smile, color: 'bg-amber-500', title: 'Amusant ?', text: 'Est-ce qu\'on aura envie de l\'utiliser ?' },
    { Icon: Clock, color: 'bg-emerald-500', title: 'Faisable ?', text: 'Est-ce qu\'on peut le réaliser cette année ?' },
  ];
  return (
    <LightSlide>
      <Kicker>Partie 3 · Le Conseil des enfants pour la mer</Kicker>
      <div className="mt-6"><SlideTitle>Comment bien choisir ?</SlideTitle></div>
      <div className="grid grid-cols-3 gap-8 mt-14">
        {criteria.map(({ Icon, color, title, text }) => (
          <div key={title} className="bg-white border-2 border-slate-200 rounded-[32px] p-10 shadow-sm">
            <div className={`w-[110px] h-[110px] rounded-3xl ${color} flex items-center justify-center`}>
              <Icon className="w-14 h-14 text-white" strokeWidth={2.4} />
            </div>
            <div className="text-[50px] font-extrabold text-slate-900 mt-8">{title}</div>
            <div className="text-[32px] text-slate-600 mt-3 leading-snug">{text}</div>
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-6 bg-slate-900 text-white rounded-[28px] px-10 py-7">
        <Users className="w-12 h-12 text-teal-300 shrink-0" />
        <div className="text-[32px] font-semibold">Chacun peut donner son avis. On s'écoute, on lève la main.</div>
      </div>
    </LightSlide>
  );
};

const VoteSlide: React.FC<{ votes: Votes; onAdd: (id: string) => void; onRemove: (id: string) => void; onReset: () => void }> = ({ votes, onAdd, onRemove, onReset }) => {
  const total = Object.values(votes).reduce((s, v) => s + v, 0);
  const max = Math.max(1, ...PROJECT_IDEAS.map(i => votes[i.id] || 0));
  return (
    <DarkSlide>
      <div className="flex items-end justify-between">
        <div>
          <Kicker dark>Partie 3 · Le vote</Kicker>
          <div className="mt-6"><SlideTitle dark>À vous de voter ! 🗳️</SlideTitle></div>
        </div>
        <div className="text-right pb-2">
          <div className="text-[64px] font-extrabold leading-none">{total}</div>
          <div className="text-[24px] text-teal-200/80 font-semibold">voix</div>
        </div>
      </div>
      <div className="mt-8 space-y-3">
        {PROJECT_IDEAS.map(idea => {
          const v = votes[idea.id] || 0;
          return (
            <div key={idea.id} className="flex items-center gap-6 bg-white/[0.07] border border-white/15 rounded-[24px] p-3 pr-5">
              <img src={idea.imageUrl} alt="" className="w-[122px] h-[68px] rounded-xl object-cover shrink-0" />
              <div className="w-[56px] h-[56px] rounded-2xl bg-teal-500 text-[32px] font-extrabold flex items-center justify-center shrink-0">{idea.number}</div>
              <div className="w-[560px] shrink-0 text-[30px] font-bold leading-tight">{idea.title}</div>
              <div className="flex-1 h-[44px] bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-300 rounded-full transition-all duration-500" style={{ width: `${(v / max) * 100}%` }} />
              </div>
              <div className="w-[80px] text-right text-[44px] font-extrabold tabular-nums">{v}</div>
              <button onMouseDown={noFocus} onClick={() => onRemove(idea.id)} className="w-[56px] h-[56px] rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label={`Retirer une voix au projet ${idea.number}`}>
                <Minus className="w-7 h-7" />
              </button>
              <button onMouseDown={noFocus} onClick={() => onAdd(idea.id)} className="w-[64px] h-[64px] rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-900 flex items-center justify-center" aria-label={`Ajouter une voix au projet ${idea.number}`}>
                <Plus className="w-9 h-9" strokeWidth={3} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-auto flex items-center justify-between text-[22px] text-teal-100/60">
        <span>Raccourcis : touches 1 à 5 pour ajouter une voix · Maj + chiffre pour en retirer une</span>
        <button onMouseDown={noFocus} onClick={onReset} className="inline-flex items-center gap-2 hover:text-white">
          <RotateCcw className="w-5 h-5" /> Remettre à zéro
        </button>
      </div>
    </DarkSlide>
  );
};

const ResultSlide: React.FC<{ votes: Votes }> = ({ votes }) => {
  const max = Math.max(0, ...PROJECT_IDEAS.map(i => votes[i.id] || 0));
  const winners = max > 0 ? PROJECT_IDEAS.filter(i => (votes[i.id] || 0) === max) : [];

  useEffect(() => {
    if (winners.length === 0) return;
    const t = setTimeout(() => confetti({ particleCount: 160, spread: 100, origin: { y: 0.55 } }), 350);
    return () => clearTimeout(t);
    // Une seule salve à l'arrivée sur la diapo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roles = [
    { Icon: Brush, title: 'Illustrateurs' },
    { Icon: PenLine, title: 'Rédacteurs' },
    { Icon: Mic, title: 'Voix' },
    { Icon: Camera, title: 'Reporters photo' },
  ];

  return (
    <DarkSlide>
      <Kicker dark>Partie 4 · Le résultat</Kicker>
      <div className="flex gap-12 mt-8 flex-1">
        <div className="flex-1 flex flex-col">
          {winners.length === 0 && (
            <div className="text-[56px] font-extrabold text-teal-100/70 mt-10">Le vote n'a pas encore eu lieu…</div>
          )}
          {winners.length === 1 && (
            <>
              <div className="flex items-center gap-4 text-amber-300 text-[34px] font-bold"><Trophy className="w-12 h-12" /> Le projet élu par la classe</div>
              <div className="mt-6 rounded-[32px] overflow-hidden border-4 border-amber-300 shadow-2xl">
                <img src={winners[0].imageUrl} alt="" className="w-full h-[360px] object-cover" />
              </div>
              <div className="text-[58px] font-extrabold leading-tight mt-6">{winners[0].title}</div>
              <div className="text-[28px] text-teal-200/80 mt-2">{max} voix</div>
            </>
          )}
          {winners.length > 1 && (
            <>
              <div className="flex items-center gap-4 text-amber-300 text-[34px] font-bold"><Trophy className="w-12 h-12" /> Égalité ! {max} voix chacun</div>
              <div className="mt-8 space-y-5">
                {winners.map(w => (
                  <div key={w.id} className="flex items-center gap-6 bg-white/[0.08] rounded-[24px] p-4 border border-amber-300/50">
                    <img src={w.imageUrl} alt="" className="w-[200px] h-[112px] rounded-2xl object-cover" />
                    <div className="text-[38px] font-extrabold leading-tight">{w.title}</div>
                  </div>
                ))}
              </div>
              <div className="text-[30px] text-teal-100/80 mt-8">On revote entre ces projets !</div>
            </>
          )}
        </div>
        <div className="w-[520px] shrink-0 flex flex-col">
          <div className="text-[34px] font-bold text-teal-200">Et maintenant, on se répartit les rôles :</div>
          <div className="grid grid-cols-2 gap-5 mt-6">
            {roles.map(({ Icon, title }) => (
              <div key={title} className="bg-white/[0.08] border border-white/15 rounded-[24px] p-7 flex flex-col items-start gap-4">
                <Icon className="w-12 h-12 text-teal-300" />
                <div className="text-[30px] font-bold leading-tight">{title}</div>
              </div>
            ))}
          </div>
          <div className="mt-auto text-[46px] font-extrabold leading-tight">Merci, Gardiens du Lagon ! 🐢</div>
        </div>
      </div>
    </DarkSlide>
  );
};

/* ------------------------------------------------------------------ */
/* Lecteur de diapositives                                             */
/* ------------------------------------------------------------------ */

const slideFromHash = (count: number) => {
  const n = parseInt(window.location.hash.replace('#', ''), 10);
  return Number.isFinite(n) && n >= 1 && n <= count ? n - 1 : 0;
};

export const Presentation: React.FC = () => {
  const [votes, setVotes] = useState<Votes>(readVotes);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const addVote = useCallback((id: string) => {
    setVotes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.85 } });
  }, []);

  const removeVote = useCallback((id: string) => {
    setVotes(prev => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: current - 1 };
    });
  }, []);

  const resetVotes = useCallback(() => {
    if (window.confirm('Remettre tous les votes à zéro ?')) setVotes({});
  }, []);

  const slides: { key: string; node: React.ReactNode }[] = [
    { key: 'titre', node: <TitleSlide /> },
    { key: 'programme', node: <AgendaSlide /> },
    { key: 'ia', node: <WhatIsAiSlide /> },
    { key: 'apprentissage', node: <HowItLearnsSlide /> },
    { key: 'demos', node: <DemosSlide /> },
    { key: 'vrai-faux', node: <TrueFalseSlide /> },
    { key: 'regles', node: <GoldenRulesSlide /> },
    { key: 'lagon', node: <LagoonSlide /> },
    { key: 'apercu', node: <OverviewSlide /> },
    ...PROJECT_IDEAS.map(idea => ({ key: idea.id, node: <ProjectSlide idea={idea} /> })),
    { key: 'criteres', node: <CriteriaSlide /> },
    { key: 'vote', node: <VoteSlide votes={votes} onAdd={addVote} onRemove={removeVote} onReset={resetVotes} /> },
    { key: 'resultat', node: <ResultSlide votes={votes} /> },
  ];
  const count = slides.length;
  const voteIndex = slides.findIndex(s => s.key === 'vote');

  const [index, setIndex] = useState(() => slideFromHash(count));

  const go = useCallback((target: number) => {
    setIndex(Math.max(0, Math.min(count - 1, target)));
  }, [count]);

  useEffect(() => {
    document.title = 'Les Gardiens du Lagon · Présentation';
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
    } catch { /* stockage indisponible : les votes restent en mémoire */ }
  }, [votes]);

  // Synchronise si la page principale est ouverte dans un autre onglet.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === VOTES_KEY) setVotes(readVotes());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    history.replaceState(null, '', `#${index + 1}`);
  }, [index]);

  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Les télécommandes de présentation envoient PageDown / PageUp.
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
        go(index + 1);
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === 'Home') {
        go(0);
      } else if (e.key === 'End') {
        go(count - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (index === voteIndex && /^Digit[1-9]$/.test(e.code)) {
        const idea = PROJECT_IDEAS[Number(e.code.slice(5)) - 1];
        if (idea) (e.shiftKey ? removeVote : addVote)(idea.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, count, voteIndex, go, toggleFullscreen, addVote, removeVote]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none font-['Plus_Jakarta_Sans',ui-sans-serif,system-ui,sans-serif] group">
      <div
        className="absolute top-1/2 left-1/2 overflow-hidden"
        style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        <div key={slides[index].key} className="w-full h-full animate-[slideIn_350ms_ease-out]">
          {slides[index].node}
        </div>
        {/* Barre de progression */}
        <div className="absolute bottom-0 left-0 h-[8px] bg-teal-400 transition-all duration-300" style={{ width: `${((index + 1) / count) * 100}%` }} />
      </div>

      {/* Contrôles discrets, visibles au survol */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onMouseDown={noFocus} onClick={() => go(index - 1)} disabled={index === 0} className="p-2 rounded-lg bg-white/90 text-slate-900 disabled:opacity-40" aria-label="Diapositive précédente">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-sm font-bold tabular-nums">{index + 1} / {count}</span>
        <button onMouseDown={noFocus} onClick={() => go(index + 1)} disabled={index === count - 1} className="p-2 rounded-lg bg-white/90 text-slate-900 disabled:opacity-40" aria-label="Diapositive suivante">
          <ChevronRight className="w-5 h-5" />
        </button>
        <button onMouseDown={noFocus} onClick={toggleFullscreen} className="p-2 rounded-lg bg-white/90 text-slate-900" aria-label="Plein écran (touche F)">
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default Presentation;
