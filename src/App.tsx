import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { WorkshopBanner } from './components/WorkshopBanner';
import { IdeaCard } from './components/IdeaCard';
import { IdeaModal } from './components/IdeaModal';
import { ClassroomVotingSection } from './components/ClassroomVotingSection';
import { FaqSection } from './components/FaqSection';
import { PROJECT_IDEAS } from './data/ideas';
import type { ProjectIdea } from './data/ideas';
import { Filter, Sparkles, Calendar, RotateCcw, Vote } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedInvestment, setSelectedInvestment] = useState<string>('all');
  
  // Votes state stored in localStorage for persistence across refreshes
  const [votes, setVotes] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('ame_classroom_votes');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeModalIdea, setActiveModalIdea] = useState<ProjectIdea | null>(null);

  useEffect(() => {
    localStorage.setItem('ame_classroom_votes', JSON.stringify(votes));
  }, [votes]);

  const handleAddVote = (id: string) => {
    setVotes((prev) => {
      const current = prev[id] || 0;
      return { ...prev, [id]: current + 1 };
    });

    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.8 }
    });
  };

  const handleRemoveVote = (id: string) => {
    setVotes((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const handleResetVotes = () => {
    if (window.confirm("Voulez-vous vraiment remettre tous les votes à zéro ?")) {
      setVotes({});
    }
  };

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

  // Determine which idea is leading
  let leadingId: string | null = null;
  let maxVotes = 0;
  PROJECT_IDEAS.forEach(idea => {
    const v = votes[idea.id] || 0;
    if (v > maxVotes) {
      maxVotes = v;
      leadingId = idea.id;
    }
  });

  const categories = [
    { id: 'all', label: 'Toutes les thématiques' },
    { id: 'Jeu & Gamification', label: '🎮 Jeux & Gamification (2)' },
    { id: 'Science & Terrain', label: '🌿 Sciences & Terrain (2)' },
    { id: 'Sensibilisation & Terrain', label: '📢 Sensibilisation (1)' }
  ];

  const investmentFilters: { id: string; label: string; count: number }[] = [
    { id: 'all', label: 'Tous les formats', count: PROJECT_IDEAS.length },
    { id: '1 séance', label: '⚡ 1 séance Express', count: PROJECT_IDEAS.filter(i => i.classroomInvestment === '1 séance').length },
    { id: '2 à 3 séances', label: '🌱 2 à 3 séances', count: PROJECT_IDEAS.filter(i => i.classroomInvestment === '2 à 3 séances').length },
    { id: 'Fil rouge (4+ séances)', label: '🏆 Fil rouge (4+ séances)', count: PROJECT_IDEAS.filter(i => i.classroomInvestment === 'Fil rouge (4+ séances)').length }
  ];

  const filteredIdeas = PROJECT_IDEAS.filter(idea => {
    const matchCategory = selectedCategory === 'all' || idea.category === selectedCategory;
    const matchInvestment = selectedInvestment === 'all' || idea.classroomInvestment === selectedInvestment;
    return matchCategory && matchInvestment;
  });

  const isFiltered = selectedCategory !== 'all' || selectedInvestment !== 'all';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16">
      {/* Top Header */}
      <Header />

      {/* Workshop timeline banner */}
      <WorkshopBanner />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
              <Sparkles className="w-4 h-4" />
              Sélection Officielle de Madame Pavillon
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Les 5 Projets Soumis au Vote des Élèves
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Explorez les 5 cartes ci-dessous. En classe, utilisez les boutons <strong>+</strong> pour enregistrer les votes à main levée !
            </p>
          </div>

          {/* Classroom voting indicator pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold self-start md:self-auto shadow-sm">
            <Vote className="w-4 h-4 text-teal-600" />
            <span>Total classe : {totalVotes} voix enregistrée{totalVotes > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Filters Container */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm mb-8 space-y-4">
          {/* Filter 1: Temps d'ateliers en classe */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider shrink-0 min-w-[170px]">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Temps en classe :</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
              {investmentFilters.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => setSelectedInvestment(inv.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                    selectedInvestment === inv.id
                      ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {inv.label}
                  <span className="ml-1.5 opacity-60 text-[11px]">({inv.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter 2: Thématique */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider shrink-0 min-w-[170px]">
              <Filter className="w-4 h-4 text-teal-600" />
              <span>Thématique :</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-700/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              {isFiltered && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedInvestment('all');
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 underline font-medium ml-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Counter if filtered */}
        {isFiltered && (
          <div className="mb-4 text-xs text-slate-500 font-medium">
            Affichage de <strong>{filteredIdeas.length}</strong> projet{filteredIdeas.length > 1 ? 's' : ''} sur 5 selon vos filtres.
          </div>
        )}

        {/* Grid of the 5 Project Cards */}
        {filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                votes={votes[idea.id] || 0}
                totalVotes={totalVotes}
                isLeading={leadingId === idea.id}
                onAddVote={handleAddVote}
                onRemoveVote={handleRemoveVote}
                onOpenModal={(i) => setActiveModalIdea(i)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-slate-500 text-sm">Aucun projet ne correspond à cette combinaison de filtres.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedInvestment('all');
              }}
              className="mt-3 text-xs font-bold text-teal-700 hover:underline"
            >
              Afficher les 5 projets
            </button>
          </div>
        )}

        {/* Live Classroom Voting Results Section */}
        <ClassroomVotingSection
          ideas={PROJECT_IDEAS}
          votes={votes}
          onResetVotes={handleResetVotes}
        />

        {/* Modal for viewing detailed idea info with Previous / Next navigation */}
        <IdeaModal
          idea={activeModalIdea}
          isOpen={activeModalIdea !== null}
          onClose={() => setActiveModalIdea(null)}
          votes={activeModalIdea ? (votes[activeModalIdea.id] || 0) : 0}
          onAddVote={(id) => {
            handleAddVote(id);
          }}
          onPrev={() => {
            const idx = activeModalIdea ? filteredIdeas.findIndex(i => i.id === activeModalIdea.id) : -1;
            if (idx > 0) {
              setActiveModalIdea(filteredIdeas[idx - 1]);
            } else if (idx === 0) {
              setActiveModalIdea(filteredIdeas[filteredIdeas.length - 1]);
            }
          }}
          onNext={() => {
            const idx = activeModalIdea ? filteredIdeas.findIndex(i => i.id === activeModalIdea.id) : -1;
            if (idx >= 0 && idx < filteredIdeas.length - 1) {
              setActiveModalIdea(filteredIdeas[idx + 1]);
            } else if (idx === filteredIdeas.length - 1) {
              setActiveModalIdea(filteredIdeas[0]);
            }
          }}
          hasPrev={filteredIdeas.length > 1}
          hasNext={filteredIdeas.length > 1}
          currentIndex={activeModalIdea ? filteredIdeas.findIndex(i => i.id === activeModalIdea.id) : 0}
          totalIdeas={filteredIdeas.length}
        />

        {/* FAQ Section */}
        <FaqSection />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 text-center px-4 mt-12">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-slate-300 font-medium">
            Projet Aire Marine Éducative (AME) • École de l'Ermitage-les-Bains • Saint-Gilles-les-Bains (La Réunion)
          </p>
          <p className="text-slate-500">
            Sélection officielle de la classe de CM2 de Madame Pavillon • Accompagnement numérique bénévole par Julien Vanwinsberghe
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
