import { POKEMON_CARDS } from './data.generated';
import type { PokemonCardData } from './types';

export const CARD_BY_ID: Record<string, PokemonCardData> = Object.fromEntries(POKEMON_CARDS.map((c) => [c.id, c]));

/** Cartouche créateur : « Dessin : Maxime », « Dessin : Maxime B. » ou « Dessin : Élève CM2 ». */
export function signature(card: PokemonCardData): string {
  if (!card.firstName) return 'Dessin : Élève CM2';
  return `Dessin : ${card.firstName}${card.lastInitial ? ` ${card.lastInitial}.` : ''}`;
}

// Couleurs de cadre par type élémentaire.
export const TYPE_THEME: Record<string, { color: string; deep: string }> = {
  Eau: { color: '#1596c9', deep: '#0b5f8f' },
  Roche: { color: '#b08a55', deep: '#7a5c33' },
  Acier: { color: '#7f8f9c', deep: '#51606c' },
  Plante: { color: '#3fa565', deep: '#23733f' },
  Feu: { color: '#ea5f2d', deep: '#b33b12' },
  Vol: { color: '#6fa9dc', deep: '#3f77ad' },
  Électrik: { color: '#e5b10b', deep: '#a87c00' },
  Psy: { color: '#d9558f', deep: '#a02f66' },
};
