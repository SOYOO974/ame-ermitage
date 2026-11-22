// Bolides de « La Grande Course du Lagon ».
// Ce sont les bolides qui portent les caractéristiques de course, jamais les personnages des cartes :
// chaque dessin d'élève doit pouvoir gagner. Aucun bolide n'est meilleur que les autres : chacun a
// 9 points à répartir sur trois caractéristiques (le Crabe en a 8 et résiste aux chocs en échange).

import type { Perk } from './raceEngine';

export interface Vehicle {
  id: string;
  name: string;
  /** Une phrase pour l'écran de choix. */
  pitch: string;
  /** Notes de 1 à 5 (3 = moyenne). */
  speed: number;
  start: number;
  turn: number;
  perk: Perk | null;
  /** Forme du bolide en 3D : largeur et longueur de la coque, taille des propulseurs, accessoire. */
  shape: { width: number; length: number; pods: number; extra: 'aucun' | 'rostre' | 'crete' | 'antennes' | 'pinces' };
  /** Livrée : couleurs de la coque, du dessous et des accessoires, aspect (métal, brillant) et motif peint sur la coque. */
  paint: { body: string; deep: string; trim: string; mark: string; lamp: string; metal: number; rough: number; pattern: 'bulles' | 'bande' | 'anneaux' | 'rayures' | 'taches' };
}

export const VEHICLES: Vehicle[] = [
  { id: 'bulle', name: 'La Bulle', pitch: 'Bonne partout : parfaite pour découvrir la course.', speed: 3, start: 3, turn: 3, perk: null, shape: { width: 1, length: 1, pods: 1, extra: 'aucun' }, paint: { body: '#2fc4d6', deep: '#0e7f95', trim: '#ffffff', mark: '#b9f3fa', lamp: '#fff2a8', metal: 0.05, rough: 0.12, pattern: 'bulles' } },
  { id: 'espadon', name: 'L’Espadon', pitch: 'Le plus rapide en ligne droite, mais il lui faut de la place pour tourner.', speed: 5, start: 2, turn: 2, perk: null, shape: { width: 0.8, length: 1.28, pods: 0.9, extra: 'rostre' }, paint: { body: '#2748a8', deep: '#14245c', trim: '#dfe6ee', mark: '#f2674a', lamp: '#9af3ff', metal: 0.7, rough: 0.22, pattern: 'bande' } },
  { id: 'hippocampe', name: 'L’Hippocampe', pitch: 'Il tourne dans un mouchoir : idéal pour les virages serrés.', speed: 2, start: 2, turn: 5, perk: null, shape: { width: 1.02, length: 0.8, pods: 0.8, extra: 'crete' }, paint: { body: '#f5b83d', deep: '#b3640f', trim: '#7a4bc2', mark: '#e0892a', lamp: '#fff2a8', metal: 0.25, rough: 0.35, pattern: 'anneaux' } },
  { id: 'crevette', name: 'La Crevette', pitch: 'Elle bondit au départ et repart très vite après un choc.', speed: 2, start: 5, turn: 2, perk: null, shape: { width: 0.84, length: 0.92, pods: 1.4, extra: 'antennes' }, paint: { body: '#ff8fa3', deep: '#cf4468', trim: '#fff4e0', mark: '#ffffff', lamp: '#fff2a8', metal: 0.1, rough: 0.28, pattern: 'rayures' } },
  { id: 'crabe', name: 'Le Crabe', pitch: 'Sa carapace encaisse : les chocs le gênent moins longtemps.', speed: 2, start: 3, turn: 3, perk: 'solide', shape: { width: 1.28, length: 0.95, pods: 1, extra: 'pinces' }, paint: { body: '#e2452f', deep: '#8a1d18', trim: '#ffd9a8', mark: '#a82a1c', lamp: '#fbd679', metal: 0.15, rough: 0.5, pattern: 'taches' } },
];

export const VEHICLE_BY_ID: Record<string, Vehicle> = Object.fromEntries(VEHICLES.map((v) => [v.id, v]));

/** Réglages de course d'un bolide (multiplicateurs autour de 1). */
export const vehicleTuning = (v: Vehicle) => ({ kart: v.id, speed: 1 + 0.012 * (v.speed - 3), accel: 1 + 0.15 * (v.start - 3), handling: 1 + 0.07 * (v.turn - 3), perk: v.perk });
