import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronLeft, ChevronRight, Maximize, Minimize, Minus, Plus, RotateCcw,
  Copy, Check, Eye, EyeOff, MessageCircle,
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

const GUESS_ITEMS = [
  { emoji: '📱', text: 'Le téléphone qui reconnaît ton visage' },
  { emoji: '⌨️', text: 'Le clavier qui devine le mot suivant' },
  { emoji: '🗺️', text: 'Le GPS qui trouve le chemin le plus rapide' },
  { emoji: '📺', text: 'La vidéo suivante proposée par YouTube' },
  { emoji: '🗣️', text: '« Dis Siri, quel temps fait-il ? »' },
  { emoji: '🐶', text: 'Le filtre photo qui ajoute des oreilles' },
];
// Un indice par étape, puis la réponse.
const GUESS_STEPS = GUESS_ITEMS.length + 1;

const GuessSlide: React.FC<{ step: number; onNext: () => void }> = ({ step, onNext }) => {
  const shown = Math.min(step, GUESS_ITEMS.length);
  const answer = step >= GUESS_STEPS;
  return (
    <div className="w-full h-full cursor-pointer" onClick={onNext}>
      <DarkSlide>
        <Kicker dark>Devinette</Kicker>
        <div className="mt-6"><SlideTitle dark>Quel est leur point commun ? 🤔</SlideTitle></div>
        <div className="grid grid-cols-3 gap-6 mt-10">
          {GUESS_ITEMS.map((item, i) => (
            <div
              key={item.text}
              className={`h-[180px] rounded-[28px] border flex flex-col items-center justify-center text-center px-6 transition-all duration-500 ${
                i < shown ? 'bg-white/[0.09] border-white/20' : 'bg-white/[0.03] border-dashed border-white/15'
              }`}
            >
              {i < shown ? (
                <>
                  <div className="text-[76px] leading-none">{item.emoji}</div>
                  <div className="text-[27px] font-bold mt-3 leading-tight">{item.text}</div>
                </>
              ) : (
                <div className="text-[90px] font-extrabold text-white/15">?</div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-auto">
          {answer ? (
            <div className="bg-teal-400 text-slate-900 rounded-[28px] px-10 py-6 animate-[slideIn_400ms_ease-out]">
              <div className="text-[46px] font-extrabold leading-tight">Ils utilisent tous l'intelligence artificielle ! 🤖</div>
              <div className="text-[28px] font-semibold mt-1">Un programme d'ordinateur qui a appris en regardant des millions d'exemples.</div>
            </div>
          ) : (
            <div className="text-[24px] text-teal-100/50">Cliquez pour l'indice suivant</div>
          )}
        </div>
      </DarkSlide>
    </div>
  );
};

const HeroDemoSlide: React.FC = () => {
  const [animal, setAnimal] = useState('');
  const [power, setPower] = useState('');
  const [outfit, setOutfit] = useState('');
  const [copied, setCopied] = useState(false);

  const prompt = `Dessine le super-héros protecteur du lagon de l'Ermitage, à La Réunion : c'est ${animal.trim() || '…'} qui a le pouvoir de ${power.trim() || '…'} et qui porte ${outfit.trim() || '…'}. Style dessin animé joyeux et coloré, sous l'eau, entouré de coraux et de poissons tropicaux.`;

  const copy = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  const fields = [
    { label: "C'est…", placeholder: 'une tortue de mer', value: animal, set: setAnimal },
    { label: 'qui a le pouvoir de…', placeholder: 'nettoyer la plage en un éclair', value: power, set: setPower },
    { label: 'et qui porte…', placeholder: 'une cape en feuilles de veloutier', value: outfit, set: setOutfit },
  ];

  return (
    <LightSlide>
      <div className="flex items-center gap-4">
        <Kicker>Démo en direct</Kicker>
        <span className="px-4 py-1.5 rounded-full bg-rose-500 text-white text-[20px] font-bold uppercase tracking-widest">● Gemini</span>
      </div>
      <div className="mt-6"><SlideTitle>Inventons le super-héros du récif !</SlideTitle></div>
      <div className="mt-10 space-y-5">
        {fields.map(f => (
          <label key={f.label} className="flex items-center gap-8">
            <span className="w-[380px] shrink-0 text-[36px] font-bold text-slate-700 text-right">{f.label}</span>
            <input
              value={f.value}
              onChange={e => f.set(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') (e.target as HTMLInputElement).blur(); }}
              placeholder={f.placeholder}
              className="flex-1 bg-white border-[3px] border-slate-200 focus:border-teal-500 outline-none rounded-[24px] px-7 py-4 text-[38px] font-bold text-teal-800 placeholder:text-slate-300 placeholder:font-semibold"
            />
          </label>
        ))}
      </div>
      <div className="mt-auto flex items-stretch gap-6">
        <div className="flex-1 bg-slate-900 text-slate-100 rounded-[24px] px-8 py-5 text-[22px] leading-snug">
          <span className="text-teal-300 font-bold">La phrase pour l'IA : </span>{prompt}
        </div>
        <button
          onMouseDown={noFocus}
          onClick={copy}
          className={`w-[230px] shrink-0 rounded-[24px] text-[28px] font-extrabold flex flex-col items-center justify-center gap-2 transition-colors ${
            copied ? 'bg-emerald-500 text-white' : 'bg-teal-400 hover:bg-teal-300 text-slate-900'
          }`}
        >
          {copied ? <Check className="w-10 h-10" /> : <Copy className="w-10 h-10" />}
          {copied ? 'Copié !' : 'Copier'}
        </button>
      </div>
    </LightSlide>
  );
};

const TRUE_FALSE = [
  {
    q: 'L\'IA peut se tromper.',
    answer: true,
    fact: 'Quand elle ne connaît pas la réponse, une IA peut en inventer une… avec beaucoup d\'assurance ! On appelle ça une « hallucination ».',
    rule: 'Je vérifie toujours, dans un livre ou avec un adulte.',
  },
  {
    q: 'En regardant bien, on voit toujours si une photo a été faite par une IA.',
    answer: false,
    fact: 'Aujourd\'hui, les images fabriquées par IA sont si réalistes que même les experts se font piéger.',
    rule: 'Je demande d\'où vient l\'image et qui l\'a prise.',
  },
  {
    q: 'Je peux donner mon nom et mon adresse à une IA.',
    answer: false,
    fact: 'Ce que tu écris à une IA peut être enregistré, puis relu par d\'autres personnes.',
    rule: 'Jamais mon nom, mon adresse ou ma photo. En cas de doute, je demande à un adulte.',
  },
  {
    q: 'Cette présentation a été fabriquée avec l\'aide d\'une IA.',
    answer: true,
    fact: 'Le site des projets et ces diapos ont été construits avec une IA qui écrit le code, comme un assistant très rapide.',
    rule: 'Mais les idées, les dessins et les voix… ce sera vous !',
  },
];
// Chaque question compte 2 temps : la question (les enfants votent), puis la réponse.
const TRUE_FALSE_STEPS = TRUE_FALSE.length * 2 - 1;

const TrueFalseSlide: React.FC<{ step: number; onNext: () => void }> = ({ step, onNext }) => {
  const current = Math.floor(step / 2);
  const revealed = step % 2 === 1;
  const item = TRUE_FALSE[current];
  return (
    <div className="w-full h-full cursor-pointer" onClick={onNext}>
      <LightSlide>
        <div className="flex items-center justify-between">
          <Kicker>Jeu · Vrai ou faux ?</Kicker>
          <div className="flex items-center gap-3">
            {TRUE_FALSE.map((t, i) => (
              <div
                key={t.q}
                className={`w-[52px] h-[52px] rounded-2xl text-[26px] font-extrabold flex items-center justify-center transition-colors ${
                  i < current || (i === current && revealed)
                    ? (t.answer ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white')
                    : i === current ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-400'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <div key={current} className="mt-10 animate-[slideIn_350ms_ease-out]">
          <div className="text-[60px] font-extrabold text-slate-900 leading-[1.12]">« {item.q} »</div>
        </div>

        <div className="mt-auto">
          {revealed ? (
            <div className="animate-[slideIn_350ms_ease-out]">
              <div className="flex items-start gap-8">
                <div className={`shrink-0 px-9 py-5 rounded-[28px] text-[64px] font-extrabold text-white leading-none ${item.answer ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                  {item.answer ? 'VRAI' : 'FAUX'}
                </div>
                <div className="pt-1">
                  <div className="text-[24px] font-bold uppercase tracking-widest text-teal-700">💡 Le savais-tu ?</div>
                  <div className="text-[34px] text-slate-800 font-medium leading-snug mt-2">{item.fact}</div>
                </div>
              </div>
              <div className="mt-8 bg-teal-700 text-white rounded-[28px] px-10 py-6 text-[34px] font-bold">
                👉 {item.rule}
              </div>
            </div>
          ) : (
            <div className="flex gap-8">
              <div className="flex-1 rounded-[32px] border-[3px] border-dashed border-emerald-300 bg-emerald-50 py-10 text-center text-[54px] font-extrabold text-emerald-600">✋ VRAI</div>
              <div className="flex-1 rounded-[32px] border-[3px] border-dashed border-rose-300 bg-rose-50 py-10 text-center text-[54px] font-extrabold text-rose-600">✋ FAUX</div>
            </div>
          )}
        </div>
      </LightSlide>
    </div>
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
      <Kicker dark>Notre mission</Kicker>
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
    <Kicker>Les projets</Kicker>
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

// Textes réécrits pour des enfants de CM2 (ideas.ts reste rédigé pour l'enseignante).
const KID_TEXT: Record<string, { pitch: string; todo: string; question: string }> = {
  'plantedex-lagon': {
    pitch: 'Chaque plante de la plage devient une carte à collectionner, avec ses points de vie et ses super-pouvoirs.',
    todo: 'Vous inventez les super-pouvoirs de chaque plante et vous dessinez les cartes.',
    question: 'Si tu étais une plante de la plage, quel serait ton super-pouvoir ?',
  },
  'arene-gardiens': {
    pitch: 'Un grand jeu de quiz en équipes sur le tableau, avec chrono, musique et classement des champions.',
    todo: 'Par deux, vous écrivez 2 ou 3 questions pièges sur le lagon. Ensuite, toute la classe joue !',
    question: 'Invente une question piège sur le lagon !',
  },
  'barometre-sante': {
    pitch: 'Le bulletin de santé du lagon, comme la météo : on suit son état pendant toute l\'année.',
    todo: 'Après chaque sortie, vous notez ce que vous avez vu : coraux, fleurs, déchets… Les graphiques montrent si le lagon va mieux.',
    question: 'À ton avis, le lagon est-il en bonne santé ? Donne-lui une note sur 10.',
  },
  'carnet-enquete': {
    pitch: 'Un carnet d\'explorateur sur tablette, qui remplace la feuille mouillée sur la plage.',
    todo: 'Par deux, vous y rangez vos photos, vos découvertes et vos missions réussies, toute l\'année.',
    question: 'Qu\'est-ce que tu aimerais noter après une sortie à la plage ?',
  },
  'sentier-numerique': {
    pitch: 'Des QR codes sur la plage : les promeneurs les scannent et entendent VOS voix expliquer les plantes.',
    todo: 'Vous écrivez un petit message de 30 secondes et vous l\'enregistrez avec votre voix.',
    question: 'Que dirais-tu à un touriste qui marche sur les coraux ?',
  },
};

const investmentLabel = (idea: ProjectIdea) =>
  idea.classroomInvestment === '1 séance' ? '⚡ 1 séance'
    : idea.classroomInvestment === '2 à 3 séances' ? '🌱 2 à 3 séances'
      : '🏆 Toute l\'année';

const ProjectSlide: React.FC<{ idea: ProjectIdea }> = ({ idea }) => {
  const kid = KID_TEXT[idea.id] ?? { pitch: idea.summary, todo: idea.studentContribution, question: '' };
  return (
    <div className="w-full h-full bg-[#fdfbf7] flex">
      <div className="relative w-[720px] h-full shrink-0">
        <img src={idea.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute top-[70px] left-[70px] w-[130px] h-[130px] rounded-[32px] bg-teal-600 text-white text-[84px] font-extrabold flex items-center justify-center shadow-2xl">
          {idea.number}
        </div>
      </div>
      <div className="flex-1 px-[72px] py-[64px] flex flex-col">
        <div className="flex items-center gap-4">
          <Kicker>Projet {idea.number} sur 5</Kicker>
          <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[20px] font-bold">{investmentLabel(idea)}</span>
        </div>
        <h2 className="text-[58px] leading-[1.05] font-extrabold tracking-tight text-slate-900 mt-5">{idea.title}</h2>
        <p className="text-[31px] text-slate-700 mt-5 leading-snug font-medium">{kid.pitch}</p>
        <div className="mt-6 bg-teal-50 border-2 border-teal-200 rounded-[28px] px-7 py-5">
          <div className="text-[21px] font-bold uppercase tracking-widest text-teal-700">Ce que vous ferez</div>
          <div className="text-[28px] text-slate-800 mt-1 leading-snug">{kid.todo}</div>
        </div>
        {kid.question && (
          <div className="mt-auto flex items-start gap-5 bg-amber-100 border-2 border-amber-300 rounded-[28px] px-7 py-5">
            <MessageCircle className="w-11 h-11 text-amber-600 shrink-0 mt-1" strokeWidth={2.4} />
            <div>
              <div className="text-[21px] font-bold uppercase tracking-widest text-amber-700">Question à la classe</div>
              <div className="text-[30px] font-extrabold text-amber-950 leading-snug mt-1">{kid.question}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CriteriaSlide: React.FC = () => {
  const criteria = [
    { Icon: Waves, color: 'bg-sky-500', title: 'Utile ?', text: 'Est-ce que ça aide vraiment le lagon ?' },
    { Icon: Smile, color: 'bg-amber-500', title: 'Amusant ?', text: 'Est-ce qu\'on aura envie de l\'utiliser ?' },
    { Icon: Clock, color: 'bg-emerald-500', title: 'Faisable ?', text: 'Est-ce qu\'on peut le réaliser cette année ?' },
  ];
  return (
    <LightSlide>
      <Kicker>Le Conseil des enfants pour la mer</Kicker>
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

interface VoteSlideProps {
  votes: Votes;
  isVisible: (id: string) => boolean;
  masked: boolean;
  revealing: boolean;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onReset: () => void;
  onReveal: () => void;
  onMask: () => void;
}

const VoteSlide: React.FC<VoteSlideProps> = ({ votes, isVisible, masked, revealing, onAdd, onRemove, onReset, onReveal, onMask }) => {
  const total = Object.values(votes).reduce((s, v) => s + v, 0);
  const max = Math.max(1, ...PROJECT_IDEAS.map(i => votes[i.id] || 0));
  return (
    <DarkSlide>
      <div className="flex items-end justify-between">
        <div>
          <Kicker dark>Le vote</Kicker>
          <div className="mt-6"><SlideTitle dark>À vous de voter ! 🗳️</SlideTitle></div>
        </div>
        <div className="flex items-end gap-8 pb-2">
          {masked && !revealing && (
            <button onMouseDown={noFocus} onClick={onReveal} className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-[28px] font-extrabold">
              <Eye className="w-8 h-8" /> Révéler
            </button>
          )}
          {!masked && (
            <button onMouseDown={noFocus} onClick={onMask} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-[22px] font-bold">
              <EyeOff className="w-6 h-6" /> Masquer
            </button>
          )}
          <div className="text-right">
            <div className="text-[64px] font-extrabold leading-none tabular-nums">{total}</div>
            <div className="text-[24px] text-teal-200/80 font-semibold">voix</div>
          </div>
        </div>
      </div>
      <div className="mt-8 space-y-3">
        {PROJECT_IDEAS.map(idea => {
          const v = votes[idea.id] || 0;
          const visible = isVisible(idea.id);
          return (
            <div key={idea.id} className={`flex items-center gap-6 border rounded-[24px] p-3 pr-5 transition-colors duration-500 ${
              visible && masked ? 'bg-amber-300/15 border-amber-300/60' : 'bg-white/[0.07] border-white/15'
            }`}>
              <img src={idea.imageUrl} alt="" className="w-[122px] h-[68px] rounded-xl object-cover shrink-0" />
              <div className="w-[56px] h-[56px] rounded-2xl bg-teal-500 text-[32px] font-extrabold flex items-center justify-center shrink-0">{idea.number}</div>
              <div className="w-[560px] shrink-0 text-[30px] font-bold leading-tight">{idea.title}</div>
              <div className="flex-1 h-[44px] bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-300 rounded-full transition-all duration-700" style={{ width: visible ? `${(v / max) * 100}%` : '0%' }} />
              </div>
              <div className="w-[80px] text-right text-[44px] font-extrabold tabular-nums">{visible ? v : '?'}</div>
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
        <span>Touches 1 à 5 : +1 voix · Maj + chiffre : −1 voix · R : révéler</span>
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
      <Kicker dark>Le résultat</Kicker>
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

  // Vote à suspense : les résultats restent cachés, puis se dévoilent du dernier au premier.
  const [masked, setMasked] = useState(true);
  const [revealOrder, setRevealOrder] = useState<string[]>([]);
  const [revealCount, setRevealCount] = useState(0);
  const revealing = masked && revealOrder.length > 0;

  const isVisible = useCallback(
    (id: string) => !masked || revealOrder.slice(0, revealCount).includes(id),
    [masked, revealOrder, revealCount],
  );

  const reveal = useCallback(() => {
    if (!masked || revealOrder.length > 0) return;
    const order = [...PROJECT_IDEAS]
      .sort((a, b) => (votes[a.id] || 0) - (votes[b.id] || 0))
      .map(i => i.id);
    setRevealCount(0);
    setRevealOrder(order);
  }, [masked, revealOrder.length, votes]);

  const mask = useCallback(() => {
    setMasked(true);
    setRevealOrder([]);
    setRevealCount(0);
  }, []);

  useEffect(() => {
    if (!revealing) return;
    if (revealCount >= revealOrder.length) {
      const t = setTimeout(() => {
        setMasked(false);
        setRevealOrder([]);
        confetti({ particleCount: 180, spread: 110, origin: { y: 0.5 } });
      }, 600);
      return () => clearTimeout(t);
    }
    // Pause plus longue avant le gagnant.
    const delay = revealCount === 0 ? 400 : revealCount === revealOrder.length - 1 ? 2400 : 1300;
    const t = setTimeout(() => setRevealCount(c => c + 1), delay);
    return () => clearTimeout(t);
  }, [revealing, revealCount, revealOrder.length]);

  const resetVotes = useCallback(() => {
    if (window.confirm('Remettre tous les votes à zéro ?')) {
      setVotes({});
      mask();
    }
  }, [mask]);

  const [step, setStep] = useState(0);

  const slides: { key: string; node: React.ReactNode; steps?: number }[] = [
    { key: 'titre', node: <TitleSlide /> },
    { key: 'devinette', node: <GuessSlide step={step} onNext={() => setStep(st => Math.min(st + 1, GUESS_STEPS))} />, steps: GUESS_STEPS },
    { key: 'super-heros', node: <HeroDemoSlide /> },
    { key: 'vrai-faux', node: <TrueFalseSlide step={step} onNext={() => setStep(st => Math.min(st + 1, TRUE_FALSE_STEPS))} />, steps: TRUE_FALSE_STEPS },
    { key: 'lagon', node: <LagoonSlide /> },
    { key: 'apercu', node: <OverviewSlide /> },
    ...PROJECT_IDEAS.map(idea => ({ key: idea.id, node: <ProjectSlide idea={idea} /> })),
    { key: 'criteres', node: <CriteriaSlide /> },
    { key: 'vote', node: <VoteSlide votes={votes} isVisible={isVisible} masked={masked} revealing={revealing} onAdd={addVote} onRemove={removeVote} onReset={resetVotes} onReveal={reveal} onMask={mask} /> },
    { key: 'resultat', node: <ResultSlide votes={votes} /> },
  ];
  const count = slides.length;
  const voteIndex = slides.findIndex(s => s.key === 'vote');

  const [index, setIndex] = useState(() => slideFromHash(count));

  const go = useCallback((target: number) => {
    setIndex(Math.max(0, Math.min(count - 1, target)));
    setStep(0);
  }, [count]);

  // Les diapos à étapes (devinette) consomment leurs étapes avant de passer à la suivante.
  const next = () => {
    if (step < (slides[index].steps ?? 0)) setStep(step + 1);
    else go(index + 1);
  };
  const prev = () => {
    if (step > 0) setStep(step - 1);
    else go(index - 1);
  };

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
      // Pendant la saisie des réponses des enfants, le clavier sert au texte.
      if ((e.target as HTMLElement).closest?.('input, textarea')) return;
      // Les télécommandes de présentation envoient PageDown / PageUp.
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
        next();
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) {
        e.preventDefault();
        prev();
      } else if (e.key === 'Home') {
        go(0);
      } else if (e.key === 'End') {
        go(count - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (index === voteIndex && (e.key === 'r' || e.key === 'R')) {
        reveal();
      } else if (index === voteIndex && /^Digit[1-9]$/.test(e.code)) {
        const idea = PROJECT_IDEAS[Number(e.code.slice(5)) - 1];
        if (idea) (e.shiftKey ? removeVote : addVote)(idea.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

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
        <button onMouseDown={noFocus} onClick={prev} disabled={index === 0 && step === 0} className="p-2 rounded-lg bg-white/90 text-slate-900 disabled:opacity-40" aria-label="Diapositive précédente">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-sm font-bold tabular-nums">{index + 1} / {count}</span>
        <button onMouseDown={noFocus} onClick={next} disabled={index === count - 1} className="p-2 rounded-lg bg-white/90 text-slate-900 disabled:opacity-40" aria-label="Diapositive suivante">
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
