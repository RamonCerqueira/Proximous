import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  X, 
  Sparkles, 
  Coffee, 
  Activity, 
  Film, 
  Gamepad2, 
  GlassWater, 
  Sun, 
  Trophy, 
  Music, 
  Utensils, 
  Palette, 
  Compass, 
  BookOpen, 
  Smile,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const POPULAR_ACTIVITIES = [
  { id: 'coffee', label: 'Cafés', icon: Coffee, count: 18 },
  { id: 'running', label: 'Corrida', icon: Activity, count: 12 },
  { id: 'cinema', label: 'Cinema', icon: Film, count: 16 },
  { id: 'games', label: 'Games', icon: Gamepad2, count: 14 },
  { id: 'drinks', label: 'Drinks & Bar', icon: GlassWater, count: 29 },
  { id: 'beach', label: 'Praia & Sol', icon: Sun, count: 22 },
  { id: 'sports', label: 'Esportes', icon: Trophy, count: 15 },
  { id: 'music', label: 'Shows', icon: Music, count: 20 },
  { id: 'food', label: 'Gastronomia', icon: Utensils, count: 25 },
  { id: 'art', label: 'Arte & Cultura', icon: Palette, count: 9 },
  { id: 'nature', label: 'Trilha & Natureza', icon: Compass, count: 11 },
];

const ActivitySearchHub = ({ selectedCategory, onSelectCategory }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredActivities = POPULAR_ACTIVITIES.filter((act) =>
    act.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCustomSearch = (query) => {
    if (!query.trim()) return;
    onSelectCategory(query.trim().toLowerCase());
  };

  return (
    <div className="luxury-glass-card rounded-2xl p-2.5 border border-border/80 text-foreground transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-left"
        >
          <div className="w-6 h-6 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center">
            <MapPin className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-xs font-black text-foreground block">
              Rolês & Atividades
            </span>
          </div>
          {selectedCategory && (
            <span className="text-[10px] bg-pink-500/20 text-pink-300 font-extrabold px-2 py-0.5 rounded-full border border-pink-500/30">
              {selectedCategory}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          {selectedCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-[10px] text-muted-foreground hover:text-foreground font-bold underline"
            >
              Limpar
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Section */}
      {isOpen && (
        <div className="mt-3 space-y-2.5 pt-2 border-t border-border/60">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar atividade (ex: Skate, Sushi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCustomSearch(searchQuery);
              }}
              className="w-full pl-8 pr-8 py-2 bg-card/60 border border-border/80 rounded-xl text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto scrollbar-none">
            {filteredActivities.map((act) => {
              const ActIcon = act.icon;
              const isSel = selectedCategory === act.id || selectedCategory === act.label.toLowerCase();
              return (
                <button
                  key={act.id}
                  onClick={() => onSelectCategory(isSel ? null : act.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border whitespace-nowrap ${
                    isSel
                      ? 'proximous-button-primary text-white border-purple-500 shadow-md'
                      : 'bg-card/40 border-border/60 text-muted-foreground hover:text-foreground hover:border-purple-500/40'
                  }`}
                >
                  <ActIcon className={`h-3.5 w-3.5 ${isSel ? 'text-white' : 'text-pink-400'}`} />
                  <span>{act.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                    isSel ? 'bg-white/20 text-white' : 'bg-accent text-muted-foreground'
                  }`}>
                    {act.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitySearchHub;
