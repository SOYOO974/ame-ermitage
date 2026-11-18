import { useEffect, useState } from 'react';
import { Layers, Play, RotateCcw, Settings2, Unlock, Wand2, X } from 'lucide-react';
import './quiz.css';
import { GOOD_ANSWERS_PER_CARD_UNLOCK } from './config';
import { CARD_BY_ID } from './cards';
import { CollectionView, UnlockCeremony } from './Collection';
import { POKEMON_CARDS } from './data.generated';
import { HomeDeck } from './HomeDeck';
import { LagoonEmblem, StarIcon } from './icons';
import { LagoonRoute } from './LagoonRoute';
import { drawQuestion } from './questions';
import { QuestionPanel } from './QuestionPanel';
import type { Question } from './types';
import { UNLOCK_ORDER, useGameState } from './useGameState';

type View = 'accueil' | 'quiz' | 'collection';

const TOTAL = POKEMON_CARDS.length;

function DemoPanel({ onClose, onUnlockAll, onSimulate, onReset }: { onClose: () => void; onUnlockAll: () => void; onSimulate: (id: string) => void; onReset: () => void }) {
  const [cardId, setCardId] = useState(UNLOCK_ORDER[0]);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ocean-900/60 p-4 sm:items-center" onClick={onClose} role="dialog" aria-modal="true" aria-label="Mode Démo Enseignant">
      <div className="rise-in w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-turq-600">Réservé à l'enseignant</p>
            <h2 className="font-display text-2xl font-semibold text-ocean-900">Mode Démo</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-full p-2 text-ocean-700 hover:bg-sable">
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-4">
          <button type="button" onClick={onUnlockAll} className="flex w-full items-center gap-3 rounded-xl bg-ocean-800 px-4 py-3 text-left text-base font-bold text-white transition hover:bg-ocean-700">
            <Unlock className="h-5 w-5 flex-shrink-0" strokeWidth={1.8} />
            Débloquer les 12 cartes de la classe
          </button>

          <div className="rounded-xl bg-sable p-4">
            <label htmlFor="demo-card" className="text-sm font-bold text-ocean-900">
              Simuler l'ouverture d'une carte
            </label>
            <div className="mt-2 flex gap-2">
              <select id="demo-card" value={cardId} onChange={(e) => setCardId(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-ocean-900/20 bg-white px-3 py-2.5 text-base text-ocean-900">
                {POKEMON_CARDS.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.number} {c.name}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => onSimulate(cardId)} className="inline-flex items-center gap-2 rounded-lg bg-corail-500 px-4 py-2.5 text-base font-bold text-white transition hover:bg-corail-600">
                <Wand2 className="h-5 w-5" strokeWidth={1.8} />
                Ouvrir
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.confirm('Remettre toute la progression à zéro (étoiles et cartes) ?') && onReset()}
            className="flex w-full items-center gap-3 rounded-xl border-2 border-corail-500/40 px-4 py-3 text-left text-base font-bold text-corail-600 transition hover:bg-corail-500/10"
          >
            <RotateCcw className="h-5 w-5 flex-shrink-0" strokeWidth={1.8} />
            Réinitialiser toute la progression
          </button>
        </div>
      </div>
    </div>
  );
}

const BUBBLES = [
  { left: '4%', size: 14, duration: '13s', delay: '0s' },
  { left: '14%', size: 8, duration: '10s', delay: '-4s' },
  { left: '27%', size: 20, duration: '16s', delay: '-9s' },
  { left: '41%', size: 10, duration: '11s', delay: '-2s' },
  { left: '58%', size: 16, duration: '15s', delay: '-7s' },
  { left: '72%', size: 9, duration: '12s', delay: '-5s' },
  { left: '86%', size: 22, duration: '18s', delay: '-11s' },
  { left: '95%', size: 11, duration: '14s', delay: '-1s' },
];

const STEPS = [
  { title: 'Réponds aux questions', text: 'Devinettes, photos du lagon, bon ou mauvais signe pour le récif : touche la bonne réponse.' },
  { title: `${GOOD_ANSWERS_PER_CARD_UNLOCK} bonnes réponses = 1 carte`, text: 'La jauge se remplit à chaque bonne réponse. Quand elle est pleine, tu gagnes une carte mystère.' },
  { title: 'Ouvre et collectionne', text: `Touche la carte pour la retourner. Il y a ${POKEMON_CARDS.length} cartes dessinées par les élèves à gagner.` },
];

export default function QuizGame() {
  const { state, recordAnswer, unlockAll, markSeen, reset } = useGameState();
  const newCards = state.unlocked.filter((id) => !state.seen.includes(id)).length;
  const [view, setView] = useState<View>('accueil');
  const [question, setQuestion] = useState<Question | null>(null);
  const [round, setRound] = useState(0);
  const [pendingCard, setPendingCard] = useState<string | null>(null);
  const [ceremonyCard, setCeremonyCard] = useState<string | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    document.title = 'Les Gardiens du Lagon • AME de l’Ermitage-les-Bains';
  }, []);

  const nextQuestion = () => {
    setQuestion((current) => drawQuestion(state.recentQuestions, state.recentSubjects, current?.mechanic ?? null));
    setRound((r) => r + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const play = () => {
    if (!question) nextQuestion();
    setView('quiz');
  };

  const handleAnswer = (correct: boolean, stars: number): boolean => {
    if (!question) return false;
    const unlocked = recordAnswer(question, correct, stars);
    setPendingCard(unlocked);
    return unlocked !== null;
  };

  const handleNext = () => {
    if (pendingCard) {
      setCeremonyCard(pendingCard);
      setPendingCard(null);
    }
    nextQuestion();
  };

  const tabClass = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition sm:px-4 sm:text-base ${
      active ? 'bg-white text-ocean-900 shadow' : 'text-white/85 hover:bg-white/15'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-sable text-ocean-900">
      <header className="sticky top-0 z-30 bg-ocean-800 text-white shadow-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <button type="button" onClick={() => setView('accueil')} className="flex items-center gap-3 text-left">
            <LagoonEmblem className="h-10 w-10 text-soleil-300" />
            <span>
              <span className="block font-display text-xl font-semibold leading-none sm:text-2xl">Les Gardiens du Lagon</span>
              <span className="hidden text-xs font-semibold uppercase tracking-[0.15em] text-white/70 sm:block">AME de l'Ermitage-les-Bains · CM2 de Mme Pavion</span>
            </span>
          </button>
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button type="button" onClick={play} className={tabClass(view === 'quiz')}>
              <Play className="h-4 w-4" strokeWidth={2} />
              Jouer
            </button>
            <button type="button" onClick={() => setView('collection')} className={tabClass(view === 'collection')}>
              <Layers className="h-4 w-4" strokeWidth={2} />
              <span className="hidden sm:inline">Mes cartes</span>
              <span className="sm:hidden">Cartes</span> {state.unlocked.length}/{TOTAL}
              {newCards > 0 && (
                <span className="new-dot" aria-label={`${newCards} nouvelle${newCards > 1 ? 's' : ''} carte${newCards > 1 ? 's' : ''}`}>
                  {newCards}
                </span>
              )}
            </button>
            <span className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-ocean-900/50 px-3 py-2 font-display text-lg font-semibold text-soleil-300" title="Étoiles gagnées">
              <StarIcon className="h-7 w-7" />
              <span key={state.stars} className="pop inline-block">
                {state.stars}
              </span>
            </span>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {view === 'accueil' && (
          <>
            <section className="lagoon-hero relative overflow-hidden text-white">
              {BUBBLES.map((b) => (
                <span key={b.left} className="bubble" style={{ left: b.left, width: b.size, height: b.size, animationDuration: b.duration, animationDelay: b.delay }} aria-hidden="true" />
              ))}
              <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-24 pt-7 md:gap-10 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:pt-16">
                <div className="rise-in">
                  <p className="hidden text-sm font-bold uppercase tracking-[0.2em] text-soleil-300 sm:block">Aire Marine Éducative de l'Ermitage</p>
                  <h1 className="font-display text-4xl font-semibold leading-[1.02] sm:mt-3 sm:text-6xl">
                    Deviens Gardien
                    <br className="hidden sm:block" /> du Lagon
                  </h1>
                  <p className="mt-3 max-w-xl text-lg leading-snug text-white/90 sm:mt-5 sm:text-2xl">
                    <b className="text-soleil-300">{GOOD_ANSWERS_PER_CARD_UNLOCK} bonnes réponses = 1 carte mystère</b> à ouvrir. Gagne les {TOTAL} cartes dessinées par la classe !
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-5 sm:mt-8">
                    <button type="button" onClick={play} className="btn-play">
                      <Play fill="currentColor" strokeWidth={0} />
                      Jouer
                    </button>
                    <button type="button" onClick={() => setView('collection')} className="hidden items-center gap-2 rounded-xl px-4 py-3 text-lg font-bold text-white ring-1 sm:inline-flex ring-white/50 transition hover:bg-white/15">
                      <Layers className="h-5 w-5" strokeWidth={1.8} />
                      Mes cartes {state.unlocked.length}/{TOTAL}
                    </button>
                  </div>
                </div>

                <HomeDeck unlocked={state.unlocked} towardNext={state.towardNext} onPlay={play} onCollection={() => setView('collection')} />
              </div>
              <svg className="wave-slide absolute -bottom-px left-0 h-16 text-sable" viewBox="0 0 1440 80" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">
                <path d="M0 40c120-28 240-28 360 0s240 28 360 0 240-28 360 0 240 28 360 0v40H0z" />
              </svg>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-10">
              <h2 className="font-display text-3xl font-semibold text-ocean-900">Comment jouer ?</h2>
              <div className="mt-6 grid gap-8 md:grid-cols-3">
                {STEPS.map(({ title, text }, i) => (
                  <div key={title} className="rise-in flex gap-4" style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
                    <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-ocean-800 font-display text-3xl font-semibold text-soleil-300">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-ocean-900">{title}</h3>
                      <p className="mt-1 text-lg leading-snug text-ocean-700">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {view === 'quiz' && question && (
          <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:py-8">
            {/* Tant que la carte gagnée n'est pas ouverte, la route la garde en « mystère » (pas de divulgâchage). */}
            <LagoonRoute
              unlocked={pendingCard ? state.unlocked.filter((id) => id !== pendingCard) : state.unlocked}
              towardNext={pendingCard ? GOOD_ANSWERS_PER_CARD_UNLOCK : state.towardNext}
              streak={state.streak}
            />
            <QuestionPanel
              key={round}
              question={question}
              streak={state.streak}
              toNextCard={state.unlocked.length < TOTAL ? GOOD_ANSWERS_PER_CARD_UNLOCK - state.towardNext : null}
              onAnswer={handleAnswer}
              onNext={handleNext}
            />
          </div>
        )}

        {view === 'collection' && (
          <div className="mx-auto max-w-6xl px-4 py-8">
            <CollectionView unlocked={state.unlocked} towardNext={state.towardNext} seen={state.seen} onSeen={markSeen} onPlay={play} />
          </div>
        )}
      </main>

      <footer className="mt-10 bg-ocean-900 px-4 py-8 text-center text-sm text-white/70">
        <p className="font-semibold text-white/90">Aire Marine Éducative de l'Ermitage-les-Bains · Classe de CM2 de Madame Pavion</p>
        <p className="mt-1">Questions tirées des cartes Reef Check et du Jardin de l'AME. Cartes dessinées par les élèves.</p>
        <p className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <a href="/projets" className="underline-offset-4 hover:text-white hover:underline">
            Les 5 projets soumis au vote
          </a>
          <a href="/presentation" className="underline-offset-4 hover:text-white hover:underline">
            Diaporama de l'atelier
          </a>
          <button type="button" onClick={() => setDemoOpen(true)} className="inline-flex items-center gap-1.5 underline-offset-4 hover:text-white hover:underline">
            <Settings2 className="h-4 w-4" strokeWidth={1.5} />
            Mode Démo / Enseignant
          </button>
        </p>
      </footer>

      {demoOpen && (
        <DemoPanel
          onClose={() => setDemoOpen(false)}
          onUnlockAll={() => {
            unlockAll();
            setDemoOpen(false);
            setView('collection');
          }}
          onSimulate={(id) => {
            setDemoOpen(false);
            setCeremonyCard(id);
          }}
          onReset={() => {
            reset();
            setQuestion(null);
            setPendingCard(null);
            setDemoOpen(false);
            setView('accueil');
          }}
        />
      )}

      {ceremonyCard && (
        <UnlockCeremony
          key={ceremonyCard}
          card={CARD_BY_ID[ceremonyCard]}
          onClose={() => setCeremonyCard(null)}
          onSeeCollection={() => {
            setCeremonyCard(null);
            setView('collection');
          }}
        />
      )}
    </div>
  );
}
