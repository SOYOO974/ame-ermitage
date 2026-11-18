import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, Check, Eye, Gift, HelpCircle, Lightbulb, Stethoscope, X } from 'lucide-react';
import { STARS_FLAT } from './config';
import { MECHANIC_LABEL, SUBJECT_BY_ID, THEME_LABEL } from './questions';
import { StarIcon } from './icons';
import type { Mechanic, Question, Subject } from './types';

const MECHANIC_ICON: Record<Mechanic, typeof Eye> = {
  'qui-suis-je': HelpCircle,
  diagnostic: Stethoscope,
  'defi-visuel': Eye,
};

const UICN_COLOR: Record<string, string> = { LC: '#2e9d6a', VU: '#d9a400', EN: '#e07b1a', CR: '#d23f31' };

const LETTERS = ['A', 'B', 'C', 'D'];
/** Suspense façon jeu télé entre le choix de l'élève et la révélation de la bonne réponse. */
const SUSPENSE_MS = 1100;

/** Espace insécable avant la ponctuation double : pas de « ? » orphelin en fin de ligne. */
const nbsp = (text: string) => text.replace(/ ([?!:;])/g, ' $1');

function Stars({ count, total = 3 }: { count: number; total?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-soleil-400">
      {Array.from({ length: total }, (_, i) => (
        <StarIcon key={i} filled={i < count} className={`h-6 w-6 ${i < count ? 'star-on' : 'text-ocean-900/25'}`} />
      ))}
    </span>
  );
}

function SubjectSheet({ subject, explanation }: { subject: Subject; explanation?: string }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {subject.image && (
        <img
          src={subject.image}
          alt={subject.name}
          className="h-40 w-full flex-shrink-0 rounded-lg object-cover sm:h-auto sm:w-48 sm:self-stretch"
        />
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-2xl font-semibold leading-tight text-ocean-900">{subject.name}</h3>
        {subject.scientific && <p className="text-base italic text-ocean-700">{subject.scientific}</p>}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold uppercase tracking-[0.12em] text-ocean-700">
          <span>{THEME_LABEL[subject.theme]}</span>
          {subject.reefCode && <span>Code Reef Check : {subject.reefCode}</span>}
          {subject.uicn && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: UICN_COLOR[subject.uicn.code] ?? '#2e9d6a' }} />
              UICN {subject.uicn.code}
            </span>
          )}
        </div>
        {subject.uicn && <p className="mt-1 text-sm text-ocean-700">{subject.uicn.label}</p>}
        {explanation && <p className="mt-3 text-lg leading-snug text-ocean-900">{explanation}</p>}
        <p className={`mt-2 leading-snug text-ocean-800 ${explanation ? 'text-base' : 'text-lg'}`}>
          <span className="font-bold">Son rôle dans le lagon : </span>
          {subject.role}
        </p>
        {(subject.positive || subject.negative) && (
          <ul className="mt-2 space-y-1 text-base text-ocean-800">
            {subject.positive && (
              <li className="flex gap-2">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2e9d6a]" strokeWidth={2} />
                <span>
                  <b>Bon signe :</b> {subject.positive.replace(/^Bon signe si /i, '')}
                </span>
              </li>
            )}
            {subject.negative && (
              <li className="flex gap-2">
                <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-corail-600" strokeWidth={2} />
                <span>
                  <b>Mauvais signe :</b> {subject.negative.replace(/^Mauvais signe si /i, '')}
                </span>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

interface Props {
  question: Question;
  /** Appelé une seule fois, au moment où la réponse est révélée. Renvoie true si une carte vient d'être gagnée. */
  onAnswer: (correct: boolean, stars: number) => boolean;
  onNext: () => void;
}

export function QuestionPanel({ question, onAnswer, onNext }: Props) {
  const [revealed, setRevealed] = useState(1);
  const [picked, setPicked] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [cardWon, setCardWon] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const subject = SUBJECT_BY_ID[question.subjectId];
  const isWho = question.mechanic === 'qui-suis-je';
  const stake = isWho ? 4 - revealed : STARS_FLAT;
  const locked = picked !== null;
  const correct = picked === question.answer;
  const Icon = MECHANIC_ICON[question.mechanic];

  const choose = (option: string) => {
    if (locked) return;
    const ok = option === question.answer;
    const stars = stake;
    setPicked(option);
    timer.current = window.setTimeout(() => {
      setCardWon(onAnswer(ok, stars));
      setAnswered(true);
      if (ok) {
        confetti({ particleCount: 55, spread: 70, startVelocity: 32, origin: { y: 0.7 }, colors: ['#fbd679', '#5fd9d2', '#ffffff', '#35b47a'], scalar: 0.9 });
      }
    }, SUSPENSE_MS);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Clavier (pratique en projection) : A, B, C, D pour répondre.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target instanceof HTMLElement && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      const index = LETTERS.indexOf(e.key.toUpperCase());
      if (index >= 0 && index < question.options.length) choose(question.options[index]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const image =
    question.mechanic === 'defi-visuel'
      ? question.image
      : question.mechanic === 'diagnostic' && question.showImage
        ? subject.image
        : null;

  return (
    <div className="rise-in overflow-hidden rounded-2xl bg-white p-5 shadow-[0_18px_40px_-24px_rgba(6,50,74,0.45)] ring-1 ring-ocean-900/10 sm:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-turq-600">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
          {MECHANIC_LABEL[question.mechanic]}
        </span>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-700">
          {answered ? (correct ? 'Gagné' : 'Cette fois') : 'À gagner'}
          <Stars key={answered ? 'fin' : stake} count={answered ? (correct ? stake : 0) : stake} total={isWho ? 3 : STARS_FLAT} />
        </span>
      </div>

      {isWho ? (
        <div>
          <ol className="space-y-3">
            {question.clues.slice(0, answered ? 3 : revealed).map((clue, i) => (
              <li key={clue} className="rise-in flex gap-3 rounded-xl bg-sable px-4 py-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ocean-800 font-display text-base font-semibold text-white">
                  {i + 1}
                </span>
                <span className="text-xl font-medium leading-snug text-ocean-900 sm:text-2xl">{nbsp(clue)}</span>
              </li>
            ))}
          </ol>
          {!locked && revealed < 3 && (
            <button
              type="button"
              onClick={() => setRevealed((r) => r + 1)}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-ocean-700/40 px-4 py-2.5 text-base font-bold text-ocean-700 transition hover:border-ocean-700 hover:bg-sable"
            >
              <Lightbulb className="h-5 w-5" strokeWidth={1.8} />
              Révéler l'indice {revealed + 1}
              <span className="font-medium text-ocean-700/70">
                (je joue pour {3 - revealed} étoile{3 - revealed > 1 ? 's' : ''})
              </span>
            </button>
          )}
          <p className="mt-5 font-display text-2xl font-semibold text-ocean-900">Qui suis-je ?</p>
        </div>
      ) : (
        <div className={image ? 'grid gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-center' : ''}>
          {image && !answered && (
            <div className="qz-photo">
              <img src={image} alt="Photo à observer" />
            </div>
          )}
          <p className={`font-display text-2xl font-semibold leading-snug text-ocean-900 sm:text-3xl ${image && answered ? 'md:col-span-2' : ''}`}>
            {nbsp(question.prompt)}
          </p>
        </div>
      )}

      {/* Pupitre des réponses, façon jeu télé */}
      <div className={`qz-stage -mx-5 mt-6 px-5 py-5 sm:-mx-8 sm:px-8 sm:py-6 ${answered ? '' : '-mb-5 sm:-mb-8'}`}>
        <div className={`grid gap-x-4 gap-y-3 ${question.options.length === 2 ? 'grid-cols-2' : 'sm:grid-cols-2'}`}>
          {question.options.map((option, i) => {
            const isAnswer = option === question.answer;
            const isPicked = option === picked;
            let status = 'idle';
            if (answered) status = isAnswer ? 'right' : isPicked ? 'wrong' : 'off';
            else if (locked) status = isPicked ? 'locked' : 'off';
            return (
              <div key={option} className="qz-answer-wrap rise-in" style={{ animationDelay: `${0.12 + i * 0.09}s` }}>
                <button type="button" disabled={locked} onClick={() => choose(option)} className={`qz-answer is-${status}`}>
                  <span className="qz-answer-in">
                    <span className="qz-letter">{LETTERS[i]}</span>
                    <span className="min-w-0 flex-1">{option}</span>
                    {answered && isAnswer && <Check className="h-6 w-6 flex-shrink-0" strokeWidth={2.4} />}
                    {answered && isPicked && !isAnswer && <X className="h-6 w-6 flex-shrink-0" strokeWidth={2.4} />}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-sm font-semibold uppercase tracking-[0.2em] text-white/60" aria-live="polite">
          {answered ? (correct ? 'Bonne réponse' : 'Ce n’était pas la bonne réponse') : locked ? 'Réponse verrouillée…' : 'Choisis ta réponse'}
        </p>
      </div>

      {answered && (
        <div className="rise-in mt-6">
          <div className={`qz-verdict rounded-t-xl px-5 py-3 text-white ${correct ? 'bg-[#2e9d6a]' : 'bg-ocean-700'}`}>
            <p className="font-display text-xl font-semibold sm:text-2xl">
              {correct
                ? `Bravo, c'est la bonne réponse ! +${stake} étoile${stake > 1 ? 's' : ''}`
                : `Presque ! La bonne réponse était : ${question.answer}`}
            </p>
          </div>
          <div className="rounded-b-xl bg-sable p-5 ring-1 ring-ocean-900/10">
            <SubjectSheet subject={subject} explanation={question.mechanic === 'diagnostic' ? question.explanation : undefined} />
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onNext}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-display text-xl font-semibold text-white shadow-lg transition hover:-translate-y-0.5 ${
                cardWon ? 'cta-glow bg-corail-500 hover:bg-corail-600' : 'bg-ocean-800 hover:bg-ocean-700'
              }`}
            >
              {cardWon ? (
                <>
                  <Gift className="h-6 w-6" strokeWidth={1.8} />
                  Ouvrir ma nouvelle carte
                </>
              ) : (
                <>
                  Question suivante
                  <ArrowRight className="h-6 w-6" strokeWidth={1.8} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
