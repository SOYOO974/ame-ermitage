import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Eye, EyeOff, ImagePlus, LogOut, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { SUBJECTS } from '../quiz/data.generated';
import { SUBJECT_BY_ID, THEME_LABEL, type StoredQuestion } from '../quiz/questions';
import type { Level, Theme } from '../quiz/types';
import AdminStats from './AdminStats';

// Back-office /admin : les gestionnaires (enseignants, équipe AME) ajoutent, corrigent ou retirent les questions
// écrites à la main du quiz, sans passer par le code. Les comptes se créent avec scripts/db.mjs admin.

interface Account {
  email: string;
  name: string;
}

interface AdminQuestion extends StoredQuestion {
  active: boolean;
  updatedAt: string;
  updatedBy: string | null;
}

const LEVEL_LABEL: Record<Level, string> = { decouverte: 'Découverte', explorateur: 'Explorateur', expert: 'Expert' };
const THEMES = Object.keys(THEME_LABEL) as Theme[];
const GOOD = 'Bon signe';
const BAD = 'Mauvais signe';

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as { error?: string }).error ?? `Erreur ${r.status}`);
  return data as T;
}

const sendJson = (method: string, data: unknown): RequestInit => ({
  method,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(data),
});

const inputClass =
  'w-full rounded-lg border border-ocean-900/20 bg-white px-3 py-2 text-base text-ocean-900 outline-none focus:border-turq-500 focus:ring-2 focus:ring-turq-300/50';
const labelClass = 'mb-1 block text-sm font-semibold text-ocean-800';
const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-ocean-800 px-4 py-2 text-sm font-semibold text-white hover:bg-ocean-700 disabled:opacity-50';
const ghostButton =
  'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ocean-800 ring-1 ring-ocean-900/15 hover:bg-sable disabled:opacity-50';

export default function Admin() {
  const [account, setAccount] = useState<Account | null | undefined>(undefined);
  const [tab, setTab] = useState<'questions' | 'stats'>('questions');

  useEffect(() => {
    document.title = 'Back-office — Les Gardiens du Lagon';
    api<Account>('/api/session').then(setAccount, () => setAccount(null));
  }, []);

  const logout = async () => {
    await fetch('/api/session', { method: 'DELETE' });
    setAccount(null);
  };

  if (account === undefined) return <div className="min-h-screen bg-sable" />;
  if (account === null) return <Login onLogin={setAccount} />;

  return (
    <div className="min-h-screen bg-sable text-ocean-900">
      <header className="border-b border-ocean-900/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-turq-600">Back-office</p>
            <h1 className="font-display text-xl font-semibold">Les Gardiens du Lagon</h1>
          </div>
          <nav className="flex gap-1 rounded-lg bg-sable p-1">
            {(['questions', 'stats'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-md px-4 py-1.5 text-sm font-semibold ${tab === t ? 'bg-white text-ocean-900 shadow-sm' : 'text-ocean-700'}`}
              >
                {t === 'questions' ? 'Questions' : 'Statistiques'}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-ocean-700">{account.name}</span>
            <button type="button" onClick={logout} className={ghostButton}>
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
              Se déconnecter
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{tab === 'questions' ? <QuestionsTab onExpired={() => setAccount(null)} /> : <AdminStats embedded />}</main>
    </div>
  );
}

function Login({ onLogin }: { onLogin: (a: Account) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      onLogin(await api<Account>('/api/session', sendJson('POST', { email, password })));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sable px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ocean-900/10">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-turq-600">Back-office</p>
        <h1 className="mb-5 font-display text-2xl font-semibold text-ocean-900">Les Gardiens du Lagon</h1>
        <label className={labelClass} htmlFor="email">
          Email
        </label>
        <input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} mb-4`} />
        <label className={labelClass} htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${inputClass} mb-4`}
        />
        {error && <p className="mb-4 rounded-lg bg-corail-400/15 px-3 py-2 text-sm text-corail-600">{error}</p>}
        <button type="submit" disabled={busy} className={`${primaryButton} w-full`}>
          {busy ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

// --- Liste des questions ------------------------------------------------------------------------

const summary = (q: StoredQuestion) => (q.mechanic === 'qui-suis-je' ? (q.clues ?? []).join(' · ') : q.prompt);

function QuestionsTab({ onExpired }: { onExpired: () => void }) {
  const [questions, setQuestions] = useState<AdminQuestion[] | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<Theme | ''>('');
  const [level, setLevel] = useState<Level | ''>('');
  const [state, setState] = useState<'actives' | 'retirees' | 'toutes'>('actives');
  const [editing, setEditing] = useState<AdminQuestion | 'new' | null>(null);

  const load = () =>
    api<{ questions: AdminQuestion[] }>('/api/questions?tout=1').then(
      (d) => setQuestions(d.questions),
      (err: Error) => (err.message === 'Non connecté' ? onExpired() : setError(err.message)),
    );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (questions ?? []).filter((q) => {
      const subject = SUBJECT_BY_ID[q.subjectId];
      if (theme && subject?.theme !== theme) return false;
      if (level && q.level !== level) return false;
      if (state === 'actives' && !q.active) return false;
      if (state === 'retirees' && q.active) return false;
      if (!needle) return true;
      return [summary(q), q.answer ?? '', subject?.name ?? '', q.explanation].some((t) => t.toLowerCase().includes(needle));
    });
  }, [questions, search, theme, level, state]);

  const toggle = async (q: AdminQuestion) => {
    try {
      const { question } = await api<{ question: AdminQuestion }>('/api/questions', sendJson('PUT', { id: q.id, active: !q.active }));
      setQuestions((list) => list?.map((x) => (x.id === q.id ? question : x)) ?? null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const saved = (question: AdminQuestion | null, removedId?: string) => {
    setQuestions((list) => {
      const rest = (list ?? []).filter((x) => x.id !== (question?.id ?? removedId));
      return question ? [question, ...rest] : rest;
    });
    setEditing(null);
  };

  const activeCount = questions?.filter((q) => q.active).length ?? 0;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Questions écrites à la main</h2>
          <p className="text-sm text-ocean-700">
            {questions ? `${activeCount} en jeu, ${questions.length - activeCount} retirée${questions.length - activeCount > 1 ? 's' : ''}.` : 'Chargement…'} Les
            « Qui suis-je ? » et défis photo tirés des fiches s'ajoutent automatiquement. Une modification arrive dans le jeu en une minute environ.
          </p>
        </div>
        <button type="button" onClick={() => setEditing('new')} className={primaryButton}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nouvelle question
        </button>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ocean-700" strokeWidth={1.8} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un mot, un animal…" className={`${inputClass} pl-9`} />
        </label>
        <select value={theme} onChange={(e) => setTheme(e.target.value as Theme | '')} className={inputClass} aria-label="Thème">
          <option value="">Tous les thèmes</option>
          {THEMES.map((t) => (
            <option key={t} value={t}>
              {THEME_LABEL[t]}
            </option>
          ))}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value as Level | '')} className={inputClass} aria-label="Niveau">
          <option value="">Tous les niveaux</option>
          {(Object.keys(LEVEL_LABEL) as Level[]).map((l) => (
            <option key={l} value={l}>
              {LEVEL_LABEL[l]}
            </option>
          ))}
        </select>
        <select value={state} onChange={(e) => setState(e.target.value as typeof state)} className={inputClass} aria-label="État">
          <option value="actives">En jeu</option>
          <option value="retirees">Retirées</option>
          <option value="toutes">Toutes</option>
        </select>
      </div>

      {error && <p className="mb-4 rounded-lg bg-corail-400/15 px-3 py-2 text-sm text-corail-600">{error}</p>}

      <ul className="divide-y divide-ocean-900/10 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ocean-900/10">
        {shown.map((q) => {
          const subject = SUBJECT_BY_ID[q.subjectId];
          return (
            <li key={q.id} className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center ${q.active ? '' : 'bg-sable/60 opacity-70'}`}>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold uppercase tracking-[0.1em] text-turq-600">
                  <span>{q.mechanic === 'qui-suis-je' ? 'Qui suis-je ?' : 'Question à choix'}</span>
                  <span className="text-ocean-700">{LEVEL_LABEL[q.level]}</span>
                  <span className="text-ocean-700">{subject ? `${subject.name} · ${THEME_LABEL[subject.theme]}` : q.subjectId}</span>
                  {!q.active && <span className="text-corail-600">Retirée</span>}
                </div>
                <p className="text-base text-ocean-900">{summary(q)}</p>
                {q.answer && <p className="text-sm text-ocean-700">Réponse : {q.answer}</p>}
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button type="button" onClick={() => setEditing(q)} className={ghostButton}>
                  <Pencil className="h-4 w-4" strokeWidth={1.8} />
                  Modifier
                </button>
                <button type="button" onClick={() => toggle(q)} className={ghostButton} title={q.active ? 'Ne plus poser cette question' : 'Remettre en jeu'}>
                  {q.active ? <EyeOff className="h-4 w-4" strokeWidth={1.8} /> : <Eye className="h-4 w-4" strokeWidth={1.8} />}
                  {q.active ? 'Retirer' : 'Remettre'}
                </button>
              </div>
            </li>
          );
        })}
        {questions && shown.length === 0 && <li className="px-4 py-8 text-center text-ocean-700">Aucune question ne correspond.</li>}
      </ul>

      {editing && <Editor question={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={saved} />}
    </div>
  );
}

// --- Formulaire d'une question -------------------------------------------------------------------

type PhotoChoice = 'aucune' | 'fiche' | 'autre';

/** Réduit la photo dans le navigateur (1200 px, WebP) avant l'envoi : rapide même en 4G, et sous la limite de Vercel. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Photo illisible.'))), 'image/webp', 0.82));
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      {children}
      {hint && <p className="mt-1 text-xs text-ocean-700">{hint}</p>}
    </div>
  );
}

function Editor({ question, onClose, onSaved }: { question: AdminQuestion | null; onClose: () => void; onSaved: (q: AdminQuestion | null, removedId?: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mechanic, setMechanic] = useState<StoredQuestion['mechanic']>(question?.mechanic ?? 'diagnostic');
  const [subjectId, setSubjectId] = useState(question?.subjectId ?? '');
  const [level, setLevel] = useState<Level>(question?.level ?? 'decouverte');
  const [prompt, setPrompt] = useState(question?.prompt ?? '');
  const [goodBad, setGoodBad] = useState(question ? question.mechanic === 'diagnostic' && !question.wrong : false);
  const [answer, setAnswer] = useState(question?.answer ?? '');
  const [wrong, setWrong] = useState<string[]>(question?.wrong ?? ['', '', '']);
  const [clues, setClues] = useState<string[]>(question?.clues ?? ['', '', '']);
  const [explanation, setExplanation] = useState(question?.explanation ?? '');
  const [photo, setPhoto] = useState<PhotoChoice>(question ? (!question.showImage ? 'aucune' : question.image ? 'autre' : 'fiche') : 'fiche');
  const [image, setImage] = useState<string | null>(question?.image ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => dialog.current?.showModal(), []);

  const subject = SUBJECT_BY_ID[subjectId];

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { url } = await api<{ url: string }>('/api/upload', { method: 'POST', headers: { 'content-type': 'image/webp' }, body: await shrink(file) });
      setImage(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const isWho = mechanic === 'qui-suis-je';
    const data = {
      id: question?.id,
      mechanic,
      subjectId,
      level,
      prompt: isWho ? '' : prompt,
      clues: isWho ? clues : null,
      answer: isWho ? null : goodBad ? answer || GOOD : answer,
      wrong: isWho || goodBad ? null : wrong,
      explanation: isWho ? '' : explanation,
      showImage: photo !== 'aucune',
      image: photo === 'autre' ? image : null,
    };
    try {
      const { question: savedQuestion } = await api<{ question: AdminQuestion }>('/api/questions', sendJson(question ? 'PUT' : 'POST', data));
      onSaved(savedQuestion);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!question || !window.confirm('Supprimer définitivement cette question ? Pour la mettre de côté, « Retirer » suffit.')) return;
    setBusy(true);
    try {
      await api(`/api/questions?id=${encodeURIComponent(question.id)}`, { method: 'DELETE' });
      onSaved(null, question.id);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const shownImage = photo === 'autre' ? image : photo === 'fiche' ? subject?.image : null;

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      className="m-auto w-[min(44rem,calc(100vw-2rem))] max-h-[calc(100vh-2rem)] rounded-2xl p-0 text-ocean-900 shadow-xl backdrop:bg-ocean-900/50"
    >
      <form onSubmit={save} className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold">{question ? 'Modifier la question' : 'Nouvelle question'}</h2>
          <button type="button" onClick={() => dialog.current?.close()} className="rounded-lg p-2 text-ocean-700 hover:bg-sable" aria-label="Fermer">
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex gap-1 rounded-lg bg-sable p-1">
          {(['diagnostic', 'qui-suis-je'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMechanic(m)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${mechanic === m ? 'bg-white shadow-sm' : 'text-ocean-700'}`}
            >
              {m === 'diagnostic' ? 'Question à choix' : 'Qui suis-je ? (3 indices)'}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
          <Field label="Sujet" hint={subject ? `Thème : ${THEME_LABEL[subject.theme]}. Sa fiche s'affiche après la réponse.` : 'Le thème suit le sujet choisi.'}>
            <select required value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={inputClass}>
              <option value="">Choisir…</option>
              {THEMES.map((t) => (
                <optgroup key={t} label={THEME_LABEL[t]}>
                  {SUBJECTS.filter((s) => s.theme === t).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
          <Field label="Niveau">
            <select value={level} onChange={(e) => setLevel(e.target.value as Level)} className={inputClass}>
              {(Object.keys(LEVEL_LABEL) as Level[]).map((l) => (
                <option key={l} value={l}>
                  {LEVEL_LABEL[l]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {mechanic === 'qui-suis-je' ? (
          <Field
            label="Indices, du plus difficile au plus facile"
            hint={`L'enfant voit un indice de plus à chaque essai. La bonne réponse est le nom du sujet${subject ? ` (« ${subject.name} »)` : ''} ; les autres propositions sont tirées au hasard dans le même thème.`}
          >
            <div className="flex flex-col gap-2">
              {clues.map((c, i) => (
                <input
                  key={i}
                  required
                  value={c}
                  onChange={(e) => setClues(clues.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={`Indice ${i + 1}`}
                  className={inputClass}
                />
              ))}
            </div>
          </Field>
        ) : (
          <>
            <Field label="Question">
              <textarea required rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)} className={inputClass} />
            </Field>
            <label className="flex items-center gap-2 text-sm font-semibold text-ocean-800">
              <input type="checkbox" checked={goodBad} onChange={(e) => setGoodBad(e.target.checked)} className="h-4 w-4 accent-ocean-800" />
              Réponse « Bon signe » ou « Mauvais signe »
            </label>
            {goodBad ? (
              <Field label="Bonne réponse">
                <select value={answer === BAD ? BAD : GOOD} onChange={(e) => setAnswer(e.target.value)} className={inputClass}>
                  <option value={GOOD}>{GOOD}</option>
                  <option value={BAD}>{BAD}</option>
                </select>
              </Field>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Bonne réponse">
                  <input required value={answer} onChange={(e) => setAnswer(e.target.value)} className={`${inputClass} border-turq-500`} />
                </Field>
                {wrong.map((w, i) => (
                  <Field key={i} label={`Mauvaise réponse ${i + 1}`}>
                    <input required value={w} onChange={(e) => setWrong(wrong.map((x, j) => (j === i ? e.target.value : x)))} className={inputClass} />
                  </Field>
                ))}
              </div>
            )}
            <Field label="Explication affichée après la réponse">
              <textarea required rows={3} value={explanation} onChange={(e) => setExplanation(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Photo">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex flex-col gap-1.5 text-sm">
                  {(
                    [
                      ['fiche', 'Photo de la fiche du sujet'],
                      ['autre', 'Autre photo'],
                      ['aucune', 'Aucune photo'],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2">
                      <input type="radio" name="photo" checked={photo === value} onChange={() => setPhoto(value)} className="accent-ocean-800" />
                      {label}
                    </label>
                  ))}
                  {photo === 'autre' && (
                    <label className={`${ghostButton} mt-1 cursor-pointer`}>
                      <ImagePlus className="h-4 w-4" strokeWidth={1.8} />
                      {image ? 'Changer la photo' : 'Choisir une photo'}
                      <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
                    </label>
                  )}
                </div>
                {shownImage ? (
                  <img src={shownImage} alt="" className="h-32 w-full rounded-lg object-cover sm:w-48" />
                ) : (
                  photo !== 'aucune' && <p className="text-sm text-ocean-700">{photo === 'fiche' ? 'Ce sujet n’a pas de photo.' : 'Pas encore de photo.'}</p>
                )}
              </div>
            </Field>
          </>
        )}

        {error && <p className="rounded-lg bg-corail-400/15 px-3 py-2 text-sm text-corail-600">{error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ocean-900/10 pt-4">
          {question ? (
            <button type="button" onClick={remove} disabled={busy} className={`${ghostButton} text-corail-600`}>
              <Trash2 className="h-4 w-4" strokeWidth={1.8} />
              Supprimer
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => dialog.current?.close()} className={ghostButton}>
              Annuler
            </button>
            <button type="submit" disabled={busy} className={primaryButton}>
              {busy ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
