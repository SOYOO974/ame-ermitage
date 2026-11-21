// Illustrations des objets de la course, affichées dans la case d'objet (en haut à gauche de l'écran).
import type { ReactElement } from 'react';
import type { ItemKind } from './raceEngine';

const Coral = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <ellipse cx="32" cy="55" rx="19" ry="5.5" fill="#e7cf97" />
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M32 54V34M32 40l-11-9M21 31l-4-10M21 31l-9 1M32 34l1-17M33 24l-6-7M32 42l12-8M44 34l3-12M44 34l9 2M47 26l6-4" stroke="#b8452e" strokeWidth="9" />
      <path d="M32 54V34M32 40l-11-9M21 31l-4-10M21 31l-9 1M32 34l1-17M33 24l-6-7M32 42l12-8M44 34l3-12M44 34l9 2M47 26l6-4" stroke="#f6846b" strokeWidth="5.5" />
      <path d="M30 50V37M19 29l-2-5M32 31l1-11M45 31l2-6" stroke="#ffc2ad" strokeWidth="1.8" />
    </g>
  </svg>
);

const Ink = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M20 46a12 12 0 0 1-3-23 14 14 0 0 1 26-5 11 11 0 0 1 8 19 10 10 0 0 1-10 12c-4 6-16 5-21-3z" fill="#2a1750" />
    <path d="M22 41a8 8 0 0 1-1-14 10 10 0 0 1 19-4 8 8 0 0 1 6 13" fill="#4a2c86" />
    <circle cx="27" cy="31" r="4.6" fill="#fff" />
    <circle cx="39" cy="31" r="4.6" fill="#fff" />
    <circle cx="28" cy="32" r="2.2" fill="#160a2e" />
    <circle cx="40" cy="32" r="2.2" fill="#160a2e" />
    <path d="M17 52c0 3 4 3 4 0s-2-5-2-5-2 2-2 5zM44 55c0 3 4 3 4 0s-2-5-2-5-2 2-2 5z" fill="#2a1750" />
  </svg>
);

const Current = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 24c7-8 15-8 22 0s15 8 22 0" stroke="#0f8d9a" strokeWidth="9" />
      <path d="M8 24c7-8 15-8 22 0s15 8 22 0" stroke="#5fd9d2" strokeWidth="5" />
      <path d="M8 44c7-8 15-8 22 0s15 8 22 0" stroke="#0f8d9a" strokeWidth="9" />
      <path d="M8 44c7-8 15-8 22 0s15 8 22 0" stroke="#5fd9d2" strokeWidth="5" />
      <path d="M44 14l12 10-12 10" stroke="#b98a26" strokeWidth="8" />
      <path d="M44 14l12 10-12 10" stroke="#fbd679" strokeWidth="4.5" />
    </g>
  </svg>
);

const Bubble = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <radialGradient id="rg-bulle" cx="38%" cy="32%" r="75%">
        <stop offset="0" stopColor="#f2fdff" />
        <stop offset="0.55" stopColor="#9fe6f7" />
        <stop offset="1" stopColor="#3aa7c6" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="33" r="24" fill="url(#rg-bulle)" stroke="#0f8d9a" strokeWidth="3" />
    <path d="M17 26a17 17 0 0 1 13-11" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    <circle cx="19" cy="34" r="2.4" fill="#fff" />
    <path d="M32 22l9 3.5v7.5c0 6-4 10-9 12-5-2-9-6-9-12v-7.5z" fill="#fff" fillOpacity="0.85" stroke="#0f8d9a" strokeWidth="2.2" strokeLinejoin="round" />
  </svg>
);

const Urchin = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <ellipse cx="32" cy="57" rx="18" ry="4.5" fill="#e7cf97" />
    <g stroke="#1c1230" strokeWidth="3.2" strokeLinecap="round">
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const len = i % 2 ? 22 : 26;
        return <line key={i} x1="32" y1="36" x2={32 + Math.cos(a) * len} y2={36 + Math.sin(a) * len} />;
      })}
    </g>
    <circle cx="32" cy="36" r="13" fill="#3a2a5c" stroke="#1c1230" strokeWidth="2.5" />
    <circle cx="27" cy="31" r="3.4" fill="#7a63b8" />
  </svg>
);

const SHOAL: [number, number, string][] = [
  [41, 15, '#3f9bff'],
  [23, 32, '#fbd679'],
  [44, 48, '#3f9bff'],
];

const Shoal = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <g fill="none" stroke="#bfefff" strokeWidth="2.6" strokeLinecap="round">
      <path d="M4 15h10M2 32h7M6 48h11" />
    </g>
    {SHOAL.map(([x, y, color]) => (
      <g key={y} transform={`translate(${x} ${y})`} stroke="#06324a" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M-11 0l-9-7v14z" fill={color} />
        <ellipse rx="12.5" ry="7.5" fill={color} />
        <circle cx="6.5" cy="-1.8" r="1.7" fill="#06324a" stroke="none" />
      </g>
    ))}
  </svg>
);

const Turtle = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <g stroke="#1f5a34" strokeWidth="2.2" strokeLinejoin="round">
      <ellipse cx="14" cy="25" rx="11" ry="4.8" transform="rotate(-32 14 25)" fill="#9fcf7a" />
      <ellipse cx="50" cy="25" rx="11" ry="4.8" transform="rotate(32 50 25)" fill="#9fcf7a" />
      <ellipse cx="19" cy="51" rx="6.5" ry="3.6" transform="rotate(35 19 51)" fill="#9fcf7a" />
      <ellipse cx="45" cy="51" rx="6.5" ry="3.6" transform="rotate(-35 45 51)" fill="#9fcf7a" />
      <circle cx="32" cy="12" r="6.5" fill="#9fcf7a" />
      <ellipse cx="32" cy="35" rx="14.5" ry="18" fill="#3f9a5c" />
    </g>
    <path d="M32 22l8 6v12l-8 7-8-7V28z" fill="#63c777" stroke="#1f5a34" strokeWidth="1.6" strokeLinejoin="round" />
    <circle cx="29.5" cy="10.5" r="1.3" fill="#06324a" />
    <circle cx="34.5" cy="10.5" r="1.3" fill="#06324a" />
  </svg>
);

export const ITEM_ART: Record<ItemKind, () => ReactElement> = { corail: Coral, encre: Ink, oursin: Urchin, bulle: Bubble, banc: Shoal, courant: Current, tortue: Turtle };
