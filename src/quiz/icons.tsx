import { useId } from 'react';
import type { ReactNode } from 'react';
import { TYPE_THEME } from './cards';

// Icônes vectorielles sur-mesure des types élémentaires (zéro émoji).
const GLYPH: Record<string, ReactNode> = {
  Eau: <path d="M12 3.5c3.2 4 5.5 6.9 5.5 9.9a5.5 5.5 0 0 1-11 0c0-3 2.3-5.9 5.5-9.9z" />,
  Roche: (
    <>
      <path d="M4 18.5l3.4-8.2 4.2-3.3 5 2.2 3.4 9.3z" />
      <path d="M11.6 7l1 5.2 4.2 2" />
    </>
  ),
  Acier: (
    <>
      <path d="M12 3.5l7.4 4.25v8.5L12 20.5l-7.4-4.25v-8.5z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  Plante: (
    <>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" />
      <path d="M5 19l7.5-7.5" />
    </>
  ),
  Feu: <path d="M12 3c1 3.6 4.6 5.2 4.6 9.6a4.6 4.6 0 0 1-9.2 0c0-2 1-3.3 2-4.3.3 1.4 1 2.2 1.8 2.5C11 8.6 11 5.6 12 3z" />,
  Vol: (
    <>
      <path d="M3.5 15.5c5.5 0 9.500-2.500 12.500-8 1.500 4.500.5 8-2 10.500" />
      <path d="M3.5 15.5c2.500 2.300 6.500 3.200 10.500 2.500" />
      <path d="M8 13.500c3-.6 5.200-2.200 7-4.500" />
    </>
  ),
  Électrik: <path d="M13.500 3L6 13.500h5L10 21l8-11h-5.200z" />,
  Psy: (
    <>
      <path d="M3 12c2.500-4 5.500-6 9-6s6.500 2 9 6c-2.500 4-5.500 6-9 6s-6.500-2-9-6z" />
      <circle cx="12" cy="12" r="2.600" />
    </>
  ),
};

export function TypeIcon({ type, size = '1.25rem' }: { type: string; size?: string }) {
  const theme = TYPE_THEME[type] ?? TYPE_THEME.Eau;
  return (
    <span
      className="pk-type-icon"
      style={{ width: size, height: size, background: `linear-gradient(145deg, ${theme.color}, ${theme.deep})` }}
      title={`Type ${type}`}
    >
      <svg viewBox="0 0 24 24" width="66%" height="66%" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {GLYPH[type] ?? GLYPH.Eau}
      </svg>
    </span>
  );
}

const STAR_PATH = 'M12 2.6L15.06 8.39L21.51 9.51L16.95 14.21L17.88 20.69L12 17.8L6.12 20.69L7.05 14.21L2.49 9.51L8.94 8.39Z';

/** Étoile de jeu : dodue, contour épais, dégradé or et reflet (zéro émoji). */
export function StarIcon({ filled = true, className = '' }: { filled?: boolean; className?: string }) {
  const id = useId();
  if (!filled) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d={STAR_PATH} fill="#dfe6ea" stroke="#a9b7bf" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff489" />
          <stop offset="0.45" stopColor="#ffcf24" />
          <stop offset="1" stopColor="#ff9500" />
        </linearGradient>
      </defs>
      {/* socle sombre décalé : donne l'épaisseur */}
      <path d={STAR_PATH} transform="translate(0 1.3)" fill="#6b3500" stroke="#6b3500" strokeWidth="2.6" strokeLinejoin="round" />
      <path d={STAR_PATH} fill={`url(#${id})`} stroke="#6b3500" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 5.6l1.9 3.9 4.2.7" fill="none" stroke="#fffbd1" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <ellipse cx="8.6" cy="10.4" rx="1.5" ry="0.8" transform="rotate(-28 8.6 10.4)" fill="#fff" opacity="0.95" />
    </svg>
  );
}

/** Emblème du jeu : soleil levant sur les vagues du lagon. */
export function LagoonEmblem({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="24" cy="24" r="21" />
      <path d="M15 24a9 9 0 0 1 18 0" />
      <path d="M24 9v3M13.400 13.400l2.100 2.100M34.600 13.400l-2.100 2.100" />
      <path d="M8 28c2.700-2.400 5.300-2.400 8 0s5.300 2.400 8 0 5.300-2.400 8 0 5.300 2.400 8 0" />
      <path d="M11 34c2.200-2 4.300-2 6.500 0s4.300 2 6.500 0 4.300-2 6.500 0 4.300 2 6.500 0" />
    </svg>
  );
}
