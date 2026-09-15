import React, { useState } from 'react';
import { Heart, Copy, Check, Trash2, MessageCircle } from 'lucide-react';
import type { ProjectIdea } from '../data/ideas';

interface SelectionBarProps {
  selectedIdeas: ProjectIdea[];
  onRemoveIdea: (id: string) => void;
  onClearAll: () => void;
}

export const SelectionBar: React.FC<SelectionBarProps> = ({
  selectedIdeas,
  onRemoveIdea,
  onClearAll
}) => {
  const [copied, setCopied] = useState(false);

  if (selectedIdeas.length === 0) return null;

  const summaryText = `Bonjour Julien ! Voici ma sélection d'idées pour l'AME (classe de CM2) :\n\n` +
    selectedIdeas.map((idea, index) => `${index + 1}. ${idea.title} (${idea.subtitle})`).join('\n') +
    `\n\nOn pourra présenter ces idées aux élèves lors de l'atelier d'1h pour les faire débattre et voter. À très vite !`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(summaryText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-4 sm:p-6 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-teal-500/30 pointer-events-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
        {/* Left info & chips */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500 text-white">
              <Heart className="w-4 h-4 fill-current" />
            </span>
            <span className="font-bold text-sm sm:text-base">
              Votre sélection pour le vote des élèves ({selectedIdeas.length} idée{selectedIdeas.length > 1 ? 's' : ''})
            </span>
            <span className="text-xs text-teal-300 font-medium hidden sm:inline">
              • 2 à 3 idées recommandées pour l'atelier
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {selectedIdeas.map((idea) => (
              <span
                key={idea.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-xs text-teal-100"
              >
                <span>{idea.title}</span>
                <button
                  onClick={() => onRemoveIdea(idea.id)}
                  className="hover:text-rose-400 p-0.5 rounded"
                  title="Retirer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <button
            onClick={onClearAll}
            title="Tout désélectionner"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-all border border-white/15"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copié !' : 'Copier ma sélection'}</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-900/50 active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Envoyer à Julien</span>
          </button>
        </div>
      </div>
    </div>
  );
};
