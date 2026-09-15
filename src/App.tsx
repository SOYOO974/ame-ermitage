import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { WorkshopBanner } from './components/WorkshopBanner';
import { IdeaCard } from './components/IdeaCard';
import { IdeaModal } from './components/IdeaModal';
import { SelectionBar } from './components/SelectionBar';
import { FaqSection } from './components/FaqSection';
import { PROJECT_IDEAS } from './data/ideas';
import type { ProjectIdea } from './data/ideas';
import { Filter, Sparkles, Heart } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('ame_selected_ideas');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeModalIdea, setActiveModalIdea] = useState<ProjectIdea | null>(null);

  useEffect(() => {
    localStorage.setItem('ame_selected_ideas', JSON.stringify(selectedIds));
  }, [selectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const isAlready = prev.includes(id);
      if (!isAlready) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.85 }
        });
        return [...prev, id];
      } else {
        return prev.filter((item) => item !== id);
      }
    });
  };

  const removeIdea = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const clearAll = () => {
    setSelectedIds([]);
  };

  const categories = [
    { id: 'all', label: 'Toutes les idées (10)' },
    { id: 'Jeu & Gamification', label: '🎮 Jeux & Gamification (3)' },
    { id: 'IA & Détection', label: '🤖 IA & Scanner (1)' },
    { id: 'Science & Terrain', label: '🌿 Sciences & Terrain (3)' },
    { id: 'Sensibilisation & Création', label: '📢 Sensibilisation & Musique (3)' }
  ];

  const filteredIdeas = selectedCategory === 'all' 
    ? PROJECT_IDEAS 
    : PROJECT_IDEAS.filter(idea => idea.category === selectedCategory);

  const selectedIdeasObjects = PROJECT_IDEAS.filter(idea => selectedIds.includes(idea.id));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24">
      {/* Top Header */}
      <Header />

      {/* Workshop timeline banner */}
      <WorkshopBanner />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        {/* Section Title & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
              <Sparkles className="w-4 h-4" />
              Catalogue d'idées pour l'AME
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              10 Pistes Créatives & Numériques
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Cliquez sur une carte pour voir les détails pédagogiques, ou sur le cœur pour l'ajouter à votre sélection pour l'atelier.
            </p>
          </div>

          {/* Selection indicator pill */}
          {selectedIds.length > 0 && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold self-start md:self-auto">
              <Heart className="w-4 h-4 fill-current text-rose-500" />
              <span>{selectedIds.length} idée{selectedIds.length > 1 ? 's' : ''} sélectionnée{selectedIds.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Categories Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2 shrink-0 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrer :</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid of Idea Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              isSelected={selectedIds.includes(idea.id)}
              onToggleSelect={toggleSelect}
              onOpenModal={(i) => setActiveModalIdea(i)}
            />
          ))}
        </div>

        {/* Modal for viewing detailed idea info */}
        <IdeaModal
          idea={activeModalIdea}
          isOpen={activeModalIdea !== null}
          onClose={() => setActiveModalIdea(null)}
          isSelected={activeModalIdea ? selectedIds.includes(activeModalIdea.id) : false}
          onToggleSelect={toggleSelect}
        />

        {/* FAQ Section */}
        <FaqSection />
      </main>

      {/* Sticky selection bar at bottom */}
      <SelectionBar
        selectedIdeas={selectedIdeasObjects}
        onRemoveIdea={removeIdea}
        onClearAll={clearAll}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 text-center px-4">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-slate-300 font-medium">
            Projet Aire Marine Éducative (AME) • École de l'Ermitage-les-Bains • Saint-Gilles-les-Bains (La Réunion)
          </p>
          <p className="text-slate-500">
            Conçu pour Madame Pavillon et ses élèves de CM2 • Bénévolat & accompagnement numérique par Julien Vanwinsberghe
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
