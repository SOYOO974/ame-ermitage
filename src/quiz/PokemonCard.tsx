import { useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { Image as ImageIcon, Pencil, Sparkles } from 'lucide-react';
import type { PokemonCardData } from './types';
import { signature, TYPE_THEME } from './cards';
import { LagoonEmblem, StarIcon, TypeIcon } from './icons';

const RARITY_STARS: Record<string, number> = {
  'Peu commune': 1,
  Rare: 2,
  'Ultra-Rare': 3,
  'Rareté incroyable': 3,
  'Légendaire du Lagon': 4,
};

const SPARKS = [
  { left: '12%', top: '18%', delay: '0s' },
  { left: '78%', top: '12%', delay: '0.9s' },
  { left: '88%', top: '58%', delay: '1.7s' },
  { left: '30%', top: '70%', delay: '2.3s' },
  { left: '55%', top: '30%', delay: '1.2s' },
  { left: '8%', top: '52%', delay: '2.8s' },
];

interface Props {
  card: PokemonCardData;
  /** Inclinaison 3D au doigt (vue zoomée / cérémonie). Sinon : souris uniquement. */
  interactive?: boolean;
  /** Affiche le bouton « illustration sublimée / dessin original ». */
  showToggle?: boolean;
}

export function PokemonCard({ card, interactive = false, showToggle = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [original, setOriginal] = useState(false);
  const primary = TYPE_THEME[card.types[0]] ?? TYPE_THEME.Eau;
  const secondary = TYPE_THEME[card.types[1] ?? card.types[0]] ?? primary;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive && e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    const max = interactive ? 16 : 9;
    el.style.setProperty('--ry', `${(x - 0.5) * 2 * max}deg`);
    el.style.setProperty('--rx', `${(0.5 - y) * 2 * max}deg`);
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
    el.classList.add('is-live');
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('is-live');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  const stars = RARITY_STARS[card.rarity] ?? 2;
  const showEffects = card.attacks.length <= 2;
  const showDescription = card.attacks.length <= 3;

  return (
    <div className="pk-tilt">
      <div
        ref={ref}
        className={`pk-card${interactive ? ' is-interactive' : ''}`}
        style={{ '--type-a': primary.color, '--type-b': secondary.deep } as CSSProperties}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerUp={(e) => e.pointerType !== 'mouse' && onLeave()}
      >
        <div className="pk-inner">
          <div className="pk-head">
            <span className="pk-name">{card.name}</span>
            <span className="pk-hp">
              <small>PV</small>
              {card.hp}
              <TypeIcon type={card.types[0]} size="6.4cqw" />
            </span>
          </div>

          <div className="pk-art">
            <img src={card.art} alt={`${card.name}, illustration sublimée`} className={original ? 'is-hidden' : ''} draggable={false} />
            <img
              src={card.original}
              alt={`${card.name}, dessin original de l'élève`}
              className={`is-original${original ? '' : ' is-hidden'}`}
              draggable={false}
              loading="lazy"
            />
            {!original && SPARKS.map((s) => <span key={s.left} className="pk-spark" style={{ left: s.left, top: s.top, animationDelay: s.delay }} />)}
            <span className="pk-sign">
              <Pencil strokeWidth={1.8} />
              {signature(card)}
            </span>
            {showToggle && (
              <button
                type="button"
                className="pk-toggle"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setOriginal((v) => !v);
                }}
              >
                {original ? <Sparkles strokeWidth={1.8} /> : <ImageIcon strokeWidth={1.8} />}
                {original ? 'Illustration sublimée' : 'Dessin original'}
              </button>
            )}
          </div>

          <div className="pk-body">
            <div className="pk-types">
              <span>
                {card.types.map((t) => (
                  <TypeIcon key={t} type={t} size="4.6cqw" />
                ))}
                {card.types.join(' · ')}
              </span>
              <span className="pk-rarity" title={card.rarity}>
                {Array.from({ length: stars }, (_, i) => (
                  <StarIcon key={i} />
                ))}
              </span>
            </div>

            <div className="pk-attacks">
              {card.attacks.map((a) => (
                <div key={a.name} className="pk-attack">
                  <div className="pk-attack-row">
                    <span>{a.name}</span>
                    <b>{a.damage > 0 ? a.damage : 'Soin'}</b>
                  </div>
                  {showEffects && <p>{a.effect}</p>}
                </div>
              ))}
            </div>

            {showDescription && <p className="pk-desc">{card.description}</p>}

            <div className="pk-foot">
              <span>
                #{card.number} / 012 · {card.rarity}
              </span>
              <span>AME Ermitage</span>
            </div>
          </div>
        </div>
        <div className="pk-foil" />
        <div className="pk-glare" />
      </div>
    </div>
  );
}

export function CardBack({ number, locked = false, label }: { number?: string; locked?: boolean; label?: string }) {
  return (
    <div className={`pk-back${locked ? ' is-locked' : ''}`}>
      {/* Le contenu vit dans un enfant : les unités cqw ne se résolvent pas sur le conteneur lui-même. */}
      <div className="pk-back-in">
        <LagoonEmblem className="pk-back-emblem" />
        {number && <span className="pk-back-num">#{number}</span>}
        {(label ?? 'Cartes de la classe').trim() && <span className="pk-back-label">{label ?? 'Cartes de la classe'}</span>}
      </div>
    </div>
  );
}
